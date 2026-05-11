import { useGetRequest } from '../interfaces/useRequest';
import { GET_USER } from '../constants/storeKeys';

const useGetUser = (userId: string) => {
  const res = useGetRequest(`/users/${userId}`, GET_USER);
  return res;
};

export default useGetUser;
