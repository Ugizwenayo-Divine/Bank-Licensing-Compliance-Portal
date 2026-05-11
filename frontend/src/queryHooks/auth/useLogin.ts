import { usePostRequest } from '../interfaces/useRequest';
import { USER_LOGIN } from '../constants/storeKeys';

const useLogin = () => {
  return usePostRequest(`/auth/login`, USER_LOGIN);
};

export default useLogin;
