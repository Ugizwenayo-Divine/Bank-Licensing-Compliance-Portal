import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Typography,
  Steps,
  message,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import useCreateApplication from '../../queryHooks/applications/useCreateApplication';
import useSubmitApplication from '../../queryHooks/applications/useSubmitApplication';
import { getToken } from '../../utils/auth';

const { Title } = Typography;
const { Dragger } = Upload;

const NewApplicationPage = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [applicationId, setApplicationId] = useState<string>('');
  const navigate = useNavigate();
  const { mutateAsync: createApplication, isPending: creating } =
    useCreateApplication();
  const { mutateAsync: submitApplication, isPending: submitting } =
    useSubmitApplication(applicationId);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const getButtonText = () => {
    if (applicationId) return 'Submit';
    return 'Save as draft';
  };
  const onSubmit = (values: Record<string, string>) => {
    const payload = {
      institutionName: values.institutionName,
      institutionType: values.institutionType,
      businessDescription: values.businessDescription ?? 'description',
      registrationNumber: values.registrationNumber ?? '123456',
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      address: values.address ?? 'kigali',
    };
    if (applicationId) {
      submitApplication({ comment: values.comment })
        .then(() => {
          message.success(`Application ${applicationId} submitted`);
          navigate('/applications');
        })
        .catch((err) => {
          messageApi.open({
            type: 'error',
            content: err?.message || 'Unexpected error',
          });
        });
    } else {
      createApplication(payload)
        .then((res) => {
          setApplicationId(() => res?.id);
        })
        .catch((err) => {
          messageApi.open({
            type: 'error',
            content: err?.message || 'Unexpected error',
          });
        });
    }
  };
  return (
    <>
      {contextHolder}
      <div style={{ padding: 24 }}>
        <Title level={3}>New Bank Application</Title>
        <Card style={{ marginBottom: 24 }}>
          <Steps
            current={0}
            items={[
              { title: 'Details' },
              { title: 'Documents' },
              { title: 'Review' },
            ]}
          />
        </Card>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Card title="Institution Information" style={{ marginBottom: 16 }}>
            <Form.Item
              label="Institution Name"
              name="institutionName"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Kigali Commercial Bank" />
            </Form.Item>
            <Form.Item
              label="Institution Type"
              name="institutionType"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'COMMERCIAL', label: 'Commercial Bank' },
                  { value: 'MICROFINANCE', label: 'Microfinance' },
                  { value: 'SAVINGS', label: 'Savings Institution' },
                ]}
              />
            </Form.Item>
          </Card>
          <Card title="Applicant Details" style={{ marginBottom: 16 }}>
            <Form.Item
              label="Email"
              name="contactEmail"
              rules={[{ required: true }]}
            >
              <Input type="email" />
            </Form.Item>
            <Form.Item
              label="Contact Person"
              name="contactPhone"
              rules={[{ required: true }]}
            >
              <Input placeholder="+250780000000" type="tel" />
            </Form.Item>
            <Form.Item
              label="Comment"
              name="comment"
              rules={[{ required: false }]}
            >
              <Input.TextArea />
            </Form.Item>
          </Card>
          {applicationId ? (
            <>
              <Card title="Supporting Documents" style={{ marginBottom: 16 }}>
                <Dragger
                  action={`${import.meta.env.VITE_API_URL}/applications/${applicationId}/documents`}
                  headers={{ Authorization: `Bearer ${getToken()}` }}
                  name="file"
                  multiple={true}
                  beforeUpload={() => {
                    setUploading(true);
                    return true;
                  }}
                  onChange={(info) => {
                    const { status } = info.file;
                    if (status !== 'uploading') {
                      console.log(info.file, info.fileList);
                    }
                    if (status === 'done') {
                      setUploaded(true);
                      message.success(
                        `${info.file.name} file uploaded successfully.`,
                      );
                      setUploading(false);
                    } else if (status === 'error') {
                      setUploaded(false);
                      message.error(
                        info.file.response?.message
                          ? `${info.file.name} file upload failed. ${info.file.response?.message}`
                          : `${info.file.name} file upload failed.`,
                      );
                      setUploading(false);
                    }
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload.
                  </p>
                </Dragger>
              </Card>
            </>
          ) : null}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating || submitting || uploading}
              disabled={
                creating ||
                submitting ||
                uploading ||
                (!!applicationId && !uploaded)
              }
            >
              {getButtonText()}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};
export default NewApplicationPage;
