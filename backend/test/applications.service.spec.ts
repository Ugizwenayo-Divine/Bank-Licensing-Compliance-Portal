import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { ApplicationsService } from '../src/applications/applications.service';
import {
  Application,
  ApplicationStatus,
} from '../src/applications/application.entity';
import { AuditService } from '../src/audit/audit.service';
import { UserRole } from '../src/users/user.entity';
import {
  makeMockTransactionManager,
  makeMockTransaction,
  makeApplication,
  makeUser,
} from '../src/utils/test.util';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let appRepo: jest.Mocked<Repository<Application>>;
  let auditService: jest.Mocked<AuditService>;
  let dataSource: jest.Mocked<DataSource>;

  const mockAuditContext = {
    actingUser: makeUser(),
    ipAddress: '127.0.0.1',
    userAgent: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    appRepo = module.get(getRepositoryToken(Application));
    auditService = module.get(AuditService);
    dataSource = module.get(DataSource);
  });

  describe('create', () => {
    it('should create a new application in DRAFT status and audit within the same transaction', async () => {
      const user = makeUser();
      const dto = {
        institutionName: 'New Bank',
        institutionType: 'Commercial',
        businessDescription: 'A new bank',
      };
      const savedApplication = makeApplication({
        status: ApplicationStatus.DRAFT,
      });

      const manager = makeMockTransactionManager(null);
      (manager.create as jest.Mock).mockReturnValue(savedApplication);
      (manager.save as jest.Mock).mockResolvedValue(savedApplication);
      makeMockTransaction(dataSource, manager);

      const result = await service.create(dto, user, mockAuditContext);

      expect(result.status).toBe(ApplicationStatus.DRAFT);
      expect(jest.spyOn(auditService, 'log')).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'APPLICATION_CREATED',
          manager,
        }),
      );
    });

    it('should roll back if the audit log write fails', async () => {
      const user = makeUser();
      const dto = {
        institutionName: 'X',
        institutionType: 'Y',
        businessDescription: 'Z',
      };

      const manager = makeMockTransactionManager(null);
      (manager.create as jest.Mock).mockReturnValue(makeApplication());
      (manager.save as jest.Mock).mockResolvedValue(makeApplication());
      (jest.spyOn(auditService, 'log') as jest.Mock).mockRejectedValueOnce(
        new Error('DB constraint'),
      );

      makeMockTransaction(dataSource, manager);

      await expect(service.create(dto, user, mockAuditContext)).rejects.toThrow(
        'DB constraint',
      );
    });
  });

  describe('submit', () => {
    it('should transition DRAFT -> SUBMITTED and pass manager to audit log', async () => {
      const user = makeUser({ id: 'user-1' });
      const application = makeApplication({
        status: ApplicationStatus.DRAFT,
        applicantId: 'user-1',
      });
      const manager = makeMockTransactionManager(application);
      (manager.save as jest.Mock).mockResolvedValue({
        ...application,
        status: ApplicationStatus.SUBMITTED,
      });
      makeMockTransaction(dataSource, manager);

      const result = await service.submit('app-1', user, mockAuditContext);

      expect(result.status).toBe(ApplicationStatus.SUBMITTED);
      expect(jest.spyOn(auditService, 'log')).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'APPLICATION_SUBMITTED', manager }),
      );
    });

    it('should throw ForbiddenException if a different user tries to submit', async () => {
      const user = makeUser({ id: 'other-user' });
      const application = makeApplication({
        status: ApplicationStatus.DRAFT,
        applicantId: 'user-1',
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.submit('app-1', user, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid transition SUBMITTED -> SUBMITTED', async () => {
      const user = makeUser({ id: 'user-1' });
      const application = makeApplication({
        status: ApplicationStatus.SUBMITTED,
        applicantId: 'user-1',
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.submit('app-1', user, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when application does not exist', async () => {
      const user = makeUser({ id: 'user-1' });
      const manager = makeMockTransactionManager(null);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.submit('nonexistent', user, mockAuditContext),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('makeDecision', () => {
    it('should throw ForbiddenException when approver is the same as reviewer', async () => {
      const reviewerAndApprover = makeUser({
        id: 'reviewer-user',
        role: UserRole.APPROVER,
      });
      const application = makeApplication({
        status: ApplicationStatus.REVIEWED,
        reviewerId: 'reviewer-user',
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.makeDecision(
          'app-1',
          ApplicationStatus.APPROVED,
          { notes: 'Looks good' },
          reviewerAndApprover,
          mockAuditContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow a different approver to make the final decision and audit within the same transaction', async () => {
      const approver = makeUser({
        id: 'approver-user',
        role: UserRole.APPROVER,
      });
      const application = makeApplication({
        status: ApplicationStatus.REVIEWED,
        reviewerId: 'reviewer-user',
      });
      const manager = makeMockTransactionManager(application);
      (manager.save as jest.Mock).mockResolvedValue({
        ...application,
        status: ApplicationStatus.APPROVED,
        approverId: approver.id,
      });
      makeMockTransaction(dataSource, manager);

      const result = await service.makeDecision(
        'app-1',
        ApplicationStatus.APPROVED,
        { notes: 'Approved' },
        approver,
        mockAuditContext,
      );

      expect(result.status).toBe(ApplicationStatus.APPROVED);
      expect(jest.spyOn(auditService, 'log')).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'APPLICATION_APPROVED', manager }),
      );
    });

    it('should throw BadRequestException when trying to approve a DRAFT application', async () => {
      const approver = makeUser({
        id: 'approver-user',
        role: UserRole.APPROVER,
      });
      const application = makeApplication({
        status: ApplicationStatus.DRAFT,
        reviewerId: null,
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.makeDecision(
          'app-1',
          ApplicationStatus.APPROVED,
          { notes: 'Approved' },
          approver,
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not allow re-decision on a final (APPROVED) application', async () => {
      const approver = makeUser({
        id: 'approver-user',
        role: UserRole.APPROVER,
      });
      const application = makeApplication({
        status: ApplicationStatus.APPROVED,
        reviewerId: null,
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.makeDecision(
          'app-1',
          ApplicationStatus.REJECTED,
          { notes: 'Changed mind' },
          approver,
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should allow an applicant to view their own application', async () => {
      const user = makeUser({ id: 'user-1', role: UserRole.APPLICANT });
      appRepo.findOne.mockResolvedValue(
        makeApplication({ applicantId: 'user-1' }),
      );

      const result = await service.findOne('app-1', user);
      expect(result.id).toBe('app-1');
    });

    it("should throw ForbiddenException when applicant tries to view another applicant's application", async () => {
      const user = makeUser({ id: 'other-user', role: UserRole.APPLICANT });
      appRepo.findOne.mockResolvedValue(
        makeApplication({ applicantId: 'user-1' }),
      );

      await expect(service.findOne('app-1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow a REVIEWER to view any application', async () => {
      const user = makeUser({ id: 'reviewer', role: UserRole.REVIEWER });
      appRepo.findOne.mockResolvedValue(
        makeApplication({ applicantId: 'user-1' }),
      );

      await expect(service.findOne('app-1', user)).resolves.toBeDefined();
    });

    it('should allow an APPROVER to view any application', async () => {
      const user = makeUser({ id: 'approver', role: UserRole.APPROVER });
      appRepo.findOne.mockResolvedValue(
        makeApplication({ applicantId: 'user-1' }),
      );

      await expect(service.findOne('app-1', user)).resolves.toBeDefined();
    });
  });

  describe('update restrictions', () => {
    it('should allow update in DRAFT status', async () => {
      const user = makeUser({ id: 'user-1' });
      const application = makeApplication({
        status: ApplicationStatus.DRAFT,
        applicantId: 'user-1',
      });
      const manager = makeMockTransactionManager(application);
      (manager.save as jest.Mock).mockResolvedValue({
        ...application,
        institutionName: 'Updated Bank',
      });
      makeMockTransaction(dataSource, manager);

      const result = await service.update(
        'app-1',
        { institutionName: 'Updated Bank' },
        user,
        mockAuditContext,
      );
      expect(result.institutionName).toBe('Updated Bank');
    });

    it('should allow update in ADDITIONAL_INFO_REQUESTED status', async () => {
      const user = makeUser({ id: 'user-1' });
      const application = makeApplication({
        status: ApplicationStatus.ADDITIONAL_INFO_REQUESTED,
        applicantId: 'user-1',
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.update(
          'app-1',
          { institutionName: 'New Name' },
          user,
          mockAuditContext,
        ),
      ).resolves.not.toThrow();
    });

    it('should NOT allow update when application is UNDER_REVIEW', async () => {
      const user = makeUser({ id: 'user-1' });
      const application = makeApplication({
        status: ApplicationStatus.UNDER_REVIEW,
        applicantId: 'user-1',
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.update(
          'app-1',
          { institutionName: 'New Name' },
          user,
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should NOT allow another user to update an application', async () => {
      const user = makeUser({ id: 'other-user' });
      const application = makeApplication({
        status: ApplicationStatus.DRAFT,
        applicantId: 'user-1',
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await expect(
        service.update(
          'app-1',
          { institutionName: 'New Name' },
          user,
          mockAuditContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass the transaction manager to the audit log on successful update', async () => {
      const user = makeUser({ id: 'user-1' });
      const application = makeApplication({
        status: ApplicationStatus.DRAFT,
        applicantId: 'user-1',
      });
      const manager = makeMockTransactionManager(application);
      makeMockTransaction(dataSource, manager);

      await service.update(
        'app-1',
        { institutionName: 'New Name' },
        user,
        mockAuditContext,
      );

      expect(jest.spyOn(auditService, 'log')).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'APPLICATION_UPDATED', manager }),
      );
    });
  });
});
