import { Layout } from 'antd';
import { useState } from 'react';

import DashboardStats from '../../components/dashboard/DashboardStats';
import ApplicationsTable, {
  type Pagination,
} from '../../components/applications/ApplicationsTable';
import useGetAllApplications from '../../queryHooks/applications/useGetAllApplications';
import {
  APPROVED,
  REJECTED,
  REVIEWED,
  UNDER_REVIEW,
} from '../../constants/applicationStatus';

const { Content } = Layout;

const DashboardPage = () => {
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
  });
  const { data = {} } = useGetAllApplications({
    page: pagination.page,
    perPage: pagination.pageSize,
  });

  return (
    <Layout style={{ padding: 24 }}>
      <Content>
        <h1>Dashboard</h1>

        <DashboardStats
          stats={{
            total: data?.data?.length ?? 0,
            underReview:
              data?.data?.filter(
                (item: Record<string, any>) => item?.status === UNDER_REVIEW,
              )?.length ?? 0,
            reviewed:
              data?.data?.filter(
                (item: Record<string, any>) => item?.status === REVIEWED,
              )?.length ?? 0,
            approved:
              data?.data?.filter(
                (item: Record<string, any>) => item?.status === APPROVED,
              )?.length ?? 0,
            rejected:
              data?.data?.filter(
                (item: Record<string, any>) => item?.status === REJECTED,
              )?.length ?? 0,
          }}
        />

        <div style={{ marginTop: 24 }}>
          <ApplicationsTable
            data={data?.data}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default DashboardPage;
