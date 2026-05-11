import { usePostRequest } from '../interfaces/useRequest';
import { SUBMIT_APPLICATION } from '../constants/storeKeys';

const useSubmitApplication = (applicationId: string) => {
  const res = usePostRequest(
    `/applications/${applicationId}/submit`,
    SUBMIT_APPLICATION,
  );
  return res;
};

export default useSubmitApplication;
