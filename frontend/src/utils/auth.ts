export const getToken = (label?: string) => {
  return localStorage.getItem(label || 'token');
};

export const setToken = (label: string, value: any) => {
  localStorage.setItem(label, value);
};

export const removeToken = (label: string) => {
  localStorage.removeItem(label);
};

export const isAuthenticated = () => {
  return !!getToken('token');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');

  return user ? JSON.parse(user) : null;
};

export const hasRole = (roles: string[]) => {
  const user = getCurrentUser();

  if (!user) return false;

  return roles.includes(user.role);
};
