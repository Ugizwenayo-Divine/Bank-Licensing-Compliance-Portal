import { Table, Tag, Button, Space } from 'antd';
import Text from 'antd/es/typography/Text';
import getStatusInfo from '../../utils/getStatusInfo';

const UsersTable = ({ data = [] }: { data: Array<Record<string, any>> }) => {
  const users = data || [];

  return (
    <Table
      dataSource={users?.map((item: Record<string, any>) => ({
        ...item,
        name: `${item?.firstName} ${item?.firstName}`,
      }))}
      rowKey="id"
      columns={[
        {
          title: 'Name',
          dataIndex: 'name',
        },
        {
          title: 'Email',
          dataIndex: 'email',
        },
        {
          title: 'Role',
          dataIndex: 'role',
          render: (role) => (
            <Tag color={getStatusInfo(role)?.color}>{role}</Tag>
          ),
        },
        {
          title: 'Active',
          dataIndex: 'isActive',
          render: (status) => (
            <Text strong>{status?.toString() === 'true' ? 'YES' : 'NO'}</Text>
          ),
        },
        {
          title: 'Action',
          render: () => (
            <Space>
              <Button type="link">View</Button>
            </Space>
          ),
        },
      ]}
    />
  );
};

export default UsersTable;
