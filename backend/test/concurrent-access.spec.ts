import {
  ApplicationStatus,
  VALID_TRANSITIONS,
} from '../src/applications/application.entity';

describe('Concurrent Access', () => {
  interface MockApplication {
    id: string;
    status: ApplicationStatus;
    version: number;
    applicantId: string;
  }

  let storedApplication: MockApplication;

  function atomicUpdate(
    current: MockApplication,
    expectedVersion: number,
    nextStatus: ApplicationStatus,
  ): { success: boolean; error?: string } {
    if (current.version !== expectedVersion) {
      return {
        success: false,
        error: `OptimisticLockVersionMismatchError: version ${expectedVersion} does not match current version ${current.version}`,
      };
    }

    const allowed = VALID_TRANSITIONS[current.status];
    if (!allowed.includes(nextStatus)) {
      return {
        success: false,
        error: `Invalid transition: ${current.status} -> ${nextStatus}`,
      };
    }

    current.status = nextStatus;
    current.version += 1;

    return { success: true };
  }

  beforeEach(() => {
    storedApplication = {
      id: 'app-concurrent-test',
      status: ApplicationStatus.DRAFT,
      version: 1,
      applicantId: 'user-1',
    };
  });

  it('should allow only one of two concurrent submissions to succeed', () => {
    const readByActor1 = { ...storedApplication };
    const readByActor2 = { ...storedApplication };

    expect(readByActor1.version).toBe(1);
    expect(readByActor2.version).toBe(1);

    const result1 = atomicUpdate(
      storedApplication,
      readByActor1.version,
      ApplicationStatus.SUBMITTED,
    );
    expect(result1.success).toBe(true);
    expect(storedApplication.status).toBe(ApplicationStatus.SUBMITTED);
    expect(storedApplication.version).toBe(2);

    const result2 = atomicUpdate(
      storedApplication,
      readByActor2.version,
      ApplicationStatus.SUBMITTED,
    );
    expect(result2.success).toBe(false);
    expect(result2.error).toMatch(/version/i);

    expect(storedApplication.status).toBe(ApplicationStatus.SUBMITTED);
    expect(storedApplication.version).toBe(2);
  });

  it('should prevent two reviewers from both approving simultaneously', () => {
    storedApplication.status = ApplicationStatus.REVIEWED;
    storedApplication.version = 3;

    const v1 = storedApplication.version;
    const v2 = storedApplication.version;

    const r1 = atomicUpdate(storedApplication, v1, ApplicationStatus.APPROVED);
    expect(r1.success).toBe(true);
    expect(storedApplication.status).toBe(ApplicationStatus.APPROVED);
    expect(storedApplication.version).toBe(4);

    const r2 = atomicUpdate(storedApplication, v2, ApplicationStatus.REJECTED);
    expect(r2.success).toBe(false);

    expect(storedApplication.status).toBe(ApplicationStatus.APPROVED);
    expect(storedApplication.version).toBe(4);
  });

  it('should allow sequential updates when each actor has the current version', () => {
    const r1 = atomicUpdate(storedApplication, 1, ApplicationStatus.SUBMITTED);
    expect(r1.success).toBe(true);

    const r2 = atomicUpdate(
      storedApplication,
      2,
      ApplicationStatus.UNDER_REVIEW,
    );
    expect(r2.success).toBe(true);

    expect(storedApplication.status).toBe(ApplicationStatus.UNDER_REVIEW);
    expect(storedApplication.version).toBe(3);
  });

  it('should maintain version integrity across multiple failed concurrent attempts', () => {
    storedApplication.status = ApplicationStatus.REVIEWED;
    storedApplication.version = 5;

    atomicUpdate(storedApplication, 5, ApplicationStatus.APPROVED);
    expect(storedApplication.version).toBe(6);

    const failures = [
      atomicUpdate(storedApplication, 5, ApplicationStatus.REJECTED),
      atomicUpdate(storedApplication, 5, ApplicationStatus.APPROVED),
      atomicUpdate(storedApplication, 4, ApplicationStatus.REJECTED),
    ];

    for (const f of failures) {
      expect(f.success).toBe(false);
    }

    expect(storedApplication.version).toBe(6);
    expect(storedApplication.status).toBe(ApplicationStatus.APPROVED);
  });
});
