import {
  Card,
  Row,
  Col,
  Tag,
  Steps,
  Typography,
  Descriptions,
  Divider,
  Table,
  Button,
  Timeline,
  Space,
  Spin,
  message,
  Modal,
  Input,
  Upload,
} from 'antd';
import {
  FilePdfOutlined,
  DownloadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import useGetApplication from '../../queryHooks/applications/useGetApplication';
import useGetAllDocuments from '../../queryHooks/documents/useGetAllDocuments';
import useGetLog from '../../queryHooks/auditLogs/useGetLog';
import useApproveApplication from '../../queryHooks/applications/useApproveApplication';
import useRejectApplication from '../../queryHooks/applications/useRejectApplication';
import useRequestMoreApplication from '../../queryHooks/applications/useRequestMoreApplication';
import useCompleteReviewApplication from '../../queryHooks/applications/useCompleteReviewApplication';
import useSubmitApplication from '../../queryHooks/applications/useSubmitApplication';
import useStartReview from '../../queryHooks/applications/useStartReview';
import getStatusInfo from '../../utils/getStatusInfo';
import { formatDate } from '../../utils/formatDate';
import { useState } from 'react';
import {
  ADDITIONAL_INFO_REQUESTED,
  APPROVED,
  DRAFT,
  REVIEWED,
  SUBMITTED,
  UNDER_REVIEW,
} from '../../constants/applicationStatus';
import { getToken, hasRole } from '../../utils/auth';
import { UserRole } from '../../constants/roles';
import {
  APPROVE,
  REJECT,
  REQUEST_INFO,
  COMPLETE_REVIEW,
} from '../../constants/action';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentDoc, setCurrentDoc] = useState<Record<string, string>>(null);
  const [downloading, setDownloading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [action, setAction] = useState<
    'APPROVE' | 'REJECT' | 'SUBMIT' | 'COMPLETE_REVIEW' | 'REQUEST_INFO'
  >();
  const {
    data: application = {},
    isLoading,
    isFetching,
    refetch,
  } = useGetApplication(id as string);
  const { data: documents = [], refetch: refetchAllDocuments } =
    useGetAllDocuments(id as string);
  const { data: auditLogs = [] } = useGetLog(id as string);
  const { mutateAsync: approveApp } = useApproveApplication(id as string);
  const { mutateAsync: rejectApp } = useRejectApplication(id as string);
  const { mutateAsync: requestMoreInfoApp } = useRequestMoreApplication(
    id as string,
  );
  const { mutateAsync: completeReviewApp } = useCompleteReviewApplication(
    id as string,
  );
  const { mutateAsync: submitApp } = useSubmitApplication(id as string);
  const { mutateAsync: startReview } = useStartReview(id as string);

  const reviewSummary = (application: Record<string, any>) => {
    if (application?.approver) {
      return {
        title: application?.status === APPROVED ? 'Approval' : 'Rejection',
        name: `${application?.approver?.firstName} ${application?.approver?.firstName}`,
      };
    } else if (application?.reviewer) {
      return {
        title: 'Review',
        name: `${application?.reviewer?.firstName} ${application?.reviewer?.lastName}`,
      };
    } else {
      return {
        title: '',
        actor:
          application?.status === SUBMITTED ? 'Submitted by' : 'Created by',
        name: `${application?.applicant?.firstName} ${application?.applicant?.lastName}`,
      };
    }
  };
  const getModalDetails: any = {
    COMPLETE_REVIEW: {
      title: 'Complete Review',
      description: 'Add a review comment before completing this review.',
      placeHolder: 'Enter review comments',
    },

    APPROVE: {
      title: 'Approve Application',
      description:
        'Add a final approval comment before approving this application.',
      placeHolder: 'Enter approval comments',
    },

    REJECT: {
      title: 'Reject Application',
      description: 'Provide a reason for rejecting this application.',
      placeHolder: 'Enter rejection reason',
    },

    REQUEST_INFO: {
      title: 'Request Additional Information',
      description:
        'Specify the additional information or documents required from the applicant.',
      placeHolder: 'Enter requested information details',
    },

    SUBMIT: {
      title: 'Submit Application',
      description:
        'Add an optional comment before submitting this application for review.',
      placeHolder: 'Enter submission comments',
    },
  };
  const handleCompleteReview = async () => {
    try {
      if (action === COMPLETE_REVIEW) {
        await completeReviewApp({
          notes: reviewComment,
        });
      } else if (action === APPROVE) {
        await approveApp({
          notes: reviewComment,
        });
      } else if (action === REJECT) {
        await rejectApp({
          notes: reviewComment,
        });
      } else if (action === REQUEST_INFO) {
        await requestMoreInfoApp({
          requestedInfo: reviewComment,
        });
      } else {
        await submitApp({
          comment: reviewComment,
        });
      }

      refetch();

      setReviewModalOpen(false);

      setReviewComment('');
      navigate('/applications');
    } catch (error: any) {
      message.error(error?.message || 'Failed to complete review');
    }
  };
  const handleStartReview = async () => {
    startReview({})
      .then(() => {
        refetch();
      })
      .catch((error) => {
        message.error(error?.message || 'Failed to start review');
      });
  };

  if (isLoading) {
    return <Spin size="large" fullscreen />;
  }

  return (
    <div style={{ padding: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>
            Application Details
          </Title>
          <Text type="secondary">{application?.id}</Text>
        </div>
        <Tag
          color={getStatusInfo(application?.status)?.color}
          style={{ padding: '6px 12px', borderRadius: '6px' }}
        >
          {application?.status}
        </Tag>
      </div>
      <Card style={{ marginBottom: 12 }}>
        <Steps
          current={getStatusInfo(application?.status)?.step}
          items={[
            { title: 'Submitted' },
            { title: 'Under Review' },
            { title: 'Reviewed' },
            { title: 'Final Decision' },
          ]}
        />
      </Card>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Application Information" style={{ marginBottom: 12 }}>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Application ID">
                {application?.id}
              </Descriptions.Item>
              <Descriptions.Item label="License Type">
                {application?.institutionType}
              </Descriptions.Item>
              <Descriptions.Item label="Institution">
                {application?.institutionName}
              </Descriptions.Item>
              <Descriptions.Item label="Registration no">
                {application?.registrationNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {application?.businessDescription}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted By">
                {`${application?.applicant?.firstName} ${application?.applicant?.lastName}`}
              </Descriptions.Item>
              <Descriptions.Item label="Submission Date">
                {formatDate(application?.createdAt)}
              </Descriptions.Item>
              {application?.applicantComment ? (
                <Descriptions.Item label="Comment">
                  {application?.applicantComment}
                </Descriptions.Item>
              ) : null}
              {application?.additionalInfoRequest ? (
                <Descriptions.Item label="Additional requirements">
                  {application?.additionalInfoRequest}
                </Descriptions.Item>
              ) : null}
              {application?.reviewNotes &&
              hasRole([
                UserRole.ADMIN,
                UserRole.REVIEWER,
                UserRole.APPROVER,
              ]) ? (
                <Descriptions.Item label="Review Notes">
                  {application?.reviewNotes}
                </Descriptions.Item>
              ) : null}
              {application?.reviewer ? (
                <Descriptions.Item label="Reviewed by">
                  {`${application?.reviewer.firstName} ${application?.reviewer.lastName}`}
                </Descriptions.Item>
              ) : null}
              {application?.approver ? (
                <Descriptions.Item label="Approved by">
                  {`${application?.approver.firstName} ${application?.approver.lastName}`}
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="Status">
                <Tag color={getStatusInfo(application?.status)?.color}>
                  {application?.status}
                </Tag>
              </Descriptions.Item>
              {application?.decisionNotes ? (
                <Descriptions.Item label="Decision">
                  {application?.decisionNotes}
                </Descriptions.Item>
              ) : null}
            </Descriptions>
          </Card>
          <Card
            title="Supporting Documents"
            bodyStyle={{
              padding: 12,
            }}
          >
            <Table
              rowKey="id"
              pagination={false}
              dataSource={documents}
              size="middle"
              scroll={{ x: 900 }}
              style={{
                width: '100%',
              }}
              columns={[
                {
                  title: 'Document',
                  dataIndex: 'originalName',
                  ellipsis: true,
                  render: (value) => (
                    <Space
                      size="small"
                      style={{
                        maxWidth: 220,
                      }}
                    >
                      <FilePdfOutlined />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {value}
                      </span>
                    </Space>
                  ),
                },
                {
                  title: 'Version',
                  dataIndex: 'version',
                  width: 90,
                },
                {
                  title: 'Uploaded By',
                  dataIndex: 'uploader',
                  responsive: ['md'],
                  render: (uploader) =>
                    `${uploader?.firstName || ''} ${uploader?.lastName || ''}`,
                },
                {
                  title: 'Uploaded At',
                  dataIndex: 'uploadedAt',
                  responsive: ['lg'],
                  width: 180,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  width: 120,
                  render: (status) => (
                    <Tag color={status === 'VERIFIED' ? 'green' : 'orange'}>
                      {status}
                    </Tag>
                  ),
                },
                {
                  title: 'Action',
                  key: 'action',
                  width: 120,
                  fixed: 'right',
                  render: (_, record: Record<string, string>) => (
                    <Button
                      type="link"
                      size="small"
                      icon={<DownloadOutlined />}
                      loading={record.id === currentDoc?.id && downloading}
                      disabled={downloading}
                      onClick={() => {
                        setDownloading(true);
                        setCurrentDoc(record);
                        fetch(
                          `${import.meta.env.VITE_API_URL}/documents/${record.id}/download`,
                          {
                            headers: { Authorization: `Bearer ${getToken()}` },
                          },
                        )
                          .then((response) => response.blob())
                          .then((data) => {
                            try {
                              const blob = new Blob([data], {
                                type: record.mimeType,
                              });
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', record?.storedName);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              message.error(
                                `Error downloading file: ${error.message}`,
                              );
                            }
                          })
                          .finally(() => setDownloading(false));
                      }}
                    >
                      Download
                    </Button>
                  ),
                },
              ]}
            />
            {hasRole([UserRole.APPLICANT]) &&
            (application?.status === DRAFT ||
              application?.status === ADDITIONAL_INFO_REQUESTED) ? (
              <Dragger
                action={`${import.meta.env.VITE_API_URL}/applications/${application.id}/documents`}
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
                    message.success(
                      `${info.file.name} file uploaded successfully.`,
                    );
                    refetchAllDocuments();
                    setUploading(false);
                  } else if (status === 'error') {
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
            ) : null}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={`${reviewSummary(application)?.title} Summary`}
            style={{ marginBottom: 12 }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={reviewSummary(application)?.actor || 'Assigned to'}
              >
                {reviewSummary(application)?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Compliance Check">
                {application?.status}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {formatDate(application?.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="Audit Trail">
            {auditLogs?.length > 0 ? (
              <Timeline
                items={auditLogs?.map((item: Record<string, any>) => ({
                  children: (
                    <div>
                      <Text style={{ textTransform: 'capitalize' }} strong>
                        {item?.action?.replaceAll('_', ' ')}
                      </Text>
                      <div>
                        <Text type="secondary">{item?.actingUserEmail}</Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          {formatDate(item?.createdAt)}
                        </Text>
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : null}
          </Card>
        </Col>
      </Row>
      <Divider />
      {hasRole([UserRole.APPROVER]) && application?.status === REVIEWED ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <Button
            danger
            onClick={() => {
              setReviewModalOpen(true);
              setAction('REJECT');
            }}
          >
            Reject
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setReviewModalOpen(true);
              setAction('APPROVE');
            }}
          >
            Approve Application
          </Button>
        </div>
      ) : null}
      {hasRole([UserRole.REVIEWER]) &&
      (application?.status === UNDER_REVIEW ||
        application?.status === SUBMITTED) ? (
        application?.status === UNDER_REVIEW ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Button
              disabled={application?.status === REVIEWED}
              onClick={() => {
                setReviewModalOpen(true);
                setAction('REQUEST_INFO');
              }}
            >
              Request More Information
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setReviewModalOpen(true);
                setAction('COMPLETE_REVIEW');
              }}
            >
              Complete Review
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Button
              disabled={application?.status === REVIEWED}
              onClick={handleStartReview}
            >
              Start review
            </Button>
          </div>
        )
      ) : null}
      {hasRole([UserRole.APPLICANT]) &&
      (application?.status === DRAFT ||
        application?.status === ADDITIONAL_INFO_REQUESTED) ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <Button
            type="primary"
            onClick={() => {
              setReviewModalOpen(true);
              setAction('SUBMIT');
            }}
            loading={uploading}
            disabled={uploading}
          >
            Submit
          </Button>
        </div>
      ) : null}

      <Modal
        title={
          getModalDetails[action || 'COMPLETE_REVIEW']?.title ||
          'Complete Review'
        }
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={null}
        centered
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Typography.Text>
            {getModalDetails[action || 'COMPLETE_REVIEW']?.description ||
              'Add review comments before completing this review.'}
          </Typography.Text>

          <Input.TextArea
            rows={5}
            placeholder={
              getModalDetails[action || 'COMPLETE_REVIEW']?.placeHolder ||
              'Enter review comments'
            }
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Button onClick={() => setReviewModalOpen(false)}>Cancel</Button>

            <Button
              type="primary"
              disabled={!reviewComment.trim()}
              onClick={handleCompleteReview}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ApplicationDetailsPage;
