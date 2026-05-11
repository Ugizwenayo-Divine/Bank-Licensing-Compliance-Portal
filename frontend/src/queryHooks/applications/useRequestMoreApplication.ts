import { usePostRequest } from '../interfaces/useRequest';
import { REQUEST_MORE_APPLICATION } from '../constants/storeKeys';

const useRequestMoreApplication = (applicationId: string) => {
  const res = usePostRequest(
    `/applications/${applicationId}/request-info`,
    REQUEST_MORE_APPLICATION,
  );
  return res;
};

export default useRequestMoreApplication;
