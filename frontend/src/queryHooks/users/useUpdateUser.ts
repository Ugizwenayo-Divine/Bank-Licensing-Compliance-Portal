import { useUpdateRequest } from '../interfaces/useRequest';
import { UPDATE_USER } from '../constants/storeKeys';

const useUpdateUser = (userId: string) => {
  const res = useUpdateRequest(`/users/${userId}`, UPDATE_USER);
  return res;
};

export default useUpdateUser;
