import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '../../utils/http';

type RequestOption = {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  [key: string]: any;
};

export const useGetRequest = (
  url: string,
  STORE_KEY: string | any[],
  options?: RequestOption,
) =>
  useQuery({
    queryKey: [STORE_KEY],
    queryFn: async () => {
      try {
        const res = await http.get(url);
        return res.data;
      } catch (err) {
        const error = (Array.isArray(err) ? err[0] || {} : err || {}) as {
          [key: string]: string;
        };
        options?.onError?.(error);
        return await Promise.reject(error);
      }
    },
    ...options,
  });

export const usePostRequest = (
  url: string,
  STORE_KEY: string | string[],
  options: RequestOption = {},
  headers?: Record<string, any>,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useMutation({
    mutationFn: async (values: unknown = {}) => {
      try {
        const res = await http.post(url, values, headers);
        return res.data;
      } catch (err) {
        return await Promise.reject(err);
      }
    },
    onSuccess: onSuccess,
    onError: onError,
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [STORE_KEY] });
      }
    },
    ...rest,
  });
};

export const useUpdateRequest = (
  url: string,
  STORE_KEY: string | any[],
  options: RequestOption = {},
) => {
  const queryClient = useQueryClient();
  const { onError, onSuccess, ...rest } = options;

  return useMutation({
    mutationFn: async (data: unknown) => {
      try {
        const res = await http.put(url, data);
        return res.data;
      } catch (err) {
        return await Promise.reject(err);
      }
    },
    onError: onError,
    onSuccess: onSuccess,
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [STORE_KEY] });
      }
    },
    ...rest,
  });
};

export const useDeleteRequest = (
  url: string,
  STORE_KEY: string | any[],
  options: RequestOption = {},
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options;

  return useMutation({
    mutationFn: async () => {
      try {
        const res = await http.delete(url);
        return res.data;
      } catch (err) {
        return await Promise.reject(err);
      }
    },
    onSuccess: onSuccess,
    onError: onError,
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [STORE_KEY], exact: true });
      }
    },
    ...rest,
  });
};
export const useUpdateCache = () => {
  const queryClient = useQueryClient();
  return (STORE_KEY: string, data) => {
    const currentData = queryClient.getQueryData([STORE_KEY]);
    const newData = Array.isArray(currentData)
      ? [...data, ...currentData]
      : { ...(currentData as any), ...data };
    queryClient.setQueryData([STORE_KEY], currentData ? newData : data);
  };
};
export const useGetCache = () => {
  const queryClient = useQueryClient();
  return (STORE_KEY: string) => {
    return queryClient.getQueryData([STORE_KEY]);
  };
};
export const useClearAllCache = () => {
  const queryClient = useQueryClient();
  return () => {
    return queryClient.clear();
  };
};
export const useClearCache = () => {
  const queryClient = useQueryClient();
  return (STORE_KEY: string) => {
    return queryClient.invalidateQueries({ queryKey: [STORE_KEY] });
  };
};

export default useGetRequest;
