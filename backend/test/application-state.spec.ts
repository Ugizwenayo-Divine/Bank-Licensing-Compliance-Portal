import {
  ApplicationStatus,
  VALID_TRANSITIONS,
  FINAL_STATUSES,
} from '../src/applications/application.entity';

describe('Application State', () => {
  describe('Valid Transitions', () => {
    it('should allow DRAFT -> SUBMITTED', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.DRAFT];
      expect(allowed).toContain(ApplicationStatus.SUBMITTED);
    });

    it('should allow SUBMITTED -> UNDER_REVIEW', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.SUBMITTED];
      expect(allowed).toContain(ApplicationStatus.UNDER_REVIEW);
    });

    it('should allow UNDER_REVIEW -> ADDITIONAL_INFO_REQUESTED', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.UNDER_REVIEW];
      expect(allowed).toContain(ApplicationStatus.ADDITIONAL_INFO_REQUESTED);
    });

    it('should allow UNDER_REVIEW -> REVIEWED', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.UNDER_REVIEW];
      expect(allowed).toContain(ApplicationStatus.REVIEWED);
    });

    it('should allow ADDITIONAL_INFO_REQUESTED -> SUBMITTED (re-submission)', () => {
      const allowed =
        VALID_TRANSITIONS[ApplicationStatus.ADDITIONAL_INFO_REQUESTED];
      expect(allowed).toContain(ApplicationStatus.SUBMITTED);
    });

    it('should allow REVIEWED -> APPROVED', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.REVIEWED];
      expect(allowed).toContain(ApplicationStatus.APPROVED);
    });

    it('should allow REVIEWED -> REJECTED', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.REVIEWED];
      expect(allowed).toContain(ApplicationStatus.REJECTED);
    });
  });

  describe('Invalid Transitions', () => {
    it('should NOT allow DRAFT -> APPROVED (skipping states)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.DRAFT];
      expect(allowed).not.toContain(ApplicationStatus.APPROVED);
    });

    it('should NOT allow DRAFT -> REVIEWED', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.DRAFT];
      expect(allowed).not.toContain(ApplicationStatus.REVIEWED);
    });

    it('should NOT allow SUBMITTED -> APPROVED (skipping review)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.SUBMITTED];
      expect(allowed).not.toContain(ApplicationStatus.APPROVED);
    });

    it('should NOT allow SUBMITTED -> REJECTED (skipping review)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.SUBMITTED];
      expect(allowed).not.toContain(ApplicationStatus.REJECTED);
    });

    it('should NOT allow UNDER_REVIEW -> APPROVED (skipping REVIEWED state)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.UNDER_REVIEW];
      expect(allowed).not.toContain(ApplicationStatus.APPROVED);
    });

    it('should NOT allow REVIEWED -> UNDER_REVIEW (backwards)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.REVIEWED];
      expect(allowed).not.toContain(ApplicationStatus.UNDER_REVIEW);
    });

    it('should NOT allow REVIEWED -> SUBMITTED (backwards)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.REVIEWED];
      expect(allowed).not.toContain(ApplicationStatus.SUBMITTED);
    });
  });

  describe('Final States', () => {
    it('should have no valid transitions from APPROVED (final)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.APPROVED];
      expect(allowed).toHaveLength(0);
    });

    it('should have no valid transitions from REJECTED (final)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.REJECTED];
      expect(allowed).toHaveLength(0);
    });

    it('should include APPROVED in FINAL_STATUSES', () => {
      expect(FINAL_STATUSES).toContain(ApplicationStatus.APPROVED);
    });

    it('should include REJECTED in FINAL_STATUSES', () => {
      expect(FINAL_STATUSES).toContain(ApplicationStatus.REJECTED);
    });

    it('should NOT allow APPROVED -> REJECTED (final decision is permanent)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.APPROVED];
      expect(allowed).not.toContain(ApplicationStatus.REJECTED);
    });

    it('should NOT allow REJECTED -> APPROVED (final decision is permanent)', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.REJECTED];
      expect(allowed).not.toContain(ApplicationStatus.APPROVED);
    });

    it('should NOT allow re-submission of a REJECTED application', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.REJECTED];
      expect(allowed).not.toContain(ApplicationStatus.SUBMITTED);
    });

    it('should NOT allow re-submission of an APPROVED application', () => {
      const allowed = VALID_TRANSITIONS[ApplicationStatus.APPROVED];
      expect(allowed).not.toContain(ApplicationStatus.SUBMITTED);
    });
  });

  describe('State Completeness', () => {
    it('should have a transition entry for every ApplicationStatus', () => {
      const allStatuses = Object.values(ApplicationStatus);
      const transitionKeys = Object.keys(VALID_TRANSITIONS);
      expect(transitionKeys.sort()).toEqual(allStatuses.sort());
    });

    it('should only transition to known ApplicationStatus values', () => {
      const allStatuses = new Set(Object.values(ApplicationStatus));
      for (const [_, targets] of Object.entries(VALID_TRANSITIONS)) {
        for (const target of targets) {
          expect(allStatuses.has(target)).toBe(true);
        }
      }
    });
  });
});
