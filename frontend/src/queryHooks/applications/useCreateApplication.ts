import { usePostRequest } from '../interfaces/useRequest';
import { CREATE_APPLICATION } from '../constants/storeKeys';

const useCreateApplication = () => {
  return usePostRequest(`/applications`, CREATE_APPLICATION);
};

export default useCreateApplication;
