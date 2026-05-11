import { Modal, Form, Input, Select } from 'antd';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: Record<string, any>) => void;
  loading?: boolean;
};

const CreateUserModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}: Props) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const payload = {
      institutionName: values.institutionName,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      position: values.position,
      password: values.password,
    };

    console.log('Creating user:', payload);
    onSubmit?.(payload);
  };

  return (
    <Modal
      title="Create New User"
      open={open}
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      onOk={() => form.submit()}
      okButtonProps={{ loading: loading }}
      okText="Create User"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
