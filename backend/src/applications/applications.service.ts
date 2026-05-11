import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { User, UserRole } from '../users/user.entity';
import { AuditService, AuditContext } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import { Application, ApplicationStatus } from './application.entity';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ReviewApplicationDto,
  RequestInfoDto,
  DecisionDto,
} from './dto';
import {
  assertValidTransition,
  snapshotApplication,
} from './applications.helpers';
import { SubmitApplicationDto } from './dto/submit.application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateApplicationDto,
    applicant: User,
    context: AuditContext,
  ): Promise<Application> {
    return this.dataSource.transaction(async (manager) => {
      const application = manager.create(Application, {
        ...dto,
        applicantId: applicant.id,
        status: ApplicationStatus.DRAFT,
      });

      const savedApplication = await manager.save(application);

      await this.auditService.log({
        recordId: savedApplication.id,
        action: AuditAction.APPLICATION_CREATED,
        stateBefore: null,
        stateAfter: snapshotApplication(savedApplication),
        context,
        manager,
      });

      return savedApplication;
    });
  }

  async findAll(
    user: User,
    page = 1,
    paseSize = DEFAULT_PAGE_SIZE,
  ): Promise<[Application[], number]> {
    const qb = this.appRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.applicant', 'applicant')
      .leftJoinAndSelect('app.reviewer', 'reviewer')
      .leftJoinAndSelect('app.approver', 'approver')
      .skip(paseSize * (page > 0 ? page - 1 : 0))
      .take(paseSize)
      .orderBy('app.createdAt', 'DESC');

    if (user.role === UserRole.APPLICANT) {
      qb.where('app.applicantId = :userId', { userId: user.id });
    }

    return qb.getManyAndCount();
  }

  async findOne(id: string, user: User): Promise<Application> {
    const application = await this.appRepo.findOne({
      where: { id },
      relations: ['applicant', 'reviewer', 'approver'],
    });

    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    if (
      user.role === UserRole.APPLICANT &&
      application.applicantId !== user.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    return application;
  }

  async update(
    id: string,
    dto: UpdateApplicationDto,
    user: User,
    context: AuditContext,
  ): Promise<Application> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.lockedOrFail(manager, id);

      if (application.applicantId !== user.id) {
        throw new ForbiddenException(
          'Only the applicant can update their application',
        );
      }

      const editableStatuses = [
        ApplicationStatus.DRAFT,
        ApplicationStatus.ADDITIONAL_INFO_REQUESTED,
      ];
      if (!editableStatuses.includes(application.status)) {
        throw new BadRequestException(
          `Application cannot be edited in status: ${application.status}`,
        );
      }

      const stateBefore = snapshotApplication(application);
      Object.assign(application, dto);
      const updatedApplication = await manager.save(application);

      await this.auditService.log({
        recordId: id,
        action: AuditAction.APPLICATION_UPDATED,
        stateBefore,
        stateAfter: snapshotApplication(updatedApplication),
        context,
        manager,
      });

      return updatedApplication;
    });
  }

  async submit(
    id: string,
    user: User,
    dto: SubmitApplicationDto,
    context: AuditContext,
  ): Promise<Application> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.lockedOrFail(manager, id);

      if (application.applicantId !== user.id) {
        throw new ForbiddenException('Access denied');
      }
      assertValidTransition(application.status, ApplicationStatus.SUBMITTED);

      const stateBefore = snapshotApplication(application);
      application.applicantComment = dto.comment ?? null;
      application.status = ApplicationStatus.SUBMITTED;
      const submittedApplication = await manager.save(application);

      await this.auditService.log({
        recordId: id,
        action: AuditAction.APPLICATION_SUBMITTED,
        stateBefore,
        stateAfter: snapshotApplication(submittedApplication),
        context,
        manager,
      });

      return submittedApplication;
    });
  }

  async startReview(
    id: string,
    reviewer: User,
    context: AuditContext,
  ): Promise<Application> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.lockedOrFail(manager, id);
      assertValidTransition(application.status, ApplicationStatus.UNDER_REVIEW);

      const stateBefore = snapshotApplication(application);
      application.status = ApplicationStatus.UNDER_REVIEW;
      application.reviewerId = reviewer.id;
      const saved = await manager.save(application);

      await this.auditService.log({
        recordId: id,
        action: AuditAction.APPLICATION_UNDER_REVIEW,
        stateBefore,
        stateAfter: snapshotApplication(saved),
        context,
        manager,
      });

      return saved;
    });
  }

  async requestAdditionalInfo(
    id: string,
    dto: RequestInfoDto,
    reviewer: User,
    context: AuditContext,
  ): Promise<Application> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.lockedOrFail(manager, id);
      assertValidTransition(
        application.status,
        ApplicationStatus.ADDITIONAL_INFO_REQUESTED,
      );

      if (application.reviewerId && application.reviewerId !== reviewer.id) {
        throw new ForbiddenException(
          'This application is assigned to another reviewer',
        );
      }

      const stateBefore = snapshotApplication(application);
      application.status = ApplicationStatus.ADDITIONAL_INFO_REQUESTED;
      application.reviewerId = reviewer.id;
      application.additionalInfoRequest = dto.requestedInfo;
      const saved = await manager.save(application);

      await this.auditService.log({
        recordId: id,
        action: AuditAction.APPLICATION_INFO_REQUESTED,
        stateBefore,
        stateAfter: snapshotApplication(saved),
        metadata: { requestedInfo: dto.requestedInfo },
        context,
        manager,
      });

      return saved;
    });
  }

  async completeReview(
    id: string,
    dto: ReviewApplicationDto,
    reviewer: User,
    context: AuditContext,
  ): Promise<Application> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.lockedOrFail(manager, id);
      assertValidTransition(application.status, ApplicationStatus.REVIEWED);

      if (application.reviewerId && application.reviewerId !== reviewer.id) {
        throw new ForbiddenException(
          'This application is assigned to another reviewer',
        );
      }

      const stateBefore = snapshotApplication(application);
      application.status = ApplicationStatus.REVIEWED;
      application.reviewerId = reviewer.id;
      application.reviewNotes = dto.notes;
      const saved = await manager.save(application);

      await this.auditService.log({
        recordId: id,
        action: AuditAction.APPLICATION_REVIEWED,
        stateBefore,
        stateAfter: snapshotApplication(saved),
        metadata: { notes: dto.notes },
        context,
        manager,
      });

      return saved;
    });
  }

  async makeDecision(
    id: string,
    decision: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED,
    dto: DecisionDto,
    approver: User,
    context: AuditContext,
  ): Promise<Application> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.lockedOrFail(manager, id);
      assertValidTransition(application.status, decision);

      if (application.reviewerId && application.reviewerId === approver.id) {
        throw new ForbiddenException(
          'The reviewer of an application cannot also make the final approval decision. ' +
            'Separation of duties is required.',
        );
      }

      const stateBefore = snapshotApplication(application);
      application.status = decision;
      application.approverId = approver.id;
      application.decisionNotes = dto.notes;
      const saved = await manager.save(application);

      const action =
        decision === ApplicationStatus.APPROVED
          ? AuditAction.APPLICATION_APPROVED
          : AuditAction.APPLICATION_REJECTED;

      await this.auditService.log({
        recordId: id,
        action,
        stateBefore,
        stateAfter: snapshotApplication(saved),
        metadata: { decision, notes: dto.notes },
        context,
        manager,
      });

      return saved;
    });
  }

  private async lockedOrFail(
    manager: EntityManager,
    id: string,
  ): Promise<Application> {
    const application = await manager
      .createQueryBuilder(Application, 'app')
      .setLock('pessimistic_write')
      .where('app.id = :id', { id })
      .getOne();

    if (!application)
      throw new NotFoundException(`Application ${id} not found`);
    return application;
  }
}
