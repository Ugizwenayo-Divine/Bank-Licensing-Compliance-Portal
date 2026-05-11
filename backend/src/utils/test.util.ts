import { DataSource, EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel.js';
import {
  Application,
  ApplicationStatus,
} from '../applications/application.entity';
import { User, UserRole } from '../users/user.entity';

export function makeMockTransactionManager(
  app: Application | null,
): jest.Mocked<Partial<EntityManager>> {
  return {
    createQueryBuilder: jest.fn().mockReturnValue({
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(app),
    }),
    create: jest
      .fn()
      .mockImplementation((_Entity: any, data: any) => data as unknown),
    save: jest
      .fn()
      .mockImplementation(async (a: Application) => Promise.resolve(a)),
  };
}

export function makeMockTransaction(
  dataSource: jest.Mocked<DataSource>,
  manager: jest.Mocked<Partial<EntityManager>>,
) {
  dataSource.transaction.mockImplementation(
    async <T>(
      fn1: IsolationLevel | ((manager: EntityManager) => Promise<T>),
      fn2?: (manager: EntityManager) => Promise<T>,
    ): Promise<T> => {
      const cb = typeof fn1 === 'function' ? fn1 : fn2!;
      return cb(manager as EntityManager);
    },
  );
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: 'hash',
    role: UserRole.APPLICANT,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function makeApplication(
  overrides: Partial<Application> = {},
): Application {
  return {
    id: 'app-1',
    institutionName: 'Test Bank',
    institutionType: 'Commercial Bank',
    businessDescription: 'A test bank',
    registrationNumber: 'RC-001',
    contactEmail: 'bank@test.com',
    contactPhone: '+1234567890',
    address: '1 Test St',
    status: ApplicationStatus.DRAFT,
    applicantId: 'user-1',
    applicantComment: 'Please review',
    applicant: makeUser(),
    reviewerId: null,
    reviewer: null,
    approverId: null,
    approver: null,
    reviewNotes: null,
    decisionNotes: null,
    additionalInfoRequest: null,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
