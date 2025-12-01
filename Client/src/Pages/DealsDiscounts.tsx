import { useState, useEffect } from 'react';
import {
  Card,
  Breadcrumb,
  Typography,
  Row,
  Col,
  Space,
  Alert,
  Tag,
  Spin,
  Button,
  Progress,
  Statistic,
  message
} from 'antd';
import {
  HomeOutlined,
  FireOutlined,
  PercentageOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const DealsDiscounts = () => {
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

  const navigate = useNavigate();

  const handlenavigatestore = () => {
    navigate('/menu-items')
  }

  const flashDeals = [
    {
      id: 1,
      name: 'Mega Pizza Combo',
      originalPrice: 1299,
      discountPrice: 799,
      discount: 38,
      timeLeft: Date.now() + 1000 * 60 * 60 * 2,
      claimed: 59,
      total: 100,
      type: 'flash',
      description: '2 Large Pizzas + 2 Fruit Juices + 1 Dessert'
    },
    {
      id: 2,
      name: 'Biryani Festival',
      originalPrice: 899,
      discountPrice: 599,
      discount: 33,
      timeLeft: Date.now() + 1000 * 60 * 60 * 4,
      claimed: 104,
      total: 150,
      type: 'flash',
      description: 'Premium Chicken Biryani with Raita & Pickle'
    },
    {
      id: 3,
      name: 'Mega IceCream Combo',
      originalPrice: 1299,
      discountPrice: 799,
      discount: 38,
      timeLeft: Date.now() + 1000 * 60 * 60 * 2,
      claimed: 83,
      total: 100,
      type: 'flash',
      description: '2 Large IceCreams + 1 Fruit Juices + 2 Desserts'
    },
    {
      id: 4,
      name: 'Veg Special',
      originalPrice: 1299,
      discountPrice: 799,
      discount: 38,
      timeLeft: Date.now() + 1000 * 60 * 60 * 2,
      claimed: 75,
      total: 100,
      type: 'flash',
      description: '1 Family Biryani + 1 Paneer Butter Masala + 1 Dessert + 1 IceCream'
    }
  ];

  const couponCodes = [
    {
      code: 'FIRST20',
      discount: 20,
      minOrder: 500,
      description: 'First Order Discount',
      type: 'percentage',
      validTill: '31 Dec 2025'
    },
    {
      code: 'WELCOME50',
      discount: 50,
      minOrder: 1000,
      description: 'Welcome Offer',
      type: 'fixed',
      validTill: '31 Jan 2026'
    },
    {
      code: 'SAVE100',
      discount: 100,
      minOrder: 750,
      description: 'Flat ₹100 Off',
      type: 'fixed',
      validTill: '30 Nov 2025'
    },
    {
      code: 'FEAST25',
      discount: 25,
      minOrder: 1500,
      description: 'Big Order Discount',
      type: 'percentage',
      validTill: '15 Dec 2025'
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
        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading Deals & Discounts...</Paragraph>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {contextHolder}
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
                      <PercentageOutlined />
                      <span>Deals & Discounts</span>
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
                <PercentageOutlined style={{ fontSize: '40px' }} />
                <Title level={1} style={{ margin: 0, fontSize: '36px' }}>
                  Deals & Discounts
                </Title>
              </div>

              <Paragraph style={{ fontSize: '16px', marginBottom: 0, marginTop: '8px', color: '#8c8c8c', marginLeft: '52px' }}>
                Save big on your favorite meals with our amazing offers
              </Paragraph>
            </div>

            <div style={{ padding: '0 8px' }}>
              <Alert
                message="Limited Time Offers!"
                description="Don't miss out on these incredible deals. Save up to 50% on selected items. Hurry, offers are valid for a limited time only!"
                type="warning"
                icon={<FireOutlined />}
                showIcon
                style={{
                  marginBottom: '32px',
                  borderRadius: '16px',
                  backgroundColor: '#fff7e6',
                  border: '1px solid #ffd591'
                }}
              />

              <Card
                title={
                  <Space size="middle">
                    <ThunderboltOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Flash Deals
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[24, 24]}>
                  {flashDeals.map((deal) => {
                    const claimedPercentage = Math.round((deal.claimed / deal.total) * 100);
                    const isSoldOut = claimedPercentage >= 100;
                    
                    return (
                      <Col xs={24} md={12} key={deal.id}>
                        <Card
                          style={{
                            borderRadius: '12px',
                            border: `2px dashed ${isSoldOut ? '#d9d9d9' : '#52c41a'}`,
                            background: isSoldOut 
                              ? 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)'
                              : 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
                            opacity: isSoldOut ? 0.7 : 1
                          }}
                        >
                          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ fontSize: '18px' }}>{deal.name}</Text>
                              {isSoldOut ? (
                                <Tag color="red" style={{ fontSize: '12px' }}>
                                  SOLD OUT
                                </Tag>
                              ) : (
                                <Tag color="green" style={{ fontSize: '12px' }}>
                                  <FireOutlined /> {deal.discount}% OFF
                                </Tag>
                              )}
                            </div>

                            <Text type="secondary">{deal.description}</Text>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Space>
                                <Text strong style={{ fontSize: '20px', color: '#52c41a' }}>
                                  ₹{deal.discountPrice}
                                </Text>
                                <Text delete type="secondary">₹{deal.originalPrice}</Text>
                              </Space>
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text style={{ fontSize: '14px' }}>Claimed: {deal.claimed}/{deal.total}</Text>
                                <Text style={{ fontSize: '14px' }}>{claimedPercentage}%</Text>
                              </div>
                              <Progress
                                percent={claimedPercentage}
                                strokeColor={isSoldOut ? '#ff4d4f' : '#52c41a'}
                                showInfo={false}
                              />
                            </div>

                            {!isSoldOut && (
                              <div style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>Time Left:</Text>
                                <div style={{ marginTop: '8px' }}>
                                  <Statistic.Countdown
                                    value={deal.timeLeft}
                                    format="HH:mm:ss"
                                    valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                                  />
                                </div>
                              </div>
                            )}

                            <Button
                              type="primary"
                              block
                              size="large"
                              disabled={isSoldOut}
                              style={{
                                backgroundColor: isSoldOut ? '#d9d9d9' : '#52c41a',
                                borderColor: isSoldOut ? '#d9d9d9' : '#52c41a',
                                borderRadius: '8px',
                                cursor: isSoldOut ? 'not-allowed' : 'pointer'
                              }}
                              onClick={isSoldOut ? undefined : shownotification}
                            >
                              <Space>
                                <ShoppingCartOutlined />
                                {isSoldOut ? 'Sold Out' : 'Grab Deal Now'}
                              </Space>
                            </Button>
                          </Space>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <TagOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Coupon Codes
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  {couponCodes.map((coupon, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <Card
                        size="small"
                        style={{
                          borderRadius: '8px',
                          border: '2px dashed #52c41a',
                          background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'
                        }}
                      >
                        <Row align="middle" justify="space-between">
                          <Col flex="auto">
                            <Space direction="vertical" size="small">
                              <Space>
                                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                  {coupon.code}
                                </Text>
                                <Tag color="green">
                                  {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`} OFF
                                </Tag>
                              </Space>
                              <Text style={{ fontSize: '14px' }}>{coupon.description}</Text>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Min order: ₹{coupon.minOrder} | Valid till: {coupon.validTill}
                              </Text>
                            </Space>
                          </Col>
                          <Col>
                            <Button
                              type="primary"
                              size="small"
                              style={{
                                backgroundColor: '#52c41a',
                                borderColor: '#52c41a'
                              }}
                              onClick={shownotification}
                              icon={<CopyOutlined />}
                            >
                              Copy
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card
                title={
                  <Space size="middle">
                    <CrownOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Loyalty Rewards
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={8}>
                    <Card style={{ textAlign: 'center', borderRadius: '16px', border: '2px dashed #52c41a', background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'  }}>
                      <Space direction="vertical" size="middle">
                        <TrophyOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />
                        <Title level={4} style={{ color: '#fa8c16', margin: 0 }}>
                          Bronze Member
                        </Title>
                        <Text>5% cashback on all orders</Text>
                        <Text type="secondary">Spend ₹1000 to unlock</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ textAlign: 'center', borderRadius: '16px', border: '2px dashed #52c41a', background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'  }}>
                      <Space direction="vertical" size="middle">
                        <CrownOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                        <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
                          Silver Member
                        </Title>
                        <Text>10% cashback + Free delivery</Text>
                        <Text type="secondary">Spend ₹5000 to unlock</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ textAlign: 'center', borderRadius: '16px', border: '2px dashed #52c41a', background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)' }}>
                      <Space direction="vertical" size="middle">
                        <CrownOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
                        <Title level={4} style={{ color: '#722ed1', margin: 0 }}>
                          Gold Member
                        </Title>
                        <Text>15% cashback + Priority support</Text>
                        <Text type="secondary">Spend ₹10000 to unlock</Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <div style={{ textAlign: 'right', padding: '24px 0' }}>
                <Space direction="vertical" size="large">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a',
                      borderRadius: '8px',
                      padding: '0 40px',
                      height: '48px',
                      fontSize: '16px'
                    }}
                    onClick={handlenavigatestore}
                  >
                    <Space>
                      <ShoppingCartOutlined />
                      Start Shopping Now
                    </Space>
                  </Button>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    New deals added every week. Stay tuned for more savings!
                  </Text>
                </Space>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DealsDiscounts;