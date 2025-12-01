import React, { useState, useEffect, useContext } from 'react';
import {
  Layout,
  Menu,
  Button,
  Badge,
  Drawer,
  Card,
  Tag,
  Typography,
  Space,
  Grid,
  message,
  Divider
} from 'antd';
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
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

const { Header } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface CartItem {
  _id: string;
  name: string;
  image: string;
  original_price: number;
  discount_price: number;
  quantity: number;
  category: string;
  description?: string;
}

const FoodNavbar: React.FC = () => {
  const [showCart, setShowCart] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState<number>(0);
  const [mobileMenuVisible, setMobileMenuVisible] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const deliveryCharge = 30;

  const getActiveKey = (pathname: string): string => {
    if (pathname === '/') return 'home';
    if (pathname === '/menu-items') return 'menu';
    if (pathname === '/contact') return 'contact';
    if (pathname === '/my-orders') return 'orders';
    if (pathname === '/profilepage') return 'profile';
    if (pathname === '/admin/orderanalytics') return 'orderanalytics';
    if (pathname === '/admin/productspage') return 'products';
    if (pathname === '/admin/ordermanagement') return 'ordermanagement';
    if (pathname === '/admin/paymentoverview') return 'paymentoverview';
    if (pathname === '/admin/profilepage') return 'profile';
    return '';
  };

  const activeKey = getActiveKey(location.pathname);

  const isLargeScreen = () => {
    return window.innerWidth > 900;
  };

  const fetchCartItems = async () => {
    if (!auth?.isAuthenticated || !auth?.token) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/cart/get_cart_items`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.status === 401) {
        if (auth?.logout) {
          auth.logout();
        }
        setCartItems([]);
        setCartCount(0);
        return;
      }

      const data = await res.json();
      if (data && data.Cart_Items) {
        setCartItems(data.Cart_Items);
        const count = data.Cart_Items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
        setCartCount(count);
      } else if (!data.success && data.message === "Not authorized, please log in") {
        if (auth?.logout) {
          auth.logout();
        }
        setCartItems([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      setCartItems([]);
      setCartCount(0);
    }
  };

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (auth?.isAuthenticated && auth?.token) {
      fetchCartItems();

      pollingInterval = setInterval(() => {
        fetchCartItems();
      }, 10000);
    } else {
      setCartItems([]);
      setCartCount(0);
    }

    const handleCartUpdate = () => {
      if (auth?.isAuthenticated && auth?.token) {
        fetchCartItems();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    (window as any).updateCartCount = fetchCartItems;

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      delete (window as any).updateCartCount;
    };
  }, [auth?.isAuthenticated, auth?.token]);

  const logout = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${auth?.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (auth?.logout) {
        auth.logout();
      }

      setCartItems([]);
      setCartCount(0);
      setShowCart(false);
      setMobileMenuVisible(false);

      if (response.ok) {
        messageApi.success({
          content: "User Logged Out successfully",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }

      setTimeout(() => {
        navigate("/")
      }, 1000);
    } catch (err) {
      console.error('Error logging out:', err);
      if (auth?.logout) {
        auth.logout();
      }
      messageApi.error({
        content: "Logout failed. Please try again.",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
    }
  };

  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cartItems]);

  const numericTotalPrice = cartItems.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => sum + item.original_price * item.quantity, 0);
  const totalSavings = totalOriginalPrice - numericTotalPrice;
  const freeDeliveryApplied = numericTotalPrice >= 200;

  const handleCartToggle = (): void => {
    if (!auth?.isAuthenticated) {
      setShowAuthModal(true);
      setIsLoginMode(true);
      return;
    }
    setShowCart(!showCart);
    if (!showCart) {
      fetchCartItems();
    }
  };

  const handleDeleteItem = async (name: string) => {
    if (!auth?.isAuthenticated || !auth?.token) {
      messageApi.error({
        content: "Please log in to remove items from your cart.",
        duration: 3,
        style: { marginTop: '10vh' },
      });
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/cart/delete_cart_item/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.status === 401) {
        if (auth?.logout) {
          auth.logout();
        }
        return;
      }

      if (res.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.name !== name));
        messageApi.success({
          content: "Item removed from cart",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
        if ((window as any).updateCartCount) {
          (window as any).updateCartCount();
        }
      } else {
        const errorData = await res.json();
        messageApi.error({
          content: errorData.message || "Failed to remove item",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }
    } catch (error) {
      console.error('Error deleting item from cart:', error);
      messageApi.error({
        content: "Failed to remove item",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
    }
  };

  const handleUpdateQuantity = async (_id: string, quantity: number) => {
    if (!auth?.isAuthenticated || !auth?.token) {
      messageApi.error({
        content: "Please log in to update cart item quantity.",
        duration: 3,
        style: { marginTop: '10vh' },
      });
      return;
    }
    if (quantity < 1) return;

    const updatedItems = cartItems.map(item =>
      item._id === _id ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);

    try {
      const res = await fetch(`${backendUrl}/api/cart/update_cart_quantity`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ _id, quantity }),
      });

      if (res.status === 401) {
        if (auth?.logout) {
          auth.logout();
        }
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to update item quantity');
      }
      messageApi.success({
        content: "Quantity updated successfully",
        duration: 3,
        style: {
          marginTop: '10vh'
        },
      });
      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      messageApi.error({
        content: "Failed to update quantity",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
      fetchCartItems();
    }
  };

  const toggleItemDescription = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'appetizer':
        return 'blue';
      case 'main course':
        return 'red';
      case 'dessert':
        return 'orange';
      case 'beverage':
        return 'cyan';
      default:
        return 'green';
    }
  };

  const handleCheckout = () => {
    if (!auth?.isAuthenticated) {
      setShowAuthModal(true);
      setIsLoginMode(true);
      return;
    }

    if (cartItems.length === 0) {
      messageApi.info({
        content: "Your cart is empty! Please add items to your cart before proceeding.",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
      return;
    }

    setShowCart(false);
    navigate('/checkout');
  };

  const handleLogoutClick = () => {
    setMobileMenuVisible(false);
    logout();
  };

  const isAdmin = auth?.user?.role === 'admin';

  const getMenuItems = () => {
    if (auth?.isAuthenticated) {
      if (isAdmin) {
        return [
          {
            key: 'orderanalytics',
            icon: <DashboardOutlined style={{ color: activeKey === 'orderanalytics' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/orderanalytics'); }} style={{ color: activeKey === 'orderanalytics' ? '#52c41a' : 'inherit' }}>Order Analytics</span>,
          },
          {
            key: 'products',
            icon: <ProductOutlined style={{ color: activeKey === 'products' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/productspage'); }} style={{ color: activeKey === 'products' ? '#52c41a' : 'inherit' }}>Products</span>,
          },
          {
            key: 'ordermanagement',
            icon: <UnorderedListOutlined style={{ color: activeKey === 'ordermanagement' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/ordermanagement'); }} style={{ color: activeKey === 'ordermanagement' ? '#52c41a' : 'inherit' }}>Order Management</span>,
          },
          {
            key: 'paymentoverview',
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/paymentoverview'); }} style={{ color: activeKey === 'paymentoverview' ? '#52c41a' : 'inherit' }}> ₹ Payment Overview</span>,
          },
           {
            key: 'profile',
            icon: <UserOutlined style={{ color: activeKey === 'profile' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/profilepage'); }} style={{ color: activeKey === 'profile' ? '#52c41a' : 'inherit' }}>Profile</span>,
          },
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: <span onClick={handleLogoutClick}>Logout</span>,
            style: { color: '#1890ff' }
          }
        ];
      } else {
        return [
          {
            key: 'home',
            icon: <HomeOutlined style={{ color: activeKey === 'home' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }} style={{ color: activeKey === 'home' ? '#52c41a' : 'inherit' }}>Home</span>,
          },
          {
            key: 'menu',
            icon: <MenuOutlined style={{ color: activeKey === 'menu' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/menu-items'); }} style={{ color: activeKey === 'menu' ? '#52c41a' : 'inherit' }}>Menu</span>,
          },
          {
            key: 'contact',
            icon: <ContactsOutlined style={{ color: activeKey === 'contact' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/contact'); }} style={{ color: activeKey === 'contact' ? '#52c41a' : 'inherit' }}>Contact</span>,
          },
          {
            key: 'orders',
            icon: <UnorderedListOutlined style={{ color: activeKey === 'orders' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/my-orders'); }} style={{ color: activeKey === 'orders' ? '#52c41a' : 'inherit' }}>My Orders</span>,
          },
          {
            key: 'profile',
            icon: <UserOutlined style={{ color: activeKey === 'profile' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/profilepage'); }} style={{ color: activeKey === 'profile' ? '#52c41a' : 'inherit' }}>Profile</span>,
          },
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: <span onClick={handleLogoutClick}>Logout</span>,
            style: { color: '#1890ff' }
          }
        ];
      }
    } else {
      return [
        {
          key: 'home',
          icon: <HomeOutlined style={{ color: activeKey === 'home' ? '#52c41a' : 'inherit' }} />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }} style={{ color: activeKey === 'home' ? '#52c41a' : 'inherit' }}>Home</span>,
        },
        {
          key: 'menu',
          icon: <MenuOutlined style={{ color: activeKey === 'menu' ? '#52c41a' : 'inherit' }} />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/menu-items'); }} style={{ color: activeKey === 'menu' ? '#52c41a' : 'inherit' }}>Menu</span>,
        },
        {
          key: 'contact',
          icon: <ContactsOutlined style={{ color: activeKey === 'contact' ? '#52c41a' : 'inherit' }} />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/contact'); }} style={{ color: activeKey === 'contact' ? '#52c41a' : 'inherit' }}>Contact</span>,
        },
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: <span onClick={() => { setMobileMenuVisible(false); setShowAuthModal(true); setIsLoginMode(true); }}>Login / Register</span>,
          style: { color: '#52c41a' }
        }
      ];
    }
  };

  return (
    <>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '0 16px',
          height: 'auto',
          lineHeight: 'normal'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '8px 0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                height: screens.xs ? '32px' : '40px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
            <Title
              level={3}
              style={{
                margin: 0,
                color: '#52c41a',
                fontWeight: 'bold',
                fontSize: screens.xs ? '20px' : '28px'
              }}
            >
              <NavLink to="/" style={{ color: '#52c41a', textDecoration: 'none' }}>
                TastyHub
              </NavLink>
            </Title>
          </div>

          {isLargeScreen() && (
            <Menu
              mode="horizontal"
              selectedKeys={[activeKey]}
              style={{
                border: 'none',
                background: 'transparent',
                flex: 1,
                justifyContent: 'center'
              }}
              items={getMenuItems()}
            />
          )}

          <Space size="middle">
            {!isAdmin && (
              <Badge count={cartCount} size="small">
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined style={{ fontSize: '24px' }} />}
                  onClick={handleCartToggle}
                  size="large"
                />
              </Badge>
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
        <Menu
          mode="vertical"
          selectedKeys={[activeKey]}
          style={{ border: 'none' }}
          items={getMenuItems()}
        />
      </Drawer>

      {!isAdmin && (
        <Drawer
          title="Your Cart"
          placement="right"
          onClose={() => setShowCart(false)}
          open={showCart}
          width={screens.xs ? '100%' : 400}
          bodyStyle={{ padding: 0 }}
        >
          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh'
            }}>
              <ShoppingCartOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4} style={{ marginBottom: '16px' }}>Your cart is empty</Title>
              <Button style={{ color: "#52c41a", backgroundColor: "white", border: "1px solid #52c41a" }} onClick={() => setShowCart(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                maxHeight: 'calc(100vh - 200px)'
              }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {cartItems.map(item => (
                    <Card
                      key={item._id}
                      size="small"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      bodyStyle={{ padding: '12px' }}
                      hoverable
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          style={{
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                              {item.name}
                            </Title>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              onClick={() => handleDeleteItem(item.name)}
                            />
                          </div>

                          <div style={{ marginBottom: '8px' }}>
                            <Tag color={getCategoryColor(item.category)} style={{ borderRadius: '5px' }}>
                              {item.category}
                            </Tag>
                            <Button
                              type="link"
                              size="small"
                              icon={<InfoCircleOutlined />}
                              onClick={() => toggleItemDescription(item._id || '')}
                              style={{ padding: '0 4px', height: 'auto', fontSize: '12px', color: "#52c41a" }}
                            >
                              {expandedItems[item._id || ''] ? 'Hide details' : 'Show details'}
                            </Button>
                          </div>

                          {expandedItems[item._id || ''] && (
                            <div style={{
                              background: '#f5f5f5',
                              padding: '8px',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              fontSize: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}>
                              {item.description || "A delicious dish made with fresh ingredients and authentic spices."}
                            </div>
                          )}

                          <div style={{ marginBottom: '8px' }}>
                            <Text delete style={{ color: '#999', marginRight: '8px' }}>
                              ₹{item.original_price}
                            </Text>
                            <Text strong style={{ color: '#52c41a' }}>
                              ₹{item.discount_price.toFixed(2)}
                            </Text>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Space>
                              <Button
                                style={{
                                  color: "white",
                                  backgroundColor: "#52c41a",
                                  border: "1px solid #52c41a"
                                }}
                                shape="circle"
                                size="small"
                                icon={<MinusOutlined />}
                                onClick={() => handleUpdateQuantity(item._id || '', item.quantity - 1)}
                              />
                              <Text strong>{item.quantity}</Text>
                              <Button
                                style={{
                                  color: "white",
                                  backgroundColor: "#52c41a",
                                  border: "1px solid #52c41a"
                                }}
                                shape="circle"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => handleUpdateQuantity(item._id || '', item.quantity + 1)}
                              />
                            </Space>
                            <Text strong>
                              ₹{(item.discount_price * item.quantity).toFixed(2)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Space>
              </div>

              {cartItems.length > 0 && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid #f0f0f0',
                  background: '#fff'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    {totalSavings > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#52c41a' }}>
                        <Text style={{ color: '#52c41a', fontSize: '15px' }}>Total Amount You Saved 🎉 Today</Text>
                        <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>₹{totalSavings.toFixed(2)}</Text>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text>Subtotal</Text>
                      <Text>₹{numericTotalPrice.toFixed(2)}</Text>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '15px' }}>Delivery Charges</Text>
                      {freeDeliveryApplied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Text delete style={{ color: '#999', fontSize: '14px' }}>₹{deliveryCharge}</Text>
                          <Text style={{ color: '#52c41a', fontSize: '15px' }}>Free 🚚</Text>
                        </div>
                      ) : (
                        <Text style={{ fontSize: '15px' }}>₹{deliveryCharge}</Text>
                      )}
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Title level={4} style={{ margin: 0 }}>Total Amount</Title>
                      <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                        ₹{freeDeliveryApplied ? numericTotalPrice.toFixed(2) : (numericTotalPrice + deliveryCharge).toFixed(2)}
                      </Title>
                    </div>
                  </div>
                  <Button
                    style={{
                      backgroundColor: "#52c41a",
                      color: "white",
                      border: "1px solid #52c41a",
                    }}
                    size="large"
                    block
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          )}
        </Drawer>
      )}

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

        .ant-menu-horizontal > .ant-menu-item:hover {
          background-color: transparent !important;
          color: inherit !important;
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item::after {
          display: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item:hover::after {
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

        .ant-menu-horizontal > .ant-menu-item-selected:hover {
          background-color: transparent !important;
          color: #52c41a !important;
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected:hover::after {
          display: none !important;
        }

        .ant-menu-horizontal .ant-menu-item-active {
          background-color: transparent !important;
          border-bottom: none !important;
        }

        .ant-menu-horizontal .ant-menu-item-active::after {
          display: none !important;
        }

        .ant-menu-vertical > .ant-menu-item {
          font-size: 18px !important;
          font-weight: 600;
        }

        .ant-menu-vertical > .ant-menu-item:hover {
          background-color: transparent !important;
          color: inherit !important;
        }

        .ant-menu-vertical > .ant-menu-item-selected {
          background-color: transparent !important;
          color: #52c41a !important;
          font-weight: 700 !important;
        }

        .ant-menu-vertical > .ant-menu-item-selected:hover {
          background-color: transparent !important;
          color: #52c41a !important;
        }

        .ant-drawer-body::-webkit-scrollbar {
          width: 6px;
        }

        .ant-drawer-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .ant-drawer-body::-webkit-scrollbar-thumb {
          background: #52c41a;
          border-radius: 10px;
        }

        .ant-drawer-body::-webkit-scrollbar-thumb:hover {
          background: #389e0d;
        }

        .ant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }

        @media (max-width: 768px) {
          .ant-layout-header {
            padding: 0 12px !important;
          }
        }
      `}</style>
    </>
  );
};

export default FoodNavbar;