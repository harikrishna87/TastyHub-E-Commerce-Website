import React, { useState, useEffect } from 'react';
import {
  Card,
  Breadcrumb,
  Typography,
  List,
  Row,
  Col,
  Space,
  Divider,
  Alert,
  Tag,
  Timeline,
  Spin
} from 'antd';
import {
  HomeOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  SyncOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  LockOutlined,
  DatabaseOutlined,
  TeamOutlined,
  BellOutlined,
  SettingOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const informationItems = [
    { icon: <UserOutlined />, text: 'Contact information (name, email, phone number, shipping and billing address)' },
    { icon: <LockOutlined />, text: 'Account credentials (username and password)' },
    { icon: <DatabaseOutlined />, text: 'Payment information (credit card details, billing address)' },
    { icon: <BellOutlined />, text: 'Order history and preferences' },
    { icon: <TeamOutlined />, text: 'Demographic information' },
    { icon: <SettingOutlined />, text: 'Communication preferences' }
  ];

  const usageItems = [
    { icon: <CheckCircleOutlined />, text: 'Process and fulfill your orders' },
    { icon: <UserOutlined />, text: 'Manage your account' },
    { icon: <MailOutlined />, text: 'Send transactional emails and order updates' },
    { icon: <PhoneOutlined />, text: 'Provide customer service' },
    { icon: <BellOutlined />, text: 'Send marketing communications if you\'ve opted in' },
    { icon: <SettingOutlined />, text: 'Improve our website and services' },
    { icon: <SafetyCertificateOutlined />, text: 'Detect and prevent fraud' }
  ];

  const cookieTypes = [
    {
      type: 'Essential cookies',
      description: 'Required for the website to function properly',
      color: '#52c41a'
    },
    {
      type: 'Functional cookies',
      description: 'Remember your preferences and settings',
      color: '#1890ff'
    },
    {
      type: 'Analytical cookies',
      description: 'Help us understand how visitors interact with our website',
      color: '#fa8c16'
    },
    {
      type: 'Marketing cookies',
      description: 'Used to deliver relevant advertisements and track campaign performance',
      color: '#eb2f96'
    }
  ];

  const userRights = [
    { icon: <EyeOutlined />, text: 'Access and receive a copy of your personal information' },
    { icon: <SyncOutlined />, text: 'Rectify inaccurate or incomplete information' },
    { icon: <UserOutlined />, text: 'Request deletion of your personal information' },
    { icon: <SafetyCertificateOutlined />, text: 'Restrict or object to certain processing activities' },
    { icon: <GlobalOutlined />, text: 'Data portability' },
    { icon: <CheckCircleOutlined />, text: 'Withdraw consent at any time' }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <Spin size="large" style={{ color: '#52c41a' }} />
        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading Privacy Policy...</Paragraph>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={24} md={22} lg={20} xl={18}>
          <div
            style={{
              marginBottom: '24px',
              borderRadius: '12px'
            }}
          >
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link to="/">
                      <Space>
                        <HomeOutlined />
                        <span>Home</span>
                      </Space>
                    </Link>
                  ),
                },
                {
                  title: (
                    <Space>
                      <SafetyOutlined />
                      <span>Privacy Policy</span>
                    </Space>
                  ),
                },
              ]}
            />
          </div>

          <div
            style={{
              borderRadius: '12px',
              border: 'none',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                color: '#52c41a',
                padding: '20px 0 30px 0',
                textAlign: 'left'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <SafetyOutlined style={{ fontSize: '40px' }} />
                <Title level={1} style={{ margin: 0, fontSize: '36px' }}>
                  Privacy Policy
                </Title>
              </div>

              <Paragraph style={{ fontSize: '16px', marginBottom: 0, marginTop: '8px', color: '#8c8c8c', marginLeft: '52px' }}>
                Your privacy matters to us. Learn how we protect your data.
              </Paragraph>
            </div>

            <div style={{ padding: '0 8px' }}>
              <Alert
                message="Our Commitment to Privacy"
                description="At TastyHub, we value your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data."
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                style={{
                  marginBottom: '32px',
                  borderRadius: '16px',
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f'
                }}
              />

              <Card
                title={
                  <Space size="middle">
                    <DatabaseOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Information We Collect
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  We collect information that you provide directly to us when you interact with our services:
                </Paragraph>
                <List
                  dataSource={informationItems}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: 'none' }}>
                      <Space align="start" size="middle">
                        <div style={{
                          backgroundColor: '#f6ffed',
                          padding: '8px',
                          borderRadius: '50%',
                          color: '#52c41a',
                          fontSize: '16px'
                        }}>
                          {item.icon}
                        </div>
                        <Text style={{ fontSize: '15px' }}>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <SettingOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      How We Use Your Information
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  We use your information to provide and improve our services:
                </Paragraph>
                <List
                  dataSource={usageItems}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: 'none' }}>
                      <Space align="start" size="middle">
                        <div style={{
                          backgroundColor: '#e6f7ff',
                          padding: '8px',
                          borderRadius: '50%',
                          color: '#1890ff',
                          fontSize: '16px'
                        }}>
                          {item.icon}
                        </div>
                        <Text style={{ fontSize: '15px' }}>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <PieChartOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Cookie Policy
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                  We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.
                </Paragraph>

                <Title level={5} style={{ marginBottom: '16px', color: '#595959' }}>
                  Types of Cookies We Use:
                </Title>

                <Row gutter={[16, 16]}>
                  {cookieTypes.map((cookie, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '16px',
                          padding: '16px',
                          border: '1px solid #d9d9d9',
                          borderLeft: `4px solid ${cookie.color}`
                        }}
                      >
                        <Space direction="vertical" size="small">
                          <Tag color={cookie.color} style={{ margin: 0 }}>
                            {cookie.type}
                          </Tag>
                          <Text style={{ fontSize: '14px', color: '#595959' }}>
                            {cookie.description}
                          </Text>
                        </Space>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Data Security
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Alert
                  message="Your Data is Protected"
                  type="success"
                  icon={<LockOutlined />}
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
                <Paragraph style={{ fontSize: '16px' }}>
                  We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include internal reviews of our data collection, storage, and processing practices and security measures, encryption of data, and physical security measures to guard against unauthorized access to systems where we store personal data.
                </Paragraph>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <UserOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Your Rights
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  Depending on your location, you may have the following rights regarding your personal information:
                </Paragraph>
                <List
                  dataSource={userRights}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: 'none' }}>
                      <Space align="start" size="middle">
                        <div style={{
                          backgroundColor: '#fff2e8',
                          padding: '8px',
                          borderRadius: '50%',
                          color: '#fa8c16',
                          fontSize: '16px'
                        }}>
                          {item.icon}
                        </div>
                        <Text style={{ fontSize: '15px' }}>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <SyncOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Updates to This Policy
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.
                </Paragraph>
                <Timeline
                  items={[
                    {
                      dot: <SyncOutlined style={{ fontSize: '16px' }} />,
                      children: 'Policy updates are clearly marked with revision dates',
                      color: 'green',
                    },
                    {
                      dot: <BellOutlined style={{ fontSize: '16px' }} />,
                      children: 'We encourage regular review of this policy',
                      color: 'blue',
                    },
                    {
                      dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />,
                      children: 'Changes become effective immediately upon posting',
                      color: 'green',
                    },
                  ]}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <PhoneOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Contact Us
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '32px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  If you have any questions about this Privacy Policy, please don't hesitate to contact our privacy team:
                </Paragraph>

                <div
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #d9d9d9',
                    borderRadius: '16px',
                    padding: '16px'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Space>
                        <TeamOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                        <Text strong style={{ fontSize: '16px' }}>TastyHub Privacy Team</Text>
                      </Space>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={12}>
                        <Space>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Address</Text>
                            <br />
                            <Text>1-23 Gourmet Street, Nellore</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <MailOutlined style={{ color: '#52c41a' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Email</Text>
                            <br />
                            <Text copyable>privacy@TastyHub.com</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <PhoneOutlined style={{ color: '#fa8c16' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Phone</Text>
                            <br />
                            <Text copyable>(+91) 99887 76655</Text>
                          </div>
                        </Space>
                      </Col>
                    </Row>
                  </Space>
                </div>
              </Card>

              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Divider style={{borderColor:'#52c41a'}}>
                  <Space>
                    <SyncOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Last Updated: {new Date().toDateString()}
                    </Text>
                  </Space>
                </Divider>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PrivacyPolicy;