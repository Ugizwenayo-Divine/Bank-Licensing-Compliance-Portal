import { Card, Col, Row, Statistic } from 'antd';

type Stats = {
  total: number;
  underReview: number;
  reviewed: number;
  approved: number;
  rejected: number;
};
const DashboardStats = ({ stats }: { stats: Stats }) => {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic title="Total Applications" value={stats?.total} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Reviewed" value={stats?.reviewed} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Approved" value={stats?.approved} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Rejected" value={stats?.rejected} />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardStats;
