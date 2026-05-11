import { usePostRequest } from '../interfaces/useRequest';
import { REJECT_APPLICATION } from '../constants/storeKeys';

const useRejectApplication = (applicationId: string) => {
  const res = usePostRequest(
    `/applications/${applicationId}/reject`,
    REJECT_APPLICATION,
  );
  return res;
};

export default useRejectApplication;
