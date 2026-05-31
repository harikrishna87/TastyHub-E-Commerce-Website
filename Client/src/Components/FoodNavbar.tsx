import React, { useState, useEffect, useContext } from 'react';
import { Layout, Menu, Button, Badge, Drawer, Typography, Space, Grid, message } from 'antd';
import {
  ShoppingCartOutlined,
  LogoutOutlined,
  LoginOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  MenuOutlined,
  HomeOutlined,
  ContactsOutlined,
  ProductOutlined,
  UserOutlined
} from '@ant-design/icons';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './AuthModal';
import axios from 'axios';

const { Header } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const marqueeStyles = `
  @keyframes marqueeScroller {
    0% { transform: translate3d(100%, 0, 0); }
    100% { transform: translate3d(-100%, 0, 0); }
  }
  .top-announcement-bar {
    background: linear-gradient(90deg, #15803d 0%, #166534 100%);
    color: white;
    padding: 6px 30px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    width: 100%;
    z-index: 1001;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  }
  .announcement-text-scroller {
    display: inline-block;
    animation: marqueeScroller 25s linear infinite;
    padding-left: 20px;
  }
  .announcement-text-scroller:hover {
    animation-play-state: paused;
  }
`;

const FoodNavbar: React.FC = () => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [mobileMenuVisible, setMobileMenuVisible] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = marqueeStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = auth?.token || localStorage.getItem('token');
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await axios.get(`${backendUrl}/api/promo/coupons/announcements`, {
          headers,
          withCredentials: true
        });
        if (res.data.success) {
          setAnnouncements(res.data.announcements || []);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };

    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, [auth?.isAuthenticated, auth?.token, backendUrl]);

  const getActiveKey = (pathname: string): string => {
    if (pathname === '/') return 'home';
    if (pathname === '/menu-items') return 'menu';
    if (pathname === '/contact') return 'contact';
    if (pathname === '/profilepage') return 'profile';
    if (pathname === '/admin/orderanalytics' || pathname === '/admin/home') return 'orderanalytics';
    if (pathname === '/admin/productspage') return 'products';
    if (pathname === '/admin/ordermanagement') return 'ordermanagement';
    if (pathname === '/admin/paymentoverview') return 'paymentoverview';
    if (pathname === '/admin/profilepage') return 'profile';
    if (pathname === '/delivery/dashboard') return 'delivery_dashboard';
    return '';
  };

  const activeKey = getActiveKey(location.pathname);
  const isLargeScreen = () => window.innerWidth > 900;

  const fetchCartCount = async () => {
    if (!auth?.isAuthenticated || !auth?.token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/cart/get_cart_items`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.status === 401) {
        auth?.logout?.();
        setCartCount(0);
        return;
      }

      const data = await res.json();
      if (data?.Cart_Items) {
        setCartCount(data.Cart_Items.reduce((total: number, item: any) => total + item.quantity, 0));
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (auth?.isAuthenticated && auth?.token) {
      fetchCartCount();
      pollingInterval = setInterval(fetchCartCount, 10000);
    } else {
      setCartCount(0);
    }

    const handleCartUpdate = () => {
      if (auth?.isAuthenticated && auth?.token) {
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    (window as any).updateCartCount = fetchCartCount;

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      if (pollingInterval) clearInterval(pollingInterval);
      delete (window as any).updateCartCount;
    };
  }, [auth?.isAuthenticated, auth?.token]);

  const logout = async () => {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          'Content-Type': 'application/json',
        }
      });

      auth?.logout?.();
      setCartCount(0);
      setMobileMenuVisible(false);

      messageApi.success({
        content: 'User Logged Out successfully',
        duration: 3,
        style: { marginTop: '10vh' },
      });

      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      console.error('Error logging out:', err);
      auth?.logout?.();
      messageApi.error({
        content: 'Logout failed. Please try again.',
        duration: 3,
        style: { marginTop: '10vh' },
      });
    }
  };

  const handleCartClick = () => {
    if (!auth?.isAuthenticated) {
      setShowAuthModal(true);
      setIsLoginMode(true);
      return;
    }
    navigate('/cart');
  };

  const handleLogoutClick = () => {
    setMobileMenuVisible(false);
    logout();
  };

  const isAdmin = auth?.user?.role === 'admin';

  const getMenuItems = (isMobile = false) => {
    if (auth?.isAuthenticated) {
      if (isAdmin) {
        return [
          { key: 'orderanalytics', icon: <DashboardOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/orderanalytics'); }}>Order Analytics</span> },
          { key: 'products', icon: <ProductOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/productspage'); }}>Products</span> },
          { key: 'ordermanagement', icon: <UnorderedListOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/ordermanagement'); }}>Order Management</span> },
          { key: 'profile', icon: <UserOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/profilepage'); }}>Profile</span> },
          { key: 'logout', icon: <LogoutOutlined />, label: <span onClick={handleLogoutClick}>Logout</span>, style: { color: '#1890ff' } }
        ];
      }

      if (auth?.user?.role === 'delivery_executive') {
        return [
          { key: 'home', icon: <HomeOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }}>Home</span> },
          { key: 'delivery_dashboard', icon: <DashboardOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/delivery/dashboard'); }}>Delivery Dashboard</span> },
          { key: 'profile', icon: <UserOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/profilepage'); }}>Profile</span> },
          { key: 'logout', icon: <LogoutOutlined />, label: <span onClick={handleLogoutClick}>Logout</span>, style: { color: '#1890ff' } }
        ];
      }

      return [
        { key: 'home', icon: <HomeOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }}>Home</span> },
        { key: 'menu', icon: <MenuOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/menu-items'); }}>Menu</span> },
        { key: 'contact', icon: <ContactsOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/contact'); }}>Contact</span> },
        { key: 'profile', icon: <UserOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/profilepage'); }}>Profile</span> },
        { key: 'logout', icon: <LogoutOutlined />, label: <span onClick={handleLogoutClick}>Logout</span>, style: { color: '#1890ff' } }
      ];
    }

    const items: any[] = [
      { key: 'home', icon: <HomeOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }}>Home</span> },
      { key: 'menu', icon: <MenuOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/menu-items'); }}>Menu</span> },
      { key: 'contact', icon: <ContactsOutlined />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/contact'); }}>Contact</span> },
    ];

    if (isMobile) {
      items.push({
        key: 'login',
        icon: <LoginOutlined />,
        label: <span onClick={() => { setMobileMenuVisible(false); setShowAuthModal(true); setIsLoginMode(true); }}>Login / Register</span>,
        style: { color: '#52c41a' }
      });
    }

    return items;
  };

  const showAnnouncement = announcements.length > 0;

  return (
    <>
      {showAnnouncement && (
        <div className="top-announcement-bar">
          <div className="announcement-text-scroller">
            {announcements.map((ann, idx) => (
              <span key={idx} style={{ marginRight: '40px' }}>
                Special Offer: Use Code <strong style={{ color: '#facc15' }}>{ann.code}</strong> {ann.discountType === 'percentage' ? `- ${ann.discountValue}% OFF` : `- ₹${ann.discountValue} OFF`} on order minimums of ₹{ann.minOrderAmount || 0}
              </span>
            ))}
          </div>
        </div>
      )}

      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: 0,
          height: 'auto',
          lineHeight: 'normal'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: screens.xs ? '10px 16px' : '10px 30px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ height: screens.xs ? '32px' : '40px', width: 'auto', objectFit: 'contain' }}
            />
            <Title level={3} style={{ margin: 0, color: '#52c41a', fontWeight: 'bold', fontSize: screens.xs ? '20px' : '28px' }}>
              <NavLink to="/" style={{ color: '#52c41a', textDecoration: 'none' }}>
                TastyHub
              </NavLink>
            </Title>
          </div>

          {isLargeScreen() && (
            <Menu
              mode="horizontal"
              selectedKeys={[activeKey]}
              style={{ border: 'none', background: 'transparent', flex: 1, justifyContent: 'center' }}
              items={getMenuItems(false)}
            />
          )}

          <Space size="middle">
            {!isAdmin && (
              <Badge count={cartCount} size="small">
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined style={{ fontSize: '24px' }} />}
                  onClick={handleCartClick}
                  size="large"
                />
              </Badge>
            )}

            {isLargeScreen() && !auth?.isAuthenticated && (
              <Button
                type="primary"
                onClick={() => { setShowAuthModal(true); setIsLoginMode(true); }}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', fontWeight: 700, borderRadius: '8px' }}
              >
                Login / Register
              </Button>
            )}

            {!isLargeScreen() && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                onClick={() => setMobileMenuVisible(true)}
                size="large"
              />
            )}
          </Space>
        </div>
      </Header>

      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={screens.xs ? '80%' : 300}
      >
        <Menu mode="vertical" selectedKeys={[activeKey]} style={{ border: 'none' }} items={getMenuItems(true)} />
      </Drawer>

      {contextHolder}
      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        isLoginMode={isLoginMode}
        onToggleMode={() => setIsLoginMode(prev => !prev)}
      />

      <style>{`
        .ant-menu-horizontal {
          border-bottom: none !important;
        }
        .ant-menu-horizontal > .ant-menu-item {
          font-size: 18px !important;
          font-weight: 600;
          border-bottom: none !important;
        }
        .ant-menu-horizontal > .ant-menu-item:hover,
        .ant-menu-horizontal .ant-menu-item-active {
          background-color: transparent !important;
          border-bottom: none !important;
        }
        .ant-menu-horizontal > .ant-menu-item::after,
        .ant-menu-horizontal .ant-menu-item-active::after {
          display: none !important;
        }
        .ant-menu-horizontal > .ant-menu-item-selected {
          background-color: transparent !important;
          color: #52c41a !important;
          font-weight: 700 !important;
          border-bottom: none !important;
        }
        .ant-menu-horizontal > .ant-menu-item-selected::after {
          display: none !important;
        }
        .ant-menu-vertical > .ant-menu-item {
          font-size: 18px !important;
          font-weight: 600;
        }
        .ant-menu-vertical > .ant-menu-item-selected {
          background-color: transparent !important;
          color: #52c41a !important;
          font-weight: 700 !important;
        }
      `}</style>
    </>
  );
};

export default FoodNavbar;
