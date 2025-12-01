import React, { useState, useEffect } from 'react';
import {
  Card,
  Breadcrumb,
  Typography,
  Row,
  Col,
  Space,
  Divider,
  Alert,
  Tag,
  Timeline,
  Spin,
  Button,
  Steps,
  message
} from 'antd';
import {
  HomeOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  HeartOutlined,
  StarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const GiftCards: React.FC = () => {
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

  const giftCardValues = [
    { value: '$25', color: '#52c41a', description: 'Perfect for appetizers' },
    { value: '$50', color: '#1890ff', description: 'Great for main courses' },
    { value: '$100', color: '#fa8c16', description: 'Complete dining experience' },
    { value: '$200', color: '#eb2f96', description: 'Special celebrations' }
  ];

  const features = [
    { icon: <CalendarOutlined />, text: 'No expiration date', color: '#52c41a' },
    { icon: <DollarOutlined />, text: 'No additional fees', color: '#1890ff' },
    { icon: <SyncOutlined />, text: 'Transferable to others', color: '#fa8c16' },
    { icon: <SafetyCertificateOutlined />, text: 'Secure and protected', color: '#eb2f96' },
    { icon: <StarOutlined />, text: 'Perfect for any occasion', color: '#722ed1' },
    { icon: <HeartOutlined />, text: 'Show you care', color: '#f5222d' }
  ];

  const occasions = [
    { title: 'Birthdays', description: 'Celebrate another year of deliciousness' },
    { title: 'Anniversaries', description: 'Mark special moments with great food' },
    { title: 'Graduations', description: 'Reward achievements with tasty treats' },
    { title: 'Holidays', description: 'Share the joy of good food' },
    { title: 'Thank You', description: 'Express gratitude in a meaningful way' },
    { title: 'Just Because', description: 'Surprise someone special' }
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
        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading Gift Cards...</Paragraph>
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
                      <GiftOutlined />
                      <span>Gift Cards</span>
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
                <GiftOutlined style={{ fontSize: '40px' }} />
                <Title level={1} style={{ margin: 0, fontSize: '36px' }}>
                  Gift Cards
                </Title>
              </div>

              <Paragraph style={{ fontSize: '16px', marginBottom: 0, marginTop: '8px', color: '#8c8c8c', marginLeft: '52px' }}>
                Share the gift of great food with your loved ones
              </Paragraph>
            </div>

            <div style={{ padding: '0 8px' }}>
              <Alert
                message="Perfect Gift for Food Lovers"
                description="TastyHub gift cards are the ideal way to treat someone special to an amazing dining experience. Available in multiple denominations and perfect for any occasion."
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
                    <DollarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Available Denominations
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {giftCardValues.map((card, index) => (
                    <Col xs={12} sm={6} key={index}>
                      <div
                        style={{
                          textAlign: 'center',
                          borderRadius: '16px',
                          border: '1px solid #d9d9d9',
                          padding: '16px 12px',
                          borderTop: `4px solid ${card.color}`
                        }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>
                            {card.value}
                          </Text>
                          <Text style={{ fontSize: '12px', color: '#595959', textAlign: 'center' }}>
                            {card.description}
                          </Text>
                          <Button type="primary" size="small" style={{ fontSize: '12px' }}
                            onClick={shownotification}
                          >
                            Buy Now
                          </Button>
                        </Space>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <ShoppingCartOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      How to Use Your Gift Card
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Steps
                  direction="vertical"
                  size="small"
                  current={4}
                  items={[
                    {
                      title: 'Purchase Gift Card',
                      description: 'Buy online or visit any TastyHub location',
                      icon: <ShoppingCartOutlined />,
                    },
                    {
                      title: 'Receive Your Card',
                      description: 'Get your gift card code via email or physical card',
                      icon: <MailOutlined />,
                    },
                    {
                      title: 'Redeem at Checkout',
                      description: 'Present your code when ordering online or in-store',
                      icon: <CreditCardOutlined />,
                    },
                    {
                      title: 'Enjoy Your Meal',
                      description: 'Savor delicious food with your gift card',
                      icon: <CheckCircleOutlined />,
                    },
                  ]}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <StarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Gift Card Features
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {features.map((feature, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '16px',
                          border: '1px solid #d9d9d9',
                          padding: '12px 16px',
                          borderLeft: `4px solid ${feature.color}`
                        }}
                      >
                        <Space align="start" size="middle">
                          <div style={{
                            backgroundColor: `${feature.color}15`,
                            padding: '8px 12px',
                            borderRadius: '50%',
                            color: feature.color,
                            fontSize: '16px'
                          }}>
                            {feature.icon}
                          </div>
                          <Text style={{ fontSize: '15px' }}>{feature.text}</Text>
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
                      Perfect for Every Occasion
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {occasions.map((occasion, index) => (
                    <Col xs={24} sm={12} md={8} key={index}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '1px solid #d9d9d9',
                          padding: '16px',
                        }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Tag color="green" style={{ margin: 0, border: '1px dashed' }}>
                            {occasion.title}
                          </Tag>
                          <Text style={{ fontSize: '14px', color: '#595959' }}>
                            {occasion.description}
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
                    <ClockCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Terms & Conditions
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Timeline
                  items={[
                    {
                      dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />,
                      children: 'Gift cards never expire and have no maintenance fees',
                      color: 'green',
                    },
                    {
                      dot: <CreditCardOutlined style={{ fontSize: '16px' }} />,
                      children: 'Can be used for online orders and in-store purchases',
                      color: 'blue',
                    },
                    {
                      dot: <SyncOutlined style={{ fontSize: '16px' }} />,
                      children: 'Transferable and can be combined with other gift cards',
                      color: 'orange',
                    },
                    {
                      dot: <SafetyCertificateOutlined style={{ fontSize: '16px' }} />,
                      children: 'Protected against unauthorized use when registered',
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
                      Need Help with Gift Cards?
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '32px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  Our customer service team is ready to help with any gift card questions:
                </Paragraph>

                <div
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #d9d9d9',
                    borderRadius: '16px',
                    padding: '30px'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Space>
                        <TeamOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                        <Text strong style={{ fontSize: '16px' }}>TastyHub Gift Card Support</Text>
                      </Space>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={12}>
                        <Space>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          <div style={{ paddingLeft: '8px' }}>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Visit Us</Text>
                            <br />
                            <Text>Any TastyHub location</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <MailOutlined style={{ color: '#52c41a' }} />
                          <div style={{ paddingLeft: '8px' }}>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Email</Text>
                            <br />
                            <Text copyable>giftcards@TastyHub.com</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space >
                          <PhoneOutlined style={{ color: '#fa8c16' }} />
                          <div style={{ paddingLeft: '8px' }}>
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
                <Divider
                  style={{borderColor:'#52c41a'}}
                >
                  <Space>
                    <GiftOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Give the gift of great food today!
                    </Text>
                  </Space>
                </Divider>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      {contextHolder}
    </div>
  );
};

export default GiftCards;