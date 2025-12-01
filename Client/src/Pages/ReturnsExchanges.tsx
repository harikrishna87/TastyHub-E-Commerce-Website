import { useState, useEffect } from 'react';
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
  Spin,
  Steps,
  Button,
  message
} from 'antd';
import {
  HomeOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  BellOutlined,
  FileProtectOutlined,
  StarOutlined,
  HeartOutlined,
  WarningOutlined,
  CustomerServiceOutlined,
  ShoppingCartOutlined,
  UndoOutlined,
  SwapOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const ReturnsExchanges = () => {
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const shownotification = () => {
    messageApi.info({
      content: "This Feature will be added in UpComing Update",
      duration: 3,
      style: {
        marginTop: '10vh',
      },
    });
  }
  const policyTypes = [
    {
      icon: <UndoOutlined />,
      title: 'Food Quality Issues',
      description: 'Full refund or replacement for quality concerns',
      timeframe: 'Within 2 hours',
      color: '#52c41a'
    },
    {
      icon: <SwapOutlined />,
      title: 'Wrong Order',
      description: 'Immediate replacement or full refund',
      timeframe: 'Within 1 hour',
      color: '#1890ff'
    },
    {
      icon: <ClockCircleOutlined />,
      title: 'Late Delivery',
      description: 'Partial refund or credit for future orders',
      timeframe: 'Delivery time +30 mins',
      color: '#fa8c16'
    },
    {
      icon: <ExclamationCircleOutlined />,
      title: 'Missing Items',
      description: 'Immediate delivery or refund for missing items',
      timeframe: 'Within 2 hours',
      color: '#eb2f96'
    }
  ];

  const refundProcess = [
    {
      title: 'Contact Us',
      description: 'Call, email, or use our online form',
      icon: <PhoneOutlined />,
      status: 'process' as const
    },
    {
      title: 'Issue Review',
      description: 'Our team reviews your concern',
      icon: <FileProtectOutlined />,
      status: 'process' as const
    },
    {
      title: 'Resolution Offer',
      description: 'We provide refund or replacement options',
      icon: <CustomerServiceOutlined />,
      status: 'process' as const
    },
    {
      title: 'Process Complete',
      description: 'Refund processed or new order prepared',
      icon: <CheckCircleOutlined />,
      status: 'finish' as const
    }
  ];

  const eligibleReasons = [
    { icon: <WarningOutlined />, text: 'Food arrived cold or spoiled', severity: 'high' },
    { icon: <ShoppingCartOutlined />, text: 'Incorrect items delivered', severity: 'high' },
    { icon: <ClockCircleOutlined />, text: 'Significant delivery delays', severity: 'medium' },
    { icon: <ExclamationCircleOutlined />, text: 'Missing items from order', severity: 'high' },
    { icon: <StarOutlined />, text: 'Food quality below standards', severity: 'medium' },
    { icon: <SafetyCertificateOutlined />, text: 'Food safety concerns', severity: 'high' }
  ];

  const refundMethods = [
    {
      method: 'Original Payment Method',
      timeframe: '3-5 business days',
      description: 'Refunded to your original card or payment method',
      icon: <DollarOutlined />
    },
    {
      method: 'Store Credit',
      timeframe: 'Immediate',
      description: 'Credit added to your account for future orders',
      icon: <StarOutlined />
    },
    {
      method: 'Gift Card',
      timeframe: 'Immediate',
      description: 'Digital gift card sent via email',
      icon: <HeartOutlined />
    }
  ];

  const satisfactionSteps = [
    {
      dot: <CustomerServiceOutlined style={{ fontSize: '16px' }} />,
      children: 'Customer contacts us with concern',
      color: 'blue',
    },
    {
      dot: <FileProtectOutlined style={{ fontSize: '16px' }} />,
      children: 'Issue documented and reviewed by quality team',
      color: 'orange',
    },
    {
      dot: <HeartOutlined style={{ fontSize: '16px' }} />,
      children: 'Resolution offered based on our satisfaction guarantee',
      color: 'green',
    },
    {
      dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />,
      children: 'Customer satisfaction confirmed and issue resolved',
      color: 'green',
    }
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
        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading Returns & Exchanges...</Paragraph>
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
                    <Space>
                      <HomeOutlined />
                      <span>Home</span>
                    </Space>
                  ),
                },
                {
                  title: (
                    <Space>
                      <SyncOutlined />
                      <span>Returns & Exchanges</span>
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
                <SyncOutlined style={{ fontSize: '40px' }} />
                <Title level={1} style={{ margin: 0, fontSize: '36px' }}>
                  Returns & Exchanges
                </Title>
              </div>

              <Paragraph style={{ fontSize: '16px', marginBottom: 0, marginTop: '8px', color: '#8c8c8c', marginLeft: '52px' }}>
                Your satisfaction is our priority. Learn about our return and exchange policies.
              </Paragraph>
            </div>

            <div style={{ padding: '0 8px' }}>
              <Alert
                message="100% Satisfaction Guarantee"
                description="At TastyHub, we stand behind every meal we serve. If you're not completely satisfied, we'll make it right with a full refund or replacement."
                type="success"
                icon={<SafetyCertificateOutlined />}
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
                    <FileProtectOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Return & Exchange Policies
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {policyTypes.map((policy, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <div
                        style={{
                          height: '180px',
                          borderRadius: '16px',
                          border: '1px solid #d9d9d9',
                          padding: '16px',
                          borderLeft: `4px solid ${policy.color}`
                        }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{
                            backgroundColor: `${policy.color}15`,
                            padding: '8px',
                            borderRadius: '50%',
                            color: policy.color,
                            fontSize: '20px',
                            display: 'inline-block'
                          }}>
                            {policy.icon}
                          </div>
                          <Title level={5} style={{ margin: 0, color: policy.color }}>
                            {policy.title}
                          </Title>
                          <Text style={{ fontSize: '14px', color: '#595959' }}>
                            {policy.description}
                          </Text>
                          <Tag color={policy.color} style={{ fontSize: '12px' }}>
                            {policy.timeframe}
                          </Tag>
                        </Space>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Eligible Return Reasons
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  We accept returns and provide refunds for the following reasons:
                </Paragraph>
                <List
                  dataSource={eligibleReasons}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: 'none' }}>
                      <Space align="start" size="middle">
                        <div style={{
                          backgroundColor: item.severity === 'high' ? '#fff2f0' : '#fff7e6',
                          padding: '8px 12px',
                          borderRadius: '50%',
                          color: item.severity === 'high' ? '#f5222d' : '#fa8c16',
                          fontSize: '16px'
                        }}>
                          {item.icon}
                        </div>
                        <div>
                          <Text style={{ fontSize: '15px' }}>{item.text}</Text>
                          <br />
                          <Tag color={item.severity === 'high' ? 'red' : 'orange'} style={{ fontSize: '12px', marginTop: '4px' }}>
                            {item.severity === 'high' ? 'High Priority' : 'Standard'}
                          </Tag>
                        </div>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <CustomerServiceOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Return Process
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Steps
                  current={4}
                  items={refundProcess}
                  style={{ marginBottom: '20px' }}
                />

                <Alert
                  message="Quick Resolution"
                  description="Most returns are processed within 2 hours during business hours. Emergency food safety issues are handled immediately."
                  type="info"
                  showIcon
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <DollarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Refund Methods
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {refundMethods.map((method, index) => (
                    <Col xs={24} sm={8} key={index}>
                      <div
                        style={{
                          borderRadius: '16px',
                          border: '2px dashed #52c41a',
                          padding: '16px',
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'
                        }}
                      >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div style={{
                            backgroundColor: '#f6ffed',
                            padding: '12px 16px',
                            borderRadius: '50%',
                            color: '#52c41a',
                            fontSize: '20px',
                            display: 'inline-block'
                          }}>
                            {method.icon}
                          </div>
                          <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
                            {method.method}
                          </Title>
                          <Text style={{ fontSize: '14px', color: '#595959', textAlign: 'center' }}>
                            {method.description}
                          </Text>
                          <Tag color="blue" style={{ fontSize: '12px', border: '1px dashed' }}>
                            {method.timeframe}
                          </Tag>
                        </Space>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <HeartOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Customer Satisfaction Process
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  Our commitment to your satisfaction follows a structured process:
                </Paragraph>
                <Timeline items={satisfactionSteps} />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <BellOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Important Notes
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Alert
                    style={{
                      borderRadius: '16px'
                    }}
                    message="Time Sensitive"
                    description="For food safety and quality reasons, returns must be reported within 2 hours of delivery."
                    type="warning"
                    showIcon
                  />
                  <Alert
                    style={{
                      borderRadius: '16px'
                    }}
                    message="Photo Documentation"
                    description="For quality issues, photos help us improve our service and process your return faster."
                    type="info"
                    showIcon
                  />
                  <Alert
                    style={{
                      borderRadius: '16px'
                    }}
                    message="No Questions Asked"
                    description="We believe in making things right. If you're not satisfied, we'll find a solution that works for you."
                    type="success"
                    showIcon
                  />
                </Space>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <PhoneOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Contact Us for Returns
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '32px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  Need to return or exchange an order? Contact our customer service team:
                </Paragraph>

                <div
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #d9d9d9',
                    padding:'16px',
                    borderRadius: '16px'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Space>
                        <TeamOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                        <Text strong style={{ fontSize: '16px' }}>TastyHub Returns Department</Text>
                      </Space>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={12}>
                        <Space>
                          <PhoneOutlined style={{ color: '#f5222d' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Emergency Line</Text>
                            <br />
                            <Text copyable strong>(+91) 99887 76655</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <MailOutlined style={{ color: '#52c41a' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Email Support</Text>
                            <br />
                            <Text copyable strong>returns@TastyHub.com</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Support Hours</Text>
                            <br />
                            <Text strong>24/7 Emergency | 8 AM - 10 PM Regular</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Service Area</Text>
                            <br />
                            <Text strong>Nellore & Surrounding Areas</Text>
                          </div>
                        </Space>
                      </Col>
                    </Row>

                    <Divider style={{ margin: '12px 0' }} />

                    <Space wrap>
                      <Button type="primary" icon={<PhoneOutlined />} size="large" onClick={shownotification}>
                        Call Now
                      </Button>
                      <Button icon={<MailOutlined />} size="large" onClick={shownotification}>
                        Send Email
                      </Button>
                      <Button icon={<CustomerServiceOutlined />} size="large" onClick={shownotification}>
                        Live Chat
                      </Button>
                    </Space>
                  </Space>
                </div>
              </Card>
            </div>
          </div>
        </Col>
      </Row>
      {contextHolder}
    </div>
  );
};

export default ReturnsExchanges;