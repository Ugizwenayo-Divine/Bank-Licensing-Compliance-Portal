import { Layout, Typography, Button, Spin } from 'antd';
import { useState } from 'react';
import ApplicationsTable, {
  type Pagination,
} from '../../components/applications/ApplicationsTable';
import { useNavigate } from 'react-router-dom';
import useGetAllApplications from '../../queryHooks/applications/useGetAllApplications';

const { Content } = Layout;
const { Title } = Typography;

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
  });
  const {
    data = {},
    isFetching,
    isLoading,
  } = useGetAllApplications({
    page: pagination.page,
    perPage: pagination.pageSize,
  });
  if (isFetching || isLoading) {
    return <Spin size="large" fullscreen />;
  }
  return (
    <Layout style={{ padding: 24 }}>
      <Content>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Title level={3}>Applications</Title>
          <Button type="primary" onClick={() => navigate('/applications/new')}>
            New Application
          </Button>
        </div>
        <ApplicationsTable
          data={data?.data}
          pagination={pagination}
          setPagination={setPagination}
        />
      </Content>
    </Layout>
  );
};
export default ApplicationsPage;
