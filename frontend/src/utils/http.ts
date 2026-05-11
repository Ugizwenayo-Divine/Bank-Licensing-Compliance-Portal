import axios from 'axios';
import { getToken, removeToken } from './auth';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const requestHandler = (request) => {
  const token = getToken('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
};

const errorHandler = (err: any) => {
  const { statusText, status } = err?.response || {};
  const message = err?.response?.data?.message || err?.message;

  return Promise.reject({
    ...err,
    error: true,
    message: message || statusText,
    data: {
      ...err.response,
      message: message || statusText,
    },
  });
};

export const successHandler = (response) => response;

http.interceptors.request.use((request) => requestHandler(request));

http.interceptors.response.use(
  (response) => successHandler(response),
  (error) => errorHandler(error),
);

export default http;
