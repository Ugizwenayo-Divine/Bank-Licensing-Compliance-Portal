import { Layout, Menu } from 'antd';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  AuditOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

import { useLogout } from '../queryHooks/auth/useLogout';
import { UserRole } from '../constants/roles';
import { hasRole } from '../utils/auth';

const { Sider, Content } = Layout;

interface Props {
  children: ReactNode;
}

const MainLayout = ({ children }: Props) => {
  const navigate = useNavigate();
  const logout = useLogout();
  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => {
        navigate('/');
      },
      visible: true,
    },
    {
      key: 'applications',
      icon: <FileTextOutlined />,
      label: 'Applications',
      onClick: () => {
        navigate('/applications');
      },
      visible: true,
    },
    {
      key: 'audit',
      icon: <AuditOutlined />,
      label: 'Audit Logs',
      onClick: () => {
        navigate('/audit');
      },
      visible: hasRole([UserRole.ADMIN]),
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Users',
      onClick: () => {
        navigate('/users');
      },
      visible: hasRole([UserRole.ADMIN, UserRole.APPROVER]),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
      },
      visible: true,
    },
  ];
  return (
    <Layout style={{ maxHeight: '100vh' }}>
      <Sider>
        <div
          style={{
            color: 'white',
            padding: 16,
            fontWeight: 700,
          }}
        >
          Bank Licensing & Compliance Portal
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={items
            ?.filter((item) => item?.visible)
            ?.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: item.onClick,
            }))}
        />
      </Sider>

      <Layout style={{ minHeight: '100vh' }}>
        <Content
          style={{
            background: '#fff',
            padding: 24,
            maxHeight: '100vh',
            overflowY: 'scroll',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
