import { usePostRequest } from '../interfaces/useRequest';
import { APPROVE_APPLICATION } from '../constants/storeKeys';

const useApproveApplication = (applicationId: string) => {
  const res = usePostRequest(
    `/applications/${applicationId}/approve`,
    APPROVE_APPLICATION,
  );
  return res;
};

export default useApproveApplication;
