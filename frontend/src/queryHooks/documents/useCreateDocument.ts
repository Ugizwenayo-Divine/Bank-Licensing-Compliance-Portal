import { usePostRequest } from '../interfaces/useRequest';
import { CREATE_DOCUMENT } from '../constants/storeKeys';

const useCreateDocument = (applicationId: string) => {
  return usePostRequest(
    `/applications/${applicationId}/documents`,
    CREATE_DOCUMENT,
    {
      enabled: !!applicationId,
    },
    {
      'Content-Type': 'multipart/form-data',
    },
  );
};

export default useCreateDocument;
