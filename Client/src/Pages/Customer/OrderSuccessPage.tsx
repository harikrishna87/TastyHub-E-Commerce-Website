import React, { useState, useEffect, useContext } from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

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
  { key: 'Pending', label: 'Placed', description: 'Order confirmed', icon: 'pi pi-clock' },
  { key: 'Preparing', label: 'Preparing', description: 'Kitchen is working', icon: 'pi pi-bolt' },
  { key: 'Pickup', label: 'Picked Up', description: 'Rider picked it up', icon: 'pi pi-shopping-bag' },
  { key: 'Out for Delivery', label: 'Out for Delivery', description: 'Heading to you', icon: 'pi pi-car' },
  { key: 'Delivered', label: 'Delivered', description: 'Delivered successfully', icon: 'pi pi-gift' },
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

    const pollInterval = setInterval(() => {
      fetchOrderDetails();
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [orderId, auth?.isAuthenticated, auth?.token]);

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
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>Order not found</h3>
          <p style={{ color: '#666', margin: 0 }}>Redirecting to home page...</p>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px 16px', position: 'relative', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ borderRadius: '16px', border: '1px solid #b7eb8f', marginBottom: '24px', background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <i className="pi pi-check-circle" style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
            <h2 style={{ color: '#52c41a', fontSize: '2rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>Order Placed Successfully!</h2>
            <p style={{ fontSize: '16px', color: '#666', margin: '0 0 16px 0' }}>
              Thank you for your order. We&apos;ll keep your delivery timeline updated in real time.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0fdf4', border: '1px solid #b7eb8f', borderRadius: '12px', padding: '12px 24px', margin: '8px 0' }}>
              <i className="pi pi-clock" style={{ color: '#22c55e', fontSize: '18px' }} />
              <span style={{ fontSize: '15px', color: '#15803d', fontWeight: 600 }}>Estimated Delivery: <strong style={{ fontSize: '17px' }}>25 - 30 Minutes</strong></span>
            </div>
          </div>

          <Divider style={{ margin: '32px 0' }} />

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <i className="pi pi-gift" style={{ color: '#52c41a', fontSize: '20px' }} />
              <span style={{ fontSize: '18px', fontWeight: '500' }}>Order Summary</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <span style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Order ID</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{order._id}</span>
              </div>
              <div>
                <span style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Order Date</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div>
                <span style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Total Amount</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div>
                <span style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Payment Method</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{paymentMethodLabel}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          style={{ borderRadius: '16px', border: '1px solid #b7eb8f', marginBottom: '24px', background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <i className="pi pi-truck" style={{ color: '#22c55e', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: '500' }}>Delivery Status</span>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'rgba(240, 253, 244, 0.7)', borderRadius: '12px' }}>
            <div style={{ position: 'relative', margin: '0 auto', maxWidth: '900px' }}>
              <div style={{ position: 'absolute', top: '28px', left: '40px', right: '40px', height: '4px', backgroundColor: '#dcfce7', borderRadius: '999px' }}>
                <div style={{ height: '100%', width: progressWidth, backgroundColor: '#22c55e', borderRadius: '999px', transition: 'width 0.3s ease' }} />
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
                          backgroundColor: isComplete ? '#22c55e' : '#e5e7eb',
                          border: `4px solid ${isComplete ? '#22c55e' : '#e5e7eb'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '20px',
                          boxShadow: isCurrent ? '0 0 0 6px rgba(34, 197, 94, 0.24)' : 'none'
                        }}
                      >
                        <i className={step.icon} />
                      </div>
                      <span style={{ marginTop: '14px', fontSize: '13px', fontWeight: 700, color: isComplete ? '#15803d' : '#94a3b8', textAlign: 'center' }}>{step.label}</span>
                      <span style={{ marginTop: '4px', fontSize: '12px', color: isCurrent ? '#22c55e' : '#94a3b8', textAlign: 'center' }}>
                        {index === 0 ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : step.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '28px', padding: '14px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #b7eb8f' }}>
              <span style={{ fontWeight: 'bold', color: '#22c55e', fontSize: '15px' }}>
                Current status: {order.deliveryStatus === 'Shipped' ? 'Out for Delivery' : order.deliveryStatus}
              </span>
            </div>
          </div>
        </Card>

        <Card style={{ borderRadius: '16px', padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Delivery Address</h4>
            <span style={{ display: 'block', color: '#333' }}>{order.shippingAddress.fullName}</span>
            <span style={{ display: 'block', color: '#333' }}>{order.shippingAddress.phone}</span>
            <span style={{ display: 'block', color: '#555' }}>
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
              , {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </span>

            <Divider style={{ margin: '12px 0' }} />

            <Button
              label="Back to Home"
              icon="pi pi-home"
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', width: 'fit-content' }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
