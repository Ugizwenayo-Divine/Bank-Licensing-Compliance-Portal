import { useGetRequest } from '../interfaces/useRequest';
import { GET_APPLICATION } from '../constants/storeKeys';

const useGetApplication = (applicationId: string) => {
  const res = useGetRequest(`/applications/${applicationId}`, GET_APPLICATION);
  return res;
};

export default useGetApplication;
