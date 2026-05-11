import { useGetRequest } from '../interfaces/useRequest';
import { GET_AUDIT_LOGS } from '../constants/storeKeys';

export interface Args {
  page?: number;
  perPage?: number;
}

export default function useGetAllLogs({ page, perPage = 10 }: Args) {
  const res = useGetRequest(
    `/audit?page=${page}&pageSize=${perPage}`,
    [GET_AUDIT_LOGS],
    {
      keepPreviousData: true,
    },
  );
  return res;
}
