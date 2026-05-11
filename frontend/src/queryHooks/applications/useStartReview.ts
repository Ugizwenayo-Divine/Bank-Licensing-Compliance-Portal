import { usePostRequest } from '../interfaces/useRequest';
import { START_REVIEW } from '../constants/storeKeys';

const useStartReview = (applicationId: string) => {
  const res = usePostRequest(
    `/applications/${applicationId}/start-review`,
    START_REVIEW,
  );
  return res;
};

export default useStartReview;
