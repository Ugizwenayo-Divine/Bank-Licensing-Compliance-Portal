import { BadRequestException } from '@nestjs/common';
import {
  Application,
  ApplicationStatus,
  FINAL_STATUSES,
  VALID_TRANSITIONS,
} from './application.entity';

export function snapshotApplication(app: Application): Record<string, any> {
  return {
    status: app.status,
    reviewerId: app.reviewerId,
    approverId: app.approverId,
    reviewNotes: app.reviewNotes,
    decisionNotes: app.decisionNotes,
    additionalInfoRequest: app.additionalInfoRequest,
    version: app.version,
  };
}

export function assertValidTransition(
  current: ApplicationStatus,
  next: ApplicationStatus,
): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new BadRequestException(
      `Invalid state transition: ${current} -> ${next}. Allowed: [${allowed.join(', ') || 'none'}]`,
    );
  }
}

export function assertNotFinal(app: Application): void {
  if (FINAL_STATUSES.includes(app.status)) {
    throw new BadRequestException(
      `Application ${app.id} is in a final state (${app.status}) and cannot be modified.`,
    );
  }
}
