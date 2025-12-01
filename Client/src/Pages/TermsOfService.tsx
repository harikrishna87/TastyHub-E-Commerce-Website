import React, { useState, useEffect } from 'react';
import {
  Card,
  Breadcrumb,
  Collapse,
  Typography,
  Space,
  Divider,
  Alert,
  List,
  Row,
  Col,
  Spin
} from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ShopOutlined,
  CreditCardOutlined,
  InboxOutlined,
  TruckOutlined,
  UndoOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const TermsOfService: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const termsData = [
    {
      key: '1',
      title: 'Account Registration and Security',
      icon: <UserOutlined />,
      content: {
        description: 'To access certain features of our website, you may need to create an account. You are responsible for:',
        items: [
          'Providing accurate and complete information when creating your account',
          'Maintaining the confidentiality of your account credentials',
          'All activities that occur under your account',
          'Notifying us immediately of any unauthorized use of your account'
        ]
      }
    },
    {
      key: '2',
      title: 'Ordering and Payment',
      icon: <CreditCardOutlined />,
      content: {
        description: 'When placing an order through our website:',
        items: [
          'You agree to provide current, complete, and accurate purchase information',
          'We reserve the right to refuse or cancel your order at any time for reasons including, but not limited to: product availability, errors in product or pricing information, or suspected fraud',
          'We charge your payment method when your order is processed',
          'All payments are processed securely through our payment processors'
        ]
      }
    },
    {
      key: '3',
      title: 'Product Information',
      icon: <InboxOutlined />,
      content: {
        description: 'We strive to provide accurate product descriptions, prices, and availability information. However:',
        items: [
          'We do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free',
          'Images are for illustrative purposes only and may not exactly match the product',
          'We reserve the right to limit quantities of products purchased',
          'Product availability and pricing are subject to change without notice'
        ]
      }
    },
    {
      key: '4',
      title: 'Shipping and Delivery',
      icon: <TruckOutlined />,
      content: {
        description: 'When you place an order:',
        items: [
          'Estimated delivery times are not guaranteed',
          'Risk of loss and title for items purchased pass to you upon delivery',
          'You are responsible for inspecting products upon receipt',
          'We are not liable for delays in delivery due to carrier issues or events beyond our control'
        ]
      }
    },
    {
      key: '5',
      title: 'Returns and Refunds',
      icon: <UndoOutlined />,
      content: {
        description: 'Our return and refund policy:',
        items: [
          'You may return products within 30 days of delivery',
          'Products must be unused and in original packaging',
          'Certain products may be non-returnable (perishable items, personalized items)',
          'Refunds are processed within 5-7 business days after we receive the returned product'
        ]
      }
    }
  ];

  const prohibitedActivities = [
    'Use our trademarks, logos, or other proprietary information without our express written permission',
    'Reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website',
    'Use any automated means to access our website or collect any information from the website',
    'Use our website or content for any commercial purpose'
  ];

  const liabilityItems = [
    'Your access to or use of or inability to access or use the website',
    'Any conduct or content of any third party on the website',
    'Any content obtained from the website',
    'Unauthorized access, use, kurt or alteration of your transmissions or content'
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: '#f5f5f5'
      }}>
        <Spin size="large" style={{ color: '#52c41a' }} />
        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>
          Loading Terms of Service...
        </Paragraph>
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
                      <FileTextOutlined />
                      <span>Terms of Service</span>
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
                <FileTextOutlined style={{ fontSize: '40px' }} />
                <Title level={1} style={{ margin: 0, fontSize: '36px' }}>
                  Terms of Service
                </Title>
              </div>

              <Paragraph style={{ fontSize: '16px', marginBottom: 0, marginTop: '16px', color: '#8c8c8c', marginLeft: '52px' }}>
                These Terms govern your use of the TastyHub website and services.
              </Paragraph>
            </div>

            <div style={{ padding: '0 8px' }}>
              <Alert
                message="Agreement to Terms"
                description="By accessing or using our website, you agree to be bound by these Terms of Service. Please read them carefully."
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                style={{
                  marginBottom: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f'
                }}
              />

              <Card
                title={
                  <Space size="middle">
                    <FileTextOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Terms and Conditions
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Collapse
                  ghost
                  expandIconPosition="end"
                  style={{ backgroundColor: 'transparent' }}
                >
                  {termsData.map((section) => (
                    <Panel
                      key={section.key}
                      header={
                        <Space>
                          <span style={{ color: '#52c41a', fontSize: '18px' }}>
                            {section.icon}
                          </span>
                          <Text strong style={{ fontSize: '16px' }}>
                            {section.key}. {section.title}
                          </Text>
                        </Space>
                      }
                      style={{
                        marginBottom: '16px',
                        backgroundColor: '#fafafa',
                        border: '1px solid #f0f0f0',
                        borderRadius: '16px'
                      }}
                    >
                      <Paragraph style={{ fontSize: '16px', marginBottom: '16px' }}>
                        {section.content.description}
                      </Paragraph>
                      <List
                        dataSource={section.content.items}
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
                                {section.icon}
                              </div>
                              <Text style={{ fontSize: '15px' }}>{item}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </Panel>
                  ))}
                </Collapse>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Intellectual Property
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  The TastyHub website and its original content, features, and functionality are owned by TastyHub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </Paragraph>
                <Alert
                  message="Prohibited Activities"
                  description={
                    <List
                      dataSource={prohibitedActivities}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '12px 0', borderBottom: 'none' }}>
                          <Space align="start" size="middle">
                            <div style={{
                              backgroundColor: '#fff2e8',
                              padding: '8px 12px',
                              borderRadius: '50%',
                              color: '#fa8c16',
                              fontSize: '16px'
                            }}>
                              <InfoCircleOutlined />
                            </div>
                            <Text style={{ fontSize: '15px' }}>{item}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  }
                  type="warning"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  style={{ borderRadius: '16px' }}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <InfoCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Limitation of Liability
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  In no event shall TastyHub, its officers, directors, employees, or agents, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </Paragraph>
                <List
                  dataSource={liabilityItems}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: 'none' }}>
                      <Space align="start" size="middle">
                        <div style={{
                          backgroundColor: '#e6f7ff',
                          padding: '8px 12px',
                          borderRadius: '50%',
                          color: '#1890ff',
                          fontSize: '16px'
                        }}>
                          <InfoCircleOutlined />
                        </div>
                        <Text style={{ fontSize: '15px' }}>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <LockOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Termination
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px' }}>
                  We may terminate or suspend your account and bar access to the website immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </Paragraph>
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
                  If you have any questions about these Terms, please contact our legal team:
                </Paragraph>

                <div
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #d9d9d9',
                    padding: '16px',
                    borderRadius: '16px'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Space>
                        <ShopOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                        <Text strong style={{ fontSize: '16px' }}>TastyHub Legal Team</Text>
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
                            <Text copyable>legal@TastyHub.com</Text>
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

export default TermsOfService;