import { useGetRequest } from '../interfaces/useRequest';
import { GET_DOCUMENT } from '../constants/storeKeys';

const useGetDocument = (documentId: string) => {
  const res = useGetRequest(`/documents/${documentId}`, GET_DOCUMENT);
  return res;
};

export default useGetDocument;
