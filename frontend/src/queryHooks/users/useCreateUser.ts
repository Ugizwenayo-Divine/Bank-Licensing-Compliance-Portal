import { usePostRequest } from '../interfaces/useRequest';
import { CREATE_USER } from '../constants/storeKeys';

const useCreateUser = () => {
  return usePostRequest(`/users`, CREATE_USER);
};

export default useCreateUser;
