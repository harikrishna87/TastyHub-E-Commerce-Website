import React, { useContext, useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sidebar } from 'primereact/sidebar';
import axios from 'axios';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for live clock
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  
  // State for greeting
  const [greeting, setGreeting] = useState<string>('Good Morning');

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifyDrawerOpen, setNotifyDrawerOpen] = useState<boolean>(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.get(`${backendUrl}/api/admin/notifications`, config);
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    }
  }, [auth?.token, backendUrl]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.patch(`${backendUrl}/api/admin/notifications/${id}/read`, {}, config);
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.patch(`${backendUrl}/api/admin/notifications/read-all`, {}, config);
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.delete(`${backendUrl}/api/admin/notifications/${id}`, config);
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.delete(`${backendUrl}/api/admin/notifications`, config);
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setTimeStr(now.toLocaleTimeString('en-US', timeOptions));
      
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      };
      setDateStr(now.toLocaleDateString('en-US', dateOptions));

      const hrs = now.getHours();
      if (hrs < 12) setGreeting('Good Morning');
      else if (hrs < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const adminName = auth?.user?.name || 'Administrator';
  const adminEmail = auth?.user?.email || 'admin@tastyhub.com';
  const adminImage = auth?.user?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  const menuItems = [
    { label: 'Home', icon: 'pi pi-home', path: '/admin/home' },
    { label: 'Orders', icon: 'pi pi-shopping-bag', path: '/admin/ordermanagement' },
    { label: 'Products', icon: 'pi pi-box', path: '/admin/productspage' },
    { label: 'Payments', icon: 'pi pi-credit-card', path: '/admin/paymentoverview' },
    { label: 'Customers', icon: 'pi pi-users', path: '/admin/customers' },
    { label: 'Delivery Executives', icon: 'pi pi-truck', path: '/admin/delivery' },
    { label: 'Coupons & Discounts', icon: 'pi pi-tags', path: '/admin/coupons' },
    { label: 'Combo Deals', icon: 'pi pi-briefcase', path: '/admin/combodeals' },
    { label: 'Gift Cards', icon: 'pi pi-gift', path: '/admin/giftcards' },
    { label: 'Profile', icon: 'pi pi-user', path: '/admin/profilepage' },
  ];

  const handleLogout = async () => {
    if (auth?.logout) {
      await auth.logout();
      navigate('/');
    }
  };

  return (
    <div style={styles.layoutContainer}>
      {/* Sidebar Panel */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <img src="/logo.png" alt="TastyHub Logo" style={styles.logoImg} onError={(e)=>{(e.target as any).src='https://primefaces.org/cdn/primereact/images/logo.png'}} />
          <span style={styles.logoText}>TastyHub</span>
        </div>
        
        <nav style={styles.navSection}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/admin/home' && location.pathname === '/admin/orderanalytics');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={isActive ? styles.activeNavLink : styles.navLink}
              >
                <i className={item.icon} style={styles.navIcon(isActive)} />
                <span style={styles.linkLabel(isActive)}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn} className="admin-logout-btn">
          <i className="pi pi-sign-out" style={styles.logoutIcon} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Side */}
      <div style={styles.mainSide}>
        {/* Top Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.greetingTitle}>
              {greeting}, <span style={{ color: '#15803d', fontWeight: 'bold' }}>{adminName}</span>!
            </h1>
            <div style={styles.timeBlock}>
              <i className="pi pi-clock" style={styles.clockIcon} />
              <span style={styles.timeText}>{timeStr}</span>
              <span style={styles.divider}>|</span>
              <span style={styles.dateText}>{dateStr}</span>
            </div>
          </div>

          <div style={styles.headerRight}>
            {/* Notification Icon (Toggles Sidebar) */}
            <div style={styles.notifyContainer} onClick={() => setNotifyDrawerOpen(true)}>
              <div style={styles.notifyBell}>
                <i className="pi pi-bell" style={{ fontSize: '1.35rem', color: '#15803d' }} />
                {unreadCount > 0 && <span style={styles.notifyBadge}>{unreadCount}</span>}
              </div>
            </div>

            {/* Admin Profile Detail Card */}
            <div style={styles.adminProfileCard}>
              <img
                src={adminImage}
                alt="Admin profile"
                style={styles.adminAvatar}
                onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
              />
              <div style={styles.adminMeta}>
                <div style={styles.adminRole}>Admin Dashboard</div>
                <div style={styles.adminEmail}>{adminEmail}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={styles.contentBody}>
          {children}
        </main>
      </div>

      {/* Slide right-to-left notification drawer */}
      <Sidebar
        visible={notifyDrawerOpen}
        onHide={() => setNotifyDrawerOpen(false)}
        position="right"
        style={{ width: '480px', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="pi pi-bell" style={{ color: '#15803d', fontSize: '1.2rem' }}></i> Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                {unreadCount} New
              </span>
            )}
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: unreadCount > 0 ? '#15803d' : '#cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: unreadCount > 0 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <i className="pi pi-check-circle"></i> Mark all read
            </button>
            <button
              onClick={handleDeleteAllNotifications}
              disabled={notifications.length === 0}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: notifications.length > 0 ? '#ef4444' : '#cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: notifications.length > 0 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <i className="pi pi-trash"></i> Clear all
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '4px' }}>
            {notifications.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#94a3b8', gap: '1rem', textAlign: 'center' }}>
                <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No notifications yet</div>
                <div style={{ fontSize: '0.8rem' }}>We'll notify you here about new orders and user registrations.</div>
              </div>
            ) : (
              notifications.map((notif: any) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                  className="notification-item"
                  style={{
                    padding: '1.15rem 1.25rem',
                    borderRadius: '14px',
                    backgroundColor: notif.isRead ? '#ffffff' : '#f0fdf4',
                    border: notif.isRead ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
                    cursor: notif.isRead ? 'default' : 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: notif.isRead ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        backgroundColor: notif.type === 'new_order' ? '#dcfce7' : '#dbeafe',
                        color: notif.type === 'new_order' ? '#15803d' : '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className={notif.type === 'new_order' ? 'pi pi-shopping-cart' : 'pi pi-user-plus'} style={{ fontSize: '0.9rem' }}></i>
                    </div>
                    <div style={{ flex: 1, paddingRight: '1.25rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1f2937', marginBottom: '0.2rem' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: '1.45', marginBottom: '0.4rem' }}>
                        {notif.message}
                      </div>
                      {notif.orderAmount !== undefined && (
                        <div style={{ display: 'inline-block', backgroundColor: '#e2e8f0', color: '#374151', fontWeight: 700, fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          ₹{notif.orderAmount.toFixed(2)}
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
                        <i className="pi pi-calendar" style={{ fontSize: '0.65rem' }}></i>
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNotification(notif._id, e)}
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <i className="pi pi-times" style={{ fontSize: '0.75rem' }}></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

// Sleek CSS-in-JS style styles matching the first mockup image
const styles = {
  layoutContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    overflowX: 'hidden' as const,
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1.5rem 1rem',
    position: 'fixed' as const,
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    paddingLeft: '0.5rem',
  },
  logoImg: {
    height: '36px',
    width: '36px',
    objectFit: 'contain' as const,
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#15803d', // TastyHub primary Green
    letterSpacing: '-0.5px',
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    flex: 1,
    overflowY: 'auto' as const,
    paddingRight: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#64748b',
    fontSize: '0.92rem',
    fontWeight: 500,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  activeNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#15803d',
    backgroundColor: '#dcfce7', // Soft green background
    fontSize: '0.92rem',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.08)',
    transform: 'translateY(-1px)',
  },
  navIcon: (isActive: boolean) => ({
    fontSize: '1.1rem',
    color: isActive ? '#15803d' : '#94a3b8',
    transition: 'color 0.25s ease',
  }),
  linkLabel: (isActive: boolean) => ({
    color: isActive ? '#15803d' : '#475569',
  }),
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontSize: '0.92rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
    marginTop: 'auto',
    transition: 'all 0.2s ease',
  },
  logoutIcon: {
    fontSize: '1.1rem',
    color: '#ef4444',
  },
  mainSide: {
    marginLeft: '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    width: 'calc(100% - 260px)',
    minWidth: 0, // fixes horizontal overflow
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    position: 'fixed' as const,
    top: 0,
    right: 0,
    left: '260px',
    height: '75px',
    zIndex: 90,
    boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
  },
  greetingTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  timeBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.2rem',
  },
  clockIcon: {
    fontSize: '0.85rem',
    color: '#15803d',
  },
  timeText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#15803d',
  },
  divider: {
    color: '#cbd5e1',
    fontSize: '0.85rem',
  },
  dateText: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#64748b',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  notifyContainer: {
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '10px',
    transition: 'background-color 0.2s ease',
    backgroundColor: '#f8fafc',
  },
  notifyBell: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyBadge: {
    position: 'absolute' as const,
    top: '-6px',
    right: '-6px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.65rem',
    fontWeight: 700,
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
  },
  adminProfileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderLeft: '1px solid #e2e8f0',
    paddingLeft: '1.5rem',
  },
  adminAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '2px solid #15803d',
  },
  adminMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  adminRole: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  adminEmail: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.05rem',
  },
  contentBody: {
    padding: '2rem',
    paddingTop: 'calc(75px + 2rem)', // To push down from fixed header
    flex: 1,
    backgroundColor: '#f8fafc',
    overflowY: 'auto' as const,
  },
};

export default AdminLayout;

