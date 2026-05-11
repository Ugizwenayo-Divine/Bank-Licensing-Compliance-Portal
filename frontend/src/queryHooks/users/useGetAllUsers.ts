import { useGetRequest } from '../interfaces/useRequest';
import { GET_USERS } from '../constants/storeKeys';

const useGetAllUsers = () => {
  const res = useGetRequest('/users', GET_USERS);
  return res;
};

export default useGetAllUsers;
