import { Table, Tag, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

import getStatusInfo from '../../utils/getStatusInfo';
import { formatDate } from '../../utils/formatDate';

export type Pagination = {
  page: number;
  pageSize: number;
};
const ApplicationsTable = ({
  data = [],
  pagination,
  setPagination,
}: {
  data: Array<Record<string, any>>;
  pagination: Pagination;
  setPagination: (val: Pagination) => void;
}) => {
  const navigate = useNavigate();

  const applications = data;

  return (
    <Table
      dataSource={applications}
      rowKey="id"
      size="middle"
      scroll={{ x: 900 }}
      pagination={{
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: data?.meta?.total || 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total) => `Total ${total} records`,
        onChange: (page, pageSize) => {
          setPagination({
            page,
            pageSize,
          });
        },
      }}
      style={{
        borderRadius: 8,
      }}
      columns={[
        {
          title: 'Application ID',
          dataIndex: 'id',
          width: 140,
        },
        {
          title: 'Institution',
          dataIndex: 'institutionName',
          ellipsis: true,
          width: 120,
        },
        {
          title: 'Applicant',
          dataIndex: 'applicant',
          render: (applicant) =>
            `${applicant?.firstName} ${applicant?.lastName}`,
          responsive: ['md'],
          width: 120,
          ellipsis: true,
        },
        {
          title: 'Date',
          dataIndex: 'createdAt',
          render: (date) => formatDate(date),
          width: 120,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          width: 120,
          render: (status) => (
            <Tag color={getStatusInfo(status)?.color}>{status}</Tag>
          ),
        },
        {
          title: 'Action',
          key: 'action',
          width: 100,
          render: (_, record) => (
            <Space>
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/applications/${record.id}`)}
              >
                View
              </Button>
            </Space>
          ),
        },
      ]}
    />
  );
};

export default ApplicationsTable;
