import { useGetRequest } from '../interfaces/useRequest';
import { GET_AUDIT_LOG } from '../constants/storeKeys';

const useGetAuditLog = (applicationId: string) => {
  const res = useGetRequest(
    `/audit/application/${applicationId}`,
    GET_AUDIT_LOG,
  );
  return res;
};

export default useGetAuditLog;
