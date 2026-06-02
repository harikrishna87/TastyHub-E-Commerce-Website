import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

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
  .nav-item-btn:hover {
    color: #52c41a !important;
  }
`;

const FoodNavbar: React.FC = () => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [mobileMenuVisible, setMobileMenuVisible] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
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
      const token = auth?.token || localStorage.getItem('token');
      if (!token) {
        setAnnouncements([]);
        return;
      }
      try {
        const headers: any = {};
        headers.Authorization = `Bearer ${token}`;
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
    if (pathname === '/user/menu-items' || pathname === '/menu-items') return 'menu';
    if (pathname === '/user/contact' || pathname === '/contact') return 'contact';
    if (pathname === '/user/profilepage' || pathname === '/profilepage') return 'profile';
    if (pathname === '/admin/orderanalytics' || pathname === '/admin/home') return 'orderanalytics';
    if (pathname === '/admin/productspage') return 'products';
    if (pathname === '/admin/ordermanagement') return 'ordermanagement';
    if (pathname === '/admin/paymentoverview') return 'paymentoverview';
    if (pathname === '/admin/profilepage') return 'profile';
    if (pathname === '/delivery/home' || pathname === '/delivery/dashboard') return 'delivery_dashboard';
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
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      console.error('Error logging out:', err);
      auth?.logout?.();
    }
  };

  const handleCartClick = () => {
    if (!auth?.isAuthenticated) {
      navigate('/user/auth');
      return;
    }
    navigate('/user/cart');
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
          { key: 'orderanalytics', icon: <i className="pi pi-chart-bar" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/orderanalytics'); }}>Order Analytics</span> },
          { key: 'products', icon: <i className="pi pi-box" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/productspage'); }}>Products</span> },
          { key: 'ordermanagement', icon: <i className="pi pi-list" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/ordermanagement'); }}>Order Management</span> },
          { key: 'profile', icon: <i className="pi pi-user" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/profilepage'); }}>Profile</span> },
          ...(isMobile ? [{ key: 'logout', icon: <i className="pi pi-sign-out" style={{ fontSize: '18px', color: '#ff4d4f' }} />, label: <span onClick={handleLogoutClick} style={{ color: '#ff4d4f' }}>Logout</span> }] : [])
        ];
      }

      if (auth?.user?.role === 'delivery_executive') {
        return [
          { key: 'home', icon: <i className="pi pi-home" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }}>Home</span> },
          { key: 'delivery_dashboard', icon: <i className="pi pi-th-large" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/delivery/home'); }}>Delivery Dashboard</span> },
          { key: 'profile', icon: <i className="pi pi-user" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/user/profilepage'); }}>Profile</span> },
          ...(isMobile ? [{ key: 'logout', icon: <i className="pi pi-sign-out" style={{ fontSize: '18px', color: '#ff4d4f' }} />, label: <span onClick={handleLogoutClick} style={{ color: '#ff4d4f' }}>Logout</span> }] : [])
        ];
      }

      return [
        { key: 'home', icon: <i className="pi pi-home" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }}>Home</span> },
        { key: 'menu', icon: <i className="pi pi-list" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/user/menu-items'); }}>Menu</span> },
        { key: 'contact', icon: <i className="pi pi-envelope" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/user/contact'); }}>Contact</span> },
        { key: 'profile', icon: <i className="pi pi-user" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/user/profilepage'); }}>Profile</span> },
        ...(isMobile ? [{ key: 'logout', icon: <i className="pi pi-sign-out" style={{ fontSize: '18px', color: '#ff4d4f' }} />, label: <span onClick={handleLogoutClick} style={{ color: '#ff4d4f' }}>Logout</span> }] : [])
      ];
    }

    const items: any[] = [
      { key: 'home', icon: <i className="pi pi-home" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }}>Home</span> },
      { key: 'menu', icon: <i className="pi pi-list" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/user/menu-items'); }}>Menu</span> },
      { key: 'contact', icon: <i className="pi pi-envelope" style={{ fontSize: '18px' }} />, label: <span onClick={() => { setMobileMenuVisible(false); navigate('/user/contact'); }}>Contact</span> },
    ];

    if (isMobile) {
      items.push({
        key: 'login',
        icon: <i className="pi pi-sign-in" style={{ fontSize: '18px', color: '#52c41a' }} />,
        label: <span onClick={() => { setMobileMenuVisible(false); navigate('/user/auth'); }}>Login / Register</span>,
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

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: window.innerWidth < 576 ? '10px 16px' : '10px 30px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ height: window.innerWidth < 576 ? '32px' : '40px', width: 'auto', objectFit: 'contain' }}
            />
            <h3 style={{ margin: 0, color: '#52c41a', fontWeight: 'bold', fontSize: window.innerWidth < 576 ? '20px' : '28px' }}>
              <NavLink to="/" style={{ color: '#52c41a', textDecoration: 'none' }}>
                TastyHub
              </NavLink>
            </h3>
          </div>

          {isLargeScreen() && (
            <div style={{ display: 'flex', gap: '24px', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {getMenuItems(false).map((item) => (
                <button
                  key={item.key}
                  onClick={item.label.props.onClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: activeKey === item.key ? '700' : '600',
                    color: activeKey === item.key ? '#52c41a' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.2s',
                    padding: '8px 12px'
                  }}
                  className="nav-item-btn"
                >
                  {item.icon}
                  {item.label.props.children}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!isAdmin && (
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  onClick={handleCartClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1f2937'
                  }}
                  title="Cart"
                >
                  <i className="pi pi-shopping-cart" style={{ fontSize: '24px' }} />
                </button>
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '0px',
                      right: '0px',
                      transform: 'translate(20%, -20%)',
                      backgroundColor: '#ff4d4f',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      lineHeight: 1,
                      minWidth: '18px',
                      textAlign: 'center',
                      boxShadow: '0 0 0 2px #fff'
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
            )}

            {auth?.isAuthenticated && (
              <button
                onClick={handleLogoutClick}
                title="Logout"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff4d4f',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <i className="pi pi-sign-out" style={{ fontSize: '20px' }} />
              </button>
            )}

            {isLargeScreen() && !auth?.isAuthenticated && (
              <button
                onClick={() => { navigate('/user/auth'); }}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  border: '1px solid #52c41a',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Login / Register
              </button>
            )}

            {!isLargeScreen() && (
              <button
                onClick={() => setMobileMenuVisible(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="pi pi-bars" style={{ fontSize: '24px', color: '#1f2937' }} />
              </button>
            )}
          </div>
        </div>
      </header>

      <Sidebar
        visible={mobileMenuVisible}
        onHide={() => setMobileMenuVisible(false)}
        position="right"
        style={{ width: window.innerWidth < 576 ? '80%' : '300px', fontFamily: 'Inter, sans-serif' }}
      >
        <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', color: '#52c41a', fontWeight: 'bold' }}>Menu</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {getMenuItems(true).map((item) => (
            <li
              key={item.key}
              style={{
                padding: '16px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onClick={item.label.props.onClick}
            >
              {item.icon}
              <span style={{ fontSize: '16px', fontWeight: 600, color: activeKey === item.key ? '#52c41a' : '#1f2937' }}>
                {item.label.props.children}
              </span>
            </li>
          ))}
        </ul>
      </Sidebar>
    </>
  );
};

export default FoodNavbar;
