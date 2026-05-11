import { useGetRequest } from '../interfaces/useRequest';
import { GET_APPLICATIONS } from '../constants/storeKeys';
import type { Args } from '../auditLogs/useGetAllLogs';

const useGetAllApplications = ({ page, perPage = 10 }: Args) => {
  console.log('applications');
  const res = useGetRequest(
    `/applications?page=${page}&pageSize=${perPage}`,
    GET_APPLICATIONS,
  );
  return res;
};

export default useGetAllApplications;
