import { Button, Card, Typography } from 'antd';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import UsersTable from '../../components/users/UsersTable';
import CreateUserModal from '../../components/users/CreateUserModal';
import useGetAllUsers from '../../queryHooks/users/useGetAllUsers';
import useCreateUser from '../../queryHooks/users/useCreateUser';
import { hasRole } from '../../utils/auth';
import { UserRole } from '../../constants/roles';

const { Title } = Typography;

const UsersPage = () => {
  const [open, setOpen] = useState(false);
  const { data: users } = useGetAllUsers();
  const { isPending: loadingCreateUser, mutateAsync: createUser } =
    useCreateUser();
  console.log(users, 'users');

  const handleSubmit = async (data: Record<string, any>) => {
    await createUser(data);
  };

  if (!hasRole([UserRole.ADMIN])) {
    return <Navigate to="/" replace />;
  }
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Title level={3}>User Management</Title>

        <Button type="primary" onClick={() => setOpen(true)}>
          Create User
        </Button>
      </div>

      <Card>
        <UsersTable data={users as any} />
      </Card>

      <CreateUserModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        loading={loadingCreateUser}
      />
    </div>
  );
};

export default UsersPage;
