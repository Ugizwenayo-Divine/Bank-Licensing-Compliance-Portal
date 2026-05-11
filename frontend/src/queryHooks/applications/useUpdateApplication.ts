import { useUpdateRequest } from '../interfaces/useRequest';
import { UPDATE_APPLICATION } from '../constants/storeKeys';

const useUpdateApplication = (applicationId: string) => {
  const res = useUpdateRequest(
    `/applications/${applicationId}`,
    UPDATE_APPLICATION,
  );
  return res;
};

export default useUpdateApplication;
