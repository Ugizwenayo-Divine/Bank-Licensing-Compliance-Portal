import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../../utils/auth';
import useLogin from '../../queryHooks/auth/useLogin';

const { Title } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { mutateAsync, isPending: loading } = useLogin();

  const onSubmit = async (values: any) => {
    return mutateAsync(values)
      .then((data) => {
        setToken('token', data.accessToken);
        setToken(
          'user',
          JSON.stringify({ email: data.user.email, role: data.user.role }),
        );

        navigate('/');
      })
      .catch((err) => {
        messageApi.open({
          type: 'error',
          content: err?.message || 'Unexpected error',
        });
      });
  };

  return (
    <>
      {contextHolder}
      <div
        style={{
          height: '100vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Card style={{ width: 400 }}>
          <Title level={3}>Login</Title>

          <Form layout="vertical" onFinish={onSubmit}>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>

            <Form.Item label="Password" name="password">
              <Input.Password />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              disabled={loading}
            >
              Login
            </Button>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;
