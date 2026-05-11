import {
  APPROVED,
  ADDITIONAL_INFO_REQUESTED,
  DRAFT,
  REJECTED,
  REVIEWED,
  SUBMITTED,
  UNDER_REVIEW,
} from '../constants/applicationStatus';
const getStatusInfo = (status: string) => {
  if (
    ![
      APPROVED,
      ADDITIONAL_INFO_REQUESTED,
      DRAFT,
      REJECTED,
      REVIEWED,
      SUBMITTED,
      UNDER_REVIEW,
    ].includes(status)
  ) {
    return null;
  }
  switch (status) {
    case DRAFT:
      return { step: 0, color: 'default' };
    case SUBMITTED:
      return { step: 1, color: 'gold' };
    case UNDER_REVIEW:
      return { step: 2, color: 'processing' };
    case REVIEWED:
      return { step: 3, color: 'cyan' };
    case ADDITIONAL_INFO_REQUESTED:
      return { step: 4, color: 'warning' };
    case REJECTED:
      return { step: 4, color: 'error' };
    case APPROVED:
      return { step: 4, color: 'success' };

    default:
      break;
  }
};
export default getStatusInfo;
