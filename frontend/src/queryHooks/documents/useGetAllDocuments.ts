import { useGetRequest } from '../interfaces/useRequest';
import { GET_DOCUMENTS } from '../constants/storeKeys';

const useGetAllDocuments = (applicationId: string) => {
  const res = useGetRequest(
    `/applications/${applicationId}/documents`,
    GET_DOCUMENTS,
  );
  return res;
};

export default useGetAllDocuments;
