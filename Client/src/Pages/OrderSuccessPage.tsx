import React, { useState, useEffect, useContext } from 'react';
import { Card, Typography, Row, Col, Spin, Space, Divider, Button } from 'antd';
import {
  CheckCircleOutlined,
  TruckOutlined,
  GiftOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ShoppingOutlined,
  CarOutlined
} from '@ant-design/icons';
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
  paymentMethod?: string;
}

const deliverySteps = [
  { key: 'Pending', label: 'Placed', description: 'Order confirmed', icon: <ClockCircleOutlined /> },
  { key: 'Preparing', label: 'Preparing', description: 'Kitchen is working', icon: <FireOutlined /> },
  { key: 'Pickup', label: 'Picked Up', description: 'Rider picked it up', icon: <ShoppingOutlined /> },
  { key: 'Out for Delivery', label: 'Out for Delivery', description: 'Heading to you', icon: <CarOutlined /> },
  { key: 'Delivered', label: 'Delivered', description: 'Delivered successfully', icon: <GiftOutlined /> },
];

const getCurrentStepIndex = (status: string) => {
  if (status === 'Accepted' || status === 'Pending') return 0;
  if (status === 'Preparing') return 1;
  if (status === 'Pickup') return 2;
  if (status === 'Out for Delivery' || status === 'Shipped') return 3;
  if (status === 'Delivered') return 4;
  return 0;
};

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

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1060 };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: 0.2, y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.8, y: Math.random() - 0.2 } });
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
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        auth.logout?.();
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <Title level={3}>Order not found</Title>
          <Text>Redirecting to home page...</Text>
        </Card>
      </div>
    );
  }

  const currentIndex = getCurrentStepIndex(order.deliveryStatus);
  const progressWidth = `${(currentIndex / (deliverySteps.length - 1)) * 100}%`;
  const paymentMethodLabel =
    order.paymentMethod === 'cod'
      ? 'Cash on Delivery'
      : order.paymentMethod === 'wallet'
      ? 'Wallet'
      : order.paymentMethod === 'gift_card'
      ? 'Gift Card'
      : 'Online Payment';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px 16px', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '75px', right: '20px', zIndex: 1000, background: '#fff', borderRadius: '999px', padding: '10px 14px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <Text strong style={{ color: '#52c41a' }}>{countdown}s</Text>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ borderRadius: '16px', border: '1px solid #b7eb8f', marginBottom: '24px', background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={2} style={{ color: '#52c41a', marginBottom: '8px' }}>Order Placed Successfully!</Title>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              Thank you for your order. We&apos;ll keep your delivery timeline updated in real time.
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
                <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Order ID</Text>
                <Text strong style={{ fontSize: '14px' }}>{order._id}</Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Order Date</Text>
                <Text strong style={{ fontSize: '14px' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Total Amount</Text>
                <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>₹{order.totalAmount.toFixed(2)}</Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>Payment Method</Text>
                <Text strong style={{ fontSize: '14px' }}>{paymentMethodLabel}</Text>
              </Col>
            </Row>
          </div>
        </Card>

        <Card
          title={
            <Space>
              <TruckOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
              <span style={{ fontSize: '18px' }}>Delivery Status</span>
            </Space>
          }
          style={{ borderRadius: '16px', border: '1px solid #91d5ff', marginBottom: '24px', background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <div style={{ padding: '24px', backgroundColor: 'rgba(240, 249, 255, 0.7)', borderRadius: '12px' }}>
            <div style={{ position: 'relative', margin: '0 auto', maxWidth: '900px' }}>
              <div style={{ position: 'absolute', top: '28px', left: '40px', right: '40px', height: '4px', backgroundColor: '#dbeafe', borderRadius: '999px' }}>
                <div style={{ height: '100%', width: progressWidth, backgroundColor: '#1890ff', borderRadius: '999px', transition: 'width 0.3s ease' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '16px' }}>
                {deliverySteps.map((step, index) => {
                  const isComplete = index <= currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          backgroundColor: isComplete ? '#1890ff' : '#e5e7eb',
                          border: `4px solid ${isComplete ? '#1890ff' : '#e5e7eb'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '20px',
                          boxShadow: isCurrent ? '0 0 0 6px rgba(24, 144, 255, 0.16)' : 'none'
                        }}
                      >
                        {step.icon}
                      </div>
                      <span style={{ marginTop: '14px', fontSize: '13px', fontWeight: 700, color: isComplete ? '#0f172a' : '#94a3b8', textAlign: 'center' }}>{step.label}</span>
                      <span style={{ marginTop: '4px', fontSize: '12px', color: isCurrent ? '#1890ff' : '#94a3b8', textAlign: 'center' }}>
                        {index === 0 ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : step.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '28px', padding: '14px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <Text strong style={{ color: '#1890ff', fontSize: '15px' }}>
                Current status: {order.deliveryStatus === 'Shipped' ? 'Out for Delivery' : order.deliveryStatus}
              </Text>
            </div>
          </div>
        </Card>

        <Card style={{ borderRadius: '16px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0 }}>Delivery Address</Title>
            <Text>{order.shippingAddress.fullName}</Text>
            <Text>{order.shippingAddress.phone}</Text>
            <Text>
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
              , {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </Text>

            <Divider style={{ margin: '12px 0' }} />

            <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
              Back to Home
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
