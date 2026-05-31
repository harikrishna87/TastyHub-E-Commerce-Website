import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from 'primereact/button';

interface CartItem {
  _id: string;
  name: string;
  image: string;
  discount_price: number;
  original_price: number;
  quantity: number;
  category: string;
}

const CartPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const deliveryCharge = 30;

  // States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCartItems = async (): Promise<void> => {
    if (!auth?.token) {
      setLoading(false);
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
        if (auth?.logout) auth.logout();
        navigate('/');
        return;
      }

      const data = await res.json();
      if (data && data.Cart_Items) {
        setCartItems(data.Cart_Items);
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate('/');
      return;
    }
    fetchCartItems();
  }, [auth?.isAuthenticated]);

  const handleQuantityUpdate = async (_id: string, newQty: number) => {
    if (newQty < 1) return;
    if (!auth?.token) return;

    // Optimistic UI update
    setCartItems(prev => prev.map(item => item._id === _id ? { ...item, quantity: newQty } : item));

    try {
      const res = await fetch(`${backendUrl}/api/cart/update_cart_quantity`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ _id, quantity: newQty }),
      });

      if (!res.ok) {
        throw new Error('Failed to update quantity');
      }

      // Notify other components (e.g. Navbar)
      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (err) {
      console.error(err);
      fetchCartItems(); // Rollback
    }
  };

  const handleDeleteItem = async (name: string) => {
    if (!auth?.token) return;

    // Optimistic UI update
    setCartItems(prev => prev.filter(item => item.name !== name));

    try {
      const res = await fetch(`${backendUrl}/api/cart/delete_cart_item/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to delete item');
      }

      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (err) {
      console.error(err);
      fetchCartItems(); // Rollback
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
  };

  const calculateSavings = () => {
    return cartItems.reduce((sum, item) => sum + (item.original_price - item.discount_price) * item.quantity, 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading your Cart...</span>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const freeDelivery = subtotal >= 200;
  const delivery = freeDelivery ? 0 : deliveryCharge;
  const finalTotal = subtotal + delivery;

  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyCard}>
          <i className="pi pi-shopping-cart" style={styles.emptyIcon} />
          <h2 style={styles.emptyTitle}>Your Cart is Empty</h2>
          <p style={styles.emptySub}>Add delicious meals from our kitchen to fill it up!</p>
          <Button
            label="Explore Menu"
            icon="pi pi-arrow-left"
            onClick={() => navigate('/menu-items')}
            className="p-button-success"
            style={{ borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: 600 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Shopping Cart</h1>
        <p style={styles.sub}>Review selected items and proceed to secure checkout</p>
      </div>

      <div style={styles.mainGrid}>
        {/* Left Side: Cart Items List */}
        <div style={styles.itemsColumn}>
          {cartItems.map((item) => (
            <div key={item._id} style={styles.itemCard}>
              <img
                src={item.image}
                alt={item.name}
                style={styles.itemImg}
                onError={(e) => { (e.target as any).src = 'https://primefaces.org/cdn/primereact/images/logo.png' }}
              />
              <div style={styles.itemDetails}>
                <span style={styles.itemCategory}>{item.category}</span>
                <h3 style={styles.itemName}>{item.name}</h3>
                
                <div style={styles.priceRow}>
                  {item.original_price > item.discount_price && (
                    <span style={styles.origPrice}>₹{item.original_price}</span>
                  )}
                  <span style={styles.discPrice}>₹{item.discount_price}</span>
                </div>
              </div>

              {/* Quantity Selector Panel */}
              <div style={styles.qtyPanel}>
                <Button
                  icon="pi pi-minus"
                  className="p-button-outlined p-button-success p-button-sm"
                  onClick={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                  style={{ borderRadius: '8px', width: '32px', height: '32px' }}
                  disabled={item.quantity <= 1}
                />
                <span style={styles.qtyText}>{item.quantity}</span>
                <Button
                  icon="pi pi-plus"
                  className="p-button-outlined p-button-success p-button-sm"
                  onClick={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                  style={{ borderRadius: '8px', width: '32px', height: '32px' }}
                />
              </div>

              <div style={styles.itemTotalColumn}>
                <span style={styles.itemTotalVal}>₹{(item.discount_price * item.quantity).toFixed(2)}</span>
                <Button
                  icon="pi pi-trash"
                  className="p-button-text p-button-danger"
                  onClick={() => handleDeleteItem(item.name)}
                  tooltip="Remove item"
                  style={{ borderRadius: '8px', color: '#ef4444' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Totals Summary */}
        <div style={styles.summaryColumn}>
          <div style={styles.summaryCard}>
            <h2 style={styles.summaryTitle}>
              <i className="pi pi-shopping-bag" style={{ color: '#22c55e' }} />
              <span>Order Total</span>
            </h2>
            <div style={styles.summarySub}>Complete summary of charges</div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
            </div>

            <div style={styles.summaryRow}>
              <span>Delivery Fee</span>
              {freeDelivery ? (
                <span style={{ color: '#22c55e', fontWeight: 600 }}>Free Delivery 🚚</span>
              ) : (
                <span>₹{deliveryCharge.toFixed(2)}</span>
              )}
            </div>

            {savings > 0 && (
              <div style={{ ...styles.summaryRow, color: '#22c55e' }}>
                <span>Coupon Savings 🎉</span>
                <span style={{ fontWeight: 600 }}>-₹{savings.toFixed(2)}</span>
              </div>
            )}

            <hr style={styles.hr} />

            <div style={styles.totalRow}>
              <span>Total Payable</span>
              <span style={styles.totalVal}>₹{finalTotal.toFixed(2)}</span>
            </div>

            {freeDelivery && (
              <div style={styles.savingsTag}>
                <span>You saved ₹{savings.toFixed(2)} on this order today!</span>
              </div>
            )}

            <Button
              label="Proceed to Checkout"
              icon="pi pi-credit-card"
              onClick={() => navigate('/checkout')}
              className="p-button-success"
              style={{ width: '100%', marginTop: '1.5rem', borderRadius: '12px', padding: '0.85rem', fontWeight: 600 }}
            />
            <Button
              label="Continue Shopping"
              icon="pi pi-arrow-left"
              onClick={() => navigate('/menu-items')}
              className="p-button-outlined p-button-secondary"
              style={{ width: '100%', marginTop: '0.5rem', borderRadius: '12px', padding: '0.85rem', fontWeight: 600 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  sub: {
    fontSize: '0.95rem',
    color: '#64748b',
    margin: '0.35rem 0 0 0',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    alignItems: 'start',
  },
  itemsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    flex: 2,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    flexWrap: 'wrap' as const,
  },
  itemImg: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    objectFit: 'cover' as const,
    border: '1px solid #f1f5f9',
  },
  itemDetails: {
    flex: 1,
    minWidth: '150px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
  },
  itemCategory: {
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    color: '#22c55e',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  origPrice: {
    fontSize: '0.88rem',
    textDecoration: 'line-through',
    color: '#94a3b8',
  },
  discPrice: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#22c55e',
  },
  qtyPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    border: '1px solid #e2e8f0',
    padding: '0.35rem 0.5rem',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
  },
  qtyText: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#334155',
    minWidth: '20px',
    textAlign: 'center' as const,
  },
  itemTotalColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.35rem',
    minWidth: '80px',
  },
  itemTotalVal: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#0f172a',
  },
  summaryColumn: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
  },
  summaryTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  summarySub: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    margin: '0.25rem 0 1.5rem 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: '#475569',
    marginBottom: '0.85rem',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #f1f5f9',
    margin: '1.25rem 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#0f172a',
  },
  totalVal: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#22c55e',
  },
  savingsTag: {
    backgroundColor: '#f0fdf4',
    border: '1px dashed #bbf7d0',
    borderRadius: '10px',
    padding: '0.65rem',
    textAlign: 'center' as const,
    fontSize: '0.82rem',
    color: '#15803d',
    fontWeight: 600,
    marginTop: '1rem',
  },
  emptyContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '2rem 1rem',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '3rem 2rem',
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const,
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1.25rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    color: '#cbd5e1',
    backgroundColor: '#f8fafc',
    padding: '1.5rem',
    borderRadius: '50%',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: 0,
  },
  emptySub: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
};

export default CartPage;
