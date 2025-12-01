import React, { useState, useEffect, useContext } from 'react';
import { Card, Typography, Row, Col, Spin, Space, Divider, Button } from 'antd';
import { CheckCircleOutlined, TruckOutlined, GiftOutlined, HomeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const { Title, Text } = Typography;

interface OrderItem {
  _id: string;
  name: string;
  image: string;
  quantity: number;
  discount_price: number;
  original_price: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  deliveryStatus: string;
  createdAt: string;
}

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(20);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate('/');
      return;
    }

    triggerConfetti();
    fetchOrderDetails();
  }, [orderId, auth?.isAuthenticated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handlehomepage = () => {
    navigate('/');
  }

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1060 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const fetchOrderDetails = async () => {
    if (!auth?.token || !orderId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        if (auth?.logout) auth.logout();
        navigate('/');
        return;
      }

      const data = await response.json();
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 30;
  const progress = ((20 - countdown) / 20) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <Title level={3}>Order not found</Title>
          <Text>Redirecting to home page...</Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '24px 16px',
      position: 'relative'
    }}>
      <div style={{
        position: 'fixed',
        top: '75px',
        right: '20px',
        zIndex: 1000
      }}>
        <div style={{ position: 'relative', width: '60px', height: '60px' }}>
          <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="30"
              cy="30"
              r="26"
              fill="none"
              stroke="#e8e8e8"
              strokeWidth="4"
            />
            <circle
              cx="30"
              cy="30"
              r="26"
              fill="none"
              stroke="#52c41a"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#52c41a'
            }}>
              {countdown}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666'
            }}>
              sec
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Card
          style={{
            borderRadius: '16px',
            border: '1px solid #b7eb8f',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(82, 196, 26, 0.1)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(115, 209, 61, 0.08)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '10%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(149, 222, 100, 0.06)',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <CheckCircleOutlined style={{
                fontSize: '64px',
                color: '#52c41a',
                marginBottom: '16px'
              }} />
              <Title level={2} style={{ color: '#52c41a', marginBottom: '8px' }}>
                Order Placed Successfully!
              </Title>
              <Text style={{ fontSize: '16px', color: '#666' }}>
                Thank you for your order. We'll send you a confirmation email shortly. Please check your Spam or Junk folder if you don't see the email.
              </Text>
            </div>

            <Divider style={{ borderColor: '#b7eb8f', margin: '32px 0' }} />

            <div style={{ marginTop: '24px' }}>
              <Space style={{ marginBottom: '24px' }}>
                <GiftOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                <span style={{ fontSize: '18px', fontWeight: '500' }}>Order Summary</span>
              </Space>

              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</Text>
                    <Text strong style={{ fontSize: '14px' }}>{order._id}</Text>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Date</Text>
                    <Text strong style={{ fontSize: '14px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</Text>
                    <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
                      ₹{order.totalAmount.toFixed(2)}
                    </Text>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</Text>
                    <Text strong style={{ fontSize: '14px' }}>Online Payment</Text>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Card>

        <Card
          title={
            <Space>
              <TruckOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
              <span style={{ fontSize: '18px' }}>Delivery Status</span>
            </Space>
          }
          style={{
            borderRadius: '16px',
            border: '1px solid #91d5ff',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'rgba(24, 144, 255, 0.08)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'rgba(145, 213, 255, 0.12)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '15%',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(105, 192, 255, 0.08)',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              padding: '40px 20px',
              backgroundColor: 'rgba(240, 249, 255, 0.6)',
              borderRadius: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '25px',
                  left: '25px',
                  right: '25px',
                  height: '4px',
                  backgroundColor: '#e8e8e8',
                  borderRadius: '2px',
                  zIndex: 1
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#52c41a',
                    borderRadius: '2px',
                    width: '0%',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    border: '4px solid #52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    boxShadow: '0 0 0 4px rgba(82, 196, 26, 0.2)'
                  }}>
                    <CheckCircleOutlined />
                  </div>
                  <span style={{
                    marginTop: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#52c41a',
                    textAlign: 'center',
                    letterSpacing: '0.5px'
                  }}>
                    ORDERED
                  </span>
                  <span style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#e8e8e8',
                    border: '4px solid #e8e8e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '20px'
                  }}>
                    <TruckOutlined />
                  </div>
                  <span style={{
                    marginTop: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#999',
                    textAlign: 'center',
                    letterSpacing: '0.5px'
                  }}>
                    SHIPPED
                  </span>
                  <span style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center'
                  }}>
                    Pending
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#e8e8e8',
                    border: '4px solid #e8e8e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '20px'
                  }}>
                    <GiftOutlined />
                  </div>
                  <span style={{
                    marginTop: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#999',
                    textAlign: 'center',
                    letterSpacing: '0.5px'
                  }}>
                    DELIVERED
                  </span>
                  <span style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center'
                  }}>
                    Pending
                  </span>
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                marginTop: '30px',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #d9f7be'
              }}>
                <span style={{
                  color: '#52c41a',
                  fontWeight: '500',
                  fontSize: '15px'
                }}>
                  Your order has been placed and is being processed
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderRadius: '16px',
            border: '1px solid #ffd666',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fffbe6 0%, #ffffff 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(250, 219, 20, 0.1)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255, 214, 102, 0.12)',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Title level={4} style={{ color: '#d48806', marginBottom: '16px' }}>
              Thank You for Your Order!
            </Title>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              Your order will be delivered soon. We appreciate your business!
            </Text>
          </div>

          <Button
            icon={<HomeOutlined />}
            style={{
              marginTop: "20px",
              backgroundColor: "#ffd666",
              borderColor: "#ffd666",
              color: "#000",
            }}
            onClick={handlehomepage}
          >
            Back to HomePage
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;