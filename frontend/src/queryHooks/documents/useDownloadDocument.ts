import { useGetRequest } from '../interfaces/useRequest';
import { DOWNLOAD_DOCUMENT } from '../constants/storeKeys';

const useDownloadDocument = (documentId: string) => {
  return useGetRequest(`/documents/${documentId}/download`, DOWNLOAD_DOCUMENT, {
    enabled: !!documentId,
  });
};

export default useDownloadDocument;
