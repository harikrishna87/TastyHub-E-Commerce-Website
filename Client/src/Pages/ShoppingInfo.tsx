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
  ShoppingCartOutlined,
  InfoCircleOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  SyncOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ShopOutlined,
  GlobalOutlined,
  StarOutlined,
  GiftOutlined,
  LockOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const ShoppingInfo: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const orderingMethods = [
    {
      icon: <GlobalOutlined />,
      title: 'Online Ordering',
      description: 'Order from our website 24/7',
      features: ['Full menu access', 'Real-time tracking', 'Saved preferences']
    },
    {
      icon: <PhoneOutlined />,
      title: 'Phone Orders',
      description: 'Call us to place your order',
      features: ['Personal assistance', 'Custom requests', 'Quick reorders']
    },
    {
      icon: <ShopOutlined />,
      title: 'In-Store Pickup',
      description: 'Order ahead and pickup',
      features: ['Skip the line', 'Fresh preparation', 'Direct interaction']
    }
  ];

  const deliveryZones = [
    { zone: 'Zone 1', area: 'Nellore City Center', time: '30-45 mins', fee: '$2.99', color: '#52c41a' },
    { zone: 'Zone 2', area: 'Surrounding Areas', time: '45-60 mins', fee: '$4.99', color: '#1890ff' },
    { zone: 'Zone 3', area: 'Extended Areas', time: '60-75 mins', fee: '$6.99', color: '#fa8c16' }
  ];

  const paymentMethods = [
    { icon: <CreditCardOutlined />, method: 'Credit/Debit Cards', description: 'Visa, MasterCard, American Express' },
    { icon: <DollarOutlined />, method: 'Digital Wallets', description: 'PayPal, Apple Pay, Google Pay' },
    { icon: <TruckOutlined />, method: 'Cash on Delivery', description: 'Pay when your order arrives' },
    { icon: <GiftOutlined />, method: 'Gift Cards', description: 'Use your TastyHub gift cards' }
  ];

  const orderSteps = [
    { icon: <ShoppingCartOutlined />, title: 'Browse Menu', description: 'Explore our delicious offerings' },
    { icon: <UserOutlined />, title: 'Add to Cart', description: 'Select your favorite items' },
    { icon: <CreditCardOutlined />, title: 'Checkout', description: 'Review and complete payment' },
    { icon: <TruckOutlined />, title: 'Preparation', description: 'We prepare your fresh order' },
    { icon: <CheckCircleOutlined />, title: 'Delivery', description: 'Enjoy your meal!' }
  ];

  const qualityFeatures = [
    { icon: <StarOutlined />, text: 'Fresh ingredients sourced daily', color: '#52c41a' },
    { icon: <SafetyCertificateOutlined />, text: 'Food safety certified kitchen', color: '#1890ff' },
    { icon: <ClockCircleOutlined />, text: 'Made-to-order preparation', color: '#fa8c16' },
    { icon: <LockOutlined />, text: 'Temperature-controlled delivery', color: '#eb2f96' }
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
        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading Shopping Info...</Paragraph>
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
                      <ShoppingCartOutlined />
                      <span>Shopping Info</span>
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
                <ShoppingCartOutlined style={{ fontSize: '40px' }} />
                <Title level={1} style={{ margin: 0, fontSize: '36px' }}>
                  Shopping Information
                </Title>
              </div>

              <Paragraph style={{ fontSize: '16px', marginBottom: 0, marginTop: '8px', color: '#8c8c8c', marginLeft: '52px' }}>
                Everything you need to know about ordering from TastyHub
              </Paragraph>
            </div>

            <div style={{ padding: '0 8px' }}>
              <Alert
                message="Easy Ordering, Fresh Food"
                description="At TastyHub, we make it simple to enjoy delicious, fresh food. Order online, by phone, or visit us in person. We're committed to quality and convenience."
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
                    <ShoppingCartOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      How to Order
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {orderingMethods.map((method, index) => (
                    <Col xs={24} sm={8} key={index}>
                      <div
                        style={{
                          borderRadius: '16px',
                          border: '2px dashed #52c41a',
                          padding: '16px',
                          height: '100%',
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'
                        }}
                      >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div
                            style={{
                              backgroundColor: '#f6ffed',
                              padding: '12px 16px',
                              borderRadius: '50%',
                              color: '#52c41a',
                              fontSize: '24px',
                              display: 'inline-block',
                            }}
                          >
                            {method.icon}
                          </div>

                          <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
                            {method.title}
                          </Title>

                          <Text style={{ fontSize: '14px', color: '#595959' }}>
                            {method.description}
                          </Text>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              flexWrap: 'wrap',
                              gap: '8px',
                              width: '100%',
                            }}
                          >
                            {method.features.map((feature, idx) => (
                              <Tag
                                key={idx}
                                color="green"
                                style={{
                                  fontSize: '12px',
                                  border: '1px dashed',
                                  textAlign: 'center',
                                }}
                              >
                                {feature}
                              </Tag>
                            ))}
                          </div>
                        </Space>

                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <TruckOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Delivery Areas & Times
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {deliveryZones.map((zone, index) => (
                    <Col xs={24} sm={8} key={index}>
                      <Card
                        style={{
                          borderRadius: '16px',
                          border: '1px solid #8c8c8c',
                          padding: '8px',
                          borderTop: `4px solid ${zone.color}`
                        }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Tag color={zone.color} style={{ margin: 0 }}>
                            {zone.zone}
                          </Tag>
                          <Text strong style={{ fontSize: '15px' }}>{zone.area}</Text>
                          <div>
                            <ClockCircleOutlined style={{ color: '#595959', marginRight: '8px' }} />
                            <Text style={{ fontSize: '14px', color: '#595959' }}>{zone.time}</Text>
                          </div>
                          <div>
                            <DollarOutlined style={{ color: '#595959', marginRight: '8px' }} />
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Delivery: {zone.fee}</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Alert
                  message="Free Delivery"
                  description="Enjoy free delivery on orders over $30 in all zones!"
                  type="success"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <CreditCardOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Payment Options
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '8px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <List
                  dataSource={paymentMethods}
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
                        <div>
                          <Text strong style={{ fontSize: '15px' }}>{item.method}</Text>
                          <br />
                          <Text style={{ fontSize: '14px', color: '#595959' }}>{item.description}</Text>
                        </div>
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
                      Order Process
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '8px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Timeline
                  items={orderSteps.map((step, index) => ({
                    dot: step.icon,
                    children: (
                      <div>
                        <Text strong style={{ fontSize: '15px' }}>{step.title}</Text>
                        <br />
                        <Text style={{ fontSize: '14px', color: '#595959' }}>{step.description}</Text>
                      </div>
                    ),
                    color: index < 3 ? 'green' : index === 3 ? 'blue' : 'orange',
                  }))}
                />

                <Alert
                  message="Order Tracking"
                  description="Track your order in real-time from preparation to delivery with SMS and email notifications."
                  type="info"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <StarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Quality Guarantee
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {qualityFeatures.map((feature, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '16px',
                          border: '1px solid #8c8c8c',
                          padding: '16px',
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
                    <ClockCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Operating Hours
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      title="Restaurant Hours"
                      style={{ borderRadius: '8px', height: '160px' }}
                      headStyle={{ backgroundColor: '#f0f2f5', fontSize: '14px' }}
                      hoverable={false}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Monday - Thursday</Text>
                          <Text strong>11:00 AM - 10:00 PM</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Friday - Saturday</Text>
                          <Text strong>11:00 AM - 11:00 PM</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Sunday</Text>
                          <Text strong>12:00 PM - 9:00 PM</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      title="Delivery Hours"
                      style={{ borderRadius: '8px', height: '160px' }}
                      headStyle={{ backgroundColor: '#f0f2f5', fontSize: '14px' }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Monday - Thursday</Text>
                          <Text strong>11:30 AM - 9:30 PM</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Friday - Saturday</Text>
                          <Text strong>11:30 AM - 10:30 PM</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Sunday</Text>
                          <Text strong>12:30 PM - 8:30 PM</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <PhoneOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Contact Information
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '32px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                  Have questions about ordering? Our team is here to help:
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
                        <TeamOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                        <Text strong style={{ fontSize: '16px' }}>TastyHub Customer Service</Text>
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
                            <Text copyable>orders@TastyHub.com</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <PhoneOutlined style={{ color: '#fa8c16' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Phone Orders</Text>
                            <br />
                            <Text copyable>(+91) 99887 76655</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <GlobalOutlined style={{ color: '#722ed1' }} />
                          <div>
                            <Text style={{ fontSize: '14px', color: '#595959' }}>Website</Text>
                            <br />
                            <Text copyable>www.TastyHub.com</Text>
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
                    <ShoppingCartOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Start your delicious journey today!
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

export default ShoppingInfo;