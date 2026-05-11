import { RolesGuard } from '../src/common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../src/users/user.entity';

function makeContext(
  user: { role: UserRole } | null,
  requiredRoles: UserRole[] | undefined,
): ExecutionContext {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  };

  const mockContext = {
    reflector,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;

  return mockContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context = makeContext({ role: UserRole.APPLICANT }, undefined);
    (guard as unknown as { reflector: Reflector }).reflector = reflector;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow ADMIN when ADMIN role is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.ADMIN,
    ]);
    const context = makeContext({ role: UserRole.ADMIN }, [UserRole.ADMIN]);
    (guard as unknown as { reflector: Reflector }).reflector = reflector;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny APPLICANT when ADMIN role is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.ADMIN,
    ]);
    const context = makeContext({ role: UserRole.APPLICANT }, [UserRole.ADMIN]);
    (guard as unknown as { reflector: Reflector }).reflector = reflector;
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow REVIEWER when REVIEWER or ADMIN is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.REVIEWER,
      UserRole.ADMIN,
    ]);
    const context = makeContext({ role: UserRole.REVIEWER }, [
      UserRole.REVIEWER,
      UserRole.ADMIN,
    ]);
    (guard as unknown as { reflector: Reflector }).reflector = reflector;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny APPLICANT when REVIEWER or APPROVER is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.REVIEWER,
      UserRole.APPROVER,
    ]);
    const context = makeContext({ role: UserRole.APPLICANT }, [
      UserRole.REVIEWER,
      UserRole.APPROVER,
    ]);
    (guard as unknown as { reflector: Reflector }).reflector = reflector;
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny when user is null (no auth)', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.REVIEWER,
    ]);
    const context = makeContext(null, [UserRole.REVIEWER]);
    (guard as unknown as { reflector: Reflector }).reflector = reflector;
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  describe('Role boundary assertions', () => {
    // const allRoles = Object.values(UserRole);

    it('APPLICANT should be denied REVIEWER-only endpoints', () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        UserRole.REVIEWER,
      ]);
      const context = makeContext({ role: UserRole.APPLICANT }, [
        UserRole.REVIEWER,
      ]);
      (guard as unknown as { reflector: Reflector }).reflector = reflector;
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('APPLICANT should be denied APPROVER-only endpoints', () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        UserRole.APPROVER,
      ]);
      const context = makeContext({ role: UserRole.APPLICANT }, [
        UserRole.APPROVER,
      ]);
      (guard as unknown as { reflector: Reflector }).reflector = reflector;
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('APPLICANT should be denied ADMIN-only endpoints', () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        UserRole.ADMIN,
      ]);
      const context = makeContext({ role: UserRole.APPLICANT }, [
        UserRole.ADMIN,
      ]);
      (guard as unknown as { reflector: Reflector }).reflector = reflector;
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('REVIEWER should be denied APPROVER-only endpoints', () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        UserRole.APPROVER,
      ]);
      const context = makeContext({ role: UserRole.REVIEWER }, [
        UserRole.APPROVER,
      ]);
      (guard as unknown as { reflector: Reflector }).reflector = reflector;
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('APPROVER should be denied REVIEWER-only endpoints', () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        UserRole.REVIEWER,
      ]);
      const context = makeContext({ role: UserRole.APPROVER }, [
        UserRole.REVIEWER,
      ]);
      (guard as unknown as { reflector: Reflector }).reflector = reflector;
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
