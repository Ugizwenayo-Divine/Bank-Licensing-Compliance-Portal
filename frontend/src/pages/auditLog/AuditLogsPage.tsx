import { Card, Table, Tag, Typography, Timeline } from 'antd';
import useGetAllLogs from '../../queryHooks/auditLogs/useGetAllLogs';
import { formatDateTime } from '../../utils/formatDate';
import getStatusInfo from '../../utils/getStatusInfo';
import { useState } from 'react';

const { Title } = Typography;

const AuditLogsPage = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const { data = {} } = useGetAllLogs({
    page: pagination.page,
    perPage: pagination.pageSize,
  });

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Audit Logs</Title>

      <Card
        style={{
          marginBottom: 16,
          borderRadius: 10,
        }}
        bodyStyle={{
          padding: 12,
        }}
      >
        <Table
          dataSource={data?.data || []}
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
            width: '100%',
          }}
          columns={[
            {
              title: 'Audit ID',
              dataIndex: 'id',
              width: 180,
              ellipsis: true,
              responsive: ['lg'],
            },

            {
              title: 'User',
              dataIndex: 'actingUserEmail',
              ellipsis: true,
              render: (email) => (
                <span
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {email}
                </span>
              ),
            },

            {
              title: 'Action',
              dataIndex: 'action',
              width: 180,
              render: (action) => (
                <Tag
                  color={getStatusInfo(action)?.color}
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {action?.replaceAll('_', ' ')?.toUpperCase()}
                </Tag>
              ),
            },

            {
              title: 'Before',
              dataIndex: 'stateBefore',
              responsive: ['md'],
              render: (state) =>
                state?.status ? (
                  <Tag color="default">
                    {state.status.replaceAll('_', ' ').toUpperCase()}
                  </Tag>
                ) : (
                  '-'
                ),
            },

            {
              title: 'After',
              dataIndex: 'stateAfter',
              responsive: ['md'],
              render: (state) =>
                state?.status ? (
                  <Tag color="processing">
                    {state.status.replaceAll('_', ' ').toUpperCase()}
                  </Tag>
                ) : (
                  '-'
                ),
            },

            {
              title: 'Timestamp',
              dataIndex: 'createdAt',
              width: 180,
              render: (date) => (
                <span
                  style={{
                    color: '#595959',
                    fontSize: 13,
                  }}
                >
                  {formatDateTime(date)}
                </span>
              ),
            },
          ]}
        />
      </Card>

      <Card title="Application Timeline">
        <Timeline
          items={data?.data
            ?.filter(
              (log: Record<string, any>) =>
                log?.stateBefore?.status && log?.stateAfter?.status,
            )
            ?.map((log: Record<string, any>) => ({
              children: (
                <div>
                  <strong>{log.user}</strong> — {log.action}
                  <div style={{ fontSize: 12, color: 'gray' }}>
                    {log?.stateBefore?.status} → {log?.stateAfter?.status}
                  </div>
                  <div style={{ fontSize: 12 }}>
                    {formatDateTime(log.createdAt)}
                  </div>
                </div>
              ),
            }))}
        />
      </Card>
    </div>
  );
};

export default AuditLogsPage;
