import { useNavigate } from 'react-router-dom';
import { useClearAllCache } from '../interfaces/useRequest';

import { removeToken } from '../../utils/auth';

export const useLogout = () => {
  const navigate = useNavigate();
  const clearAllCache = useClearAllCache();

  const logout = () => {
    clearAllCache();

    removeToken('token');

    navigate('/login', {
      replace: true,
    });
  };

  return logout;
};
