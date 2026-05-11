import { Card, Form, Input, Select, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const RegistrationPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    const payload = {
      institutionName: values.institutionName,
      institutionAddress: values.institutionAddress,
      admin: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        position: 'ADMIN',
      },
    };

    console.log('Registration payload:', payload);

    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f5f7fa',
        padding: 24,
      }}
    >
      <Card style={{ width: 520 }}>
        <Title level={3}>Institution Registration</Title>
        <Text type="secondary">
          Register your financial institution to access the licensing portal
        </Text>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Institution Name"
            name="institutionName"
            rules={[{ required: true, message: 'Institution is required' }]}
          >
            <Input placeholder="e.g. National Bank of Rwanda" />
          </Form.Item>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Position"
            name="position"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select position"
              options={[
                { value: 'REVIEWER', label: 'Reviewer' },
                { value: 'APPROVER', label: 'Approver' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'ANALYST', label: 'Analyst' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register Institution
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default RegistrationPage;
