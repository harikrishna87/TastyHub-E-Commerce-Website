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
  Collapse,
  Spin,
} from 'antd';
import {
  HomeOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  StarOutlined,
  GiftOutlined,
  DollarOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const FAQ: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const Today = new Date();
  const FormattedDate = Today.toDateString();

  const faqCategories = [
    {
      title: "Orders & Delivery",
      icon: <ShoppingCartOutlined />,
      color: '#52c41a',
      bgColor: '#f6ffed',
      questions: [
        {
          key: 'order-1',
          question: 'How do I place an order?',
          answer: 'You can place an order through our website or mobile app. Simply browse our menu, add items to your cart, provide delivery details, and complete the payment process. Our user-friendly interface makes ordering quick and easy.'
        },
        {
          key: 'order-2',
          question: 'What are your delivery hours?',
          answer: 'We deliver from 9:00 AM to 11:00 PM, seven days a week. During peak hours (12:00-2:00 PM and 7:00-9:00 PM), delivery times may be slightly longer due to high demand.'
        },
        {
          key: 'order-3',
          question: 'How long does delivery take?',
          answer: 'Standard delivery takes 30-45 minutes. Express delivery (additional charges apply) takes 15-25 minutes. Delivery times may vary based on your location, weather conditions, and order volume.'
        },
        {
          key: 'order-4',
          question: 'Can I track my order?',
          answer: 'Yes! Once your order is confirmed, you\'ll receive a tracking link via SMS and email. You can monitor your order in real-time from preparation to delivery.'
        }
      ]
    },
    {
      title: "Payment & Pricing",
      icon: <CreditCardOutlined />,
      color: '#1890ff',
      bgColor: '#e6f7ff',
      questions: [
        {
          key: 'payment-1',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit/debit cards (Visa, MasterCard, RuPay), UPI payments, net banking, digital wallets (Paytm, PhonePe, Google Pay), and cash on delivery for eligible orders.'
        },
        {
          key: 'payment-2',
          question: 'Are there any delivery charges?',
          answer: 'Delivery is free for orders above ₹299. For orders below ₹299, a delivery fee of ₹29 applies. Express delivery has an additional charge of ₹49.'
        },
        {
          key: 'payment-3',
          question: 'Do you offer any discounts or coupons?',
          answer: 'Yes! We regularly offer discounts for first-time users, loyalty rewards, festival specials, and bulk orders. Check our app or website for current offers and promo codes.'
        },
        {
          key: 'payment-4',
          question: 'Can I get a refund if I cancel my order?',
          answer: 'Orders can be cancelled within 2 minutes of placing for a full refund. After preparation begins, cancellation may incur charges. Refunds are processed within 3-5 business days.'
        }
      ]
    },
    {
      title: "Food & Menu",
      icon: <HeartOutlined />,
      color: '#fa8c16',
      bgColor: '#fff7e6',
      questions: [
        {
          key: 'food-1',
          question: 'Do you have vegetarian and vegan options?',
          answer: 'Absolutely! We have extensive vegetarian and vegan menus clearly marked with symbols. Our kitchen maintains separate preparation areas to avoid cross-contamination.'
        },
        {
          key: 'food-2',
          question: 'Can I customize my order?',
          answer: 'Yes, most items can be customized. You can adjust spice levels, remove ingredients, add extras, or make substitutions. Custom options are available during the ordering process.'
        },
        {
          key: 'food-3',
          question: 'Do you provide nutritional information?',
          answer: 'Yes, nutritional information including calories, allergens, and ingredients is available for all menu items. You can find this information on each product page.'
        },
        {
          key: 'food-4',
          question: 'How do you ensure food quality and freshness?',
          answer: 'We source ingredients daily from trusted suppliers, follow strict hygiene protocols, and prepare food fresh for each order. Our delivery partners use insulated bags to maintain temperature.'
        }
      ]
    },
    {
      title: "Account & Support",
      icon: <CustomerServiceOutlined />,
      color: '#eb2f96',
      bgColor: '#fff0f6',
      questions: [
        {
          key: 'account-1',
          question: 'How do I create an account?',
          answer: 'Click "Sign Up" on our website or app, enter your mobile number or email, verify with OTP, and complete your profile. You can also sign up using Google or Facebook for faster registration.'
        },
        {
          key: 'account-2',
          question: 'I forgot my password. How can I reset it?',
          answer: 'Click "Forgot Password" on the login page, enter your registered email or phone number, and follow the reset instructions sent to you via SMS or email.'
        },
        {
          key: 'account-3',
          question: 'How can I contact customer support?',
          answer: 'You can reach us through multiple channels: in-app chat support (24/7), email (support@TastyHub.com), phone (+91 99887 76655), or visit our help center for instant answers.'
        },
        {
          key: 'account-4',
          question: 'Can I save my favorite orders?',
          answer: 'Yes! You can save frequently ordered items to "Favorites," create custom meal combinations, and reorder previous purchases with just one click.'
        }
      ]
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
        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading FAQ...</Paragraph>
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
                      <QuestionCircleOutlined />
                      <span>FAQ</span>
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
                <QuestionCircleOutlined style={{ fontSize: '40px' }} />
                <Title level={1} style={{ margin: 0, fontSize: '36px' }}>
                  Frequently Asked Questions
                </Title>
              </div>

              <Paragraph style={{ fontSize: '16px', marginBottom: 0, marginTop: '8px', color: '#8c8c8c', marginLeft: '52px' }}>
                Find quick answers to common questions about our services
              </Paragraph>
            </div>

            <div style={{ padding: '0 8px' }}>
              <Alert
                message="Quick Help Available"
                description="Can't find your answer? Our 24/7 customer support team is here to help! Use the contact information at the bottom of this page."
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

              {faqCategories.map((category, categoryIndex) => (
                <Card
                  key={categoryIndex}
                  title={
                    <Space size="middle">
                      <div style={{
                        color: category.color,
                        fontSize: '20px',
                        backgroundColor: category.bgColor,
                        padding: '8px',
                        borderRadius: '50%'
                      }}>
                        {category.icon}
                      </div>
                      <Title level={3} style={{ margin: 0, color: category.color }}>
                        {category.title}
                      </Title>
                    </Space>
                  }
                  style={{ marginBottom: '24px', borderRadius: '16px' }}
                  headStyle={{ backgroundColor: category.bgColor, borderBottom: `1px solid ${category.color}33` }}
                >
                  <Collapse
                    expandIcon={({ isActive }) =>
                      isActive ? <MinusOutlined style={{ color: category.color }} /> : <PlusOutlined style={{ color: category.color }} />
                    }
                    ghost
                    style={{ backgroundColor: 'transparent' }}
                  >
                    {category.questions.map((faq) => (
                      <Panel
                        header={
                          <Text style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>
                            {faq.question}
                          </Text>
                        }
                        key={faq.key}
                        style={{
                          marginBottom: '8px',
                          borderRadius: '6px',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <div style={{
                          backgroundColor: '#fafafa',
                          padding: '16px',
                          borderRadius: '10px',
                          marginTop: '8px'
                        }}>
                          <Text style={{ fontSize: '15px', lineHeight: '1.6', color: '#595959' }}>
                            {faq.answer}
                          </Text>
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                </Card>
              ))}

              <Card
                title={
                  <Space size="middle">
                    <StarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      Popular Questions
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '16px',
                        border:'1px solid #8c8c8c',
                        padding:'16px',
                        borderLeft: '4px solid #52c41a',
                        cursor: 'pointer',
                      }}
                    >
                      <Space direction="vertical" size="small">
                        <Space>
                          <ThunderboltOutlined style={{ color: '#52c41a' }} />
                          <Text strong>Express Delivery</Text>
                        </Space>
                        <Text style={{ fontSize: '14px', color: '#595959' }}>
                          Get your food delivered in 15-25 minutes with our express service
                        </Text>
                      </Space>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '16px',
                        border:'1px solid #8c8c8c',
                        padding:'16px',
                        borderLeft: '4px solid #1890ff',
                        cursor: 'pointer',
                      }}
                    >
                      <Space direction="vertical" size="small">
                        <Space>
                          <GiftOutlined style={{ color: '#1890ff' }} />
                          <Text strong>Loyalty Rewards</Text>
                        </Space>
                        <Text style={{ fontSize: '14px', color: '#595959' }}>
                          Earn points with every order and redeem for exclusive discounts
                        </Text>
                      </Space>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '16px',
                        border:'1px solid #8c8c8c',
                        padding:'16px',
                        borderLeft: '4px solid #fa8c16',
                        cursor: 'pointer',
                      }}
                    >
                      <Space direction="vertical" size="small">
                        <Space>
                          <SafetyCertificateOutlined style={{ color: '#fa8c16' }} />
                          <Text strong>Food Safety</Text>
                        </Space>
                        <Text style={{ fontSize: '14px', color: '#595959' }}>
                          All our food is prepared following strict hygiene protocols
                        </Text>
                      </Space>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '16px',
                        border:'1px solid #8c8c8c',
                        padding:'16px',
                        borderLeft: '4px solid #eb2f96',
                        cursor: 'pointer'
                      }}
                    >
                      <Space direction="vertical" size="small">
                        <Space>
                          <DollarOutlined style={{ color: '#eb2f96' }} />
                          <Text strong>Best Prices</Text>
                        </Space>
                        <Text style={{ fontSize: '14px', color: '#595959' }}>
                          Competitive pricing with regular offers and discounts
                        </Text>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Card>



              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Divider
                  style={{
                    borderColor:'#52c41a',
                    fontSize: '20px',
                  }}
                >
                  <Space>
                    <CheckCircleOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Last Updated: {FormattedDate}
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

export default FAQ;