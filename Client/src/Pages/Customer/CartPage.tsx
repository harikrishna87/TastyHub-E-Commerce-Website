import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

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
  const deliveryCharge = 40; // Synchronized with standard TastyHub delivery fee
  const freeDeliveryThreshold = 299; // Synchronized with FAQ/Store free delivery limit (₹299)

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const toastRef = useRef<Toast>(null);

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

      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update quantity', life: 2000 });
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

      toastRef.current?.show({ severity: 'success', summary: 'Removed', detail: `"${name}" removed from cart`, life: 2500 });

      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete item', life: 2000 });
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', backgroundColor: 'transparent' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading your Cart...</span>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const freeDelivery = subtotal >= freeDeliveryThreshold;
  const delivery = freeDelivery ? 0 : deliveryCharge;
  const finalTotal = subtotal + delivery;

  // Free delivery progress percentage
  const freeDeliveryProgress = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);

  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <Toast ref={toastRef} />
        <div style={styles.emptyCard}>
          <i className="pi pi-shopping-cart" style={styles.emptyIcon} />
          <h2 style={styles.emptyTitle}>Your Cart is Empty</h2>
          <p style={styles.emptySub}>Add delicious meals from our kitchen to fill it up!</p>
          <Button
            label="Explore Menu"
            icon="pi pi-arrow-left"
            onClick={() => navigate('/user/menu-items')}
            className="p-button-success"
            style={{ borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: 600 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="cart-container">
      <Toast ref={toastRef} />

      {/* Glassmorphic header section */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Shopping Cart</h1>
        <p style={styles.sub}>Review selected items and proceed to secure checkout</p>
      </div>

      <div style={styles.mainGrid} className="cart-main-grid">
        
        {/* Left column: Cart Items list */}
        <div style={styles.itemsColumn} className="cart-items-column hide-scrollbar">
          {cartItems.map((item) => (
            <div key={item._id} style={styles.itemCard} className="cart-item-card">
              <img
                src={item.image}
                alt={item.name}
                style={styles.itemImg}
                onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop' }}
              />
              <div style={styles.itemRightSide}>
                <div style={styles.itemDetails}>
                  <span style={styles.itemCategory}>{item.category}</span>
                  <h3 style={styles.itemName}>{item.name}</h3>
                </div>

                {/* Quantity selectors */}
                <div style={styles.qtyPanel}>
                  <button
                    onClick={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                    style={styles.qtyBtn}
                    disabled={item.quantity <= 1}
                  >
                    <i className="pi pi-minus" style={{ fontSize: '0.75rem' }} />
                  </button>
                  <span style={styles.qtyText}>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                    style={styles.qtyBtn}
                  >
                    <i className="pi pi-plus" style={{ fontSize: '0.75rem' }} />
                  </button>
                </div>

                {/* Price block */}
                <div style={styles.priceRow}>
                  {item.original_price > item.discount_price && (
                    <span style={styles.origPrice}>₹{(item.original_price * item.quantity).toFixed(2)}</span>
                  )}
                  <span style={styles.discPrice}>₹{(item.discount_price * item.quantity).toFixed(2)}</span>
                </div>

                {/* Delete button */}
                <Button
                  icon="pi pi-trash"
                  className="p-button-text p-button-danger p-button-sm"
                  onClick={() => handleDeleteItem(item.name)}
                  tooltip="Remove item"
                  style={{ color: '#ef4444', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right column: Totals summary card */}
        <div style={styles.summaryColumn} className="cart-summary-column">
          <div style={styles.summaryCard}>
            <h2 style={styles.summaryTitle}>
              <i className="pi pi-shopping-bag" style={{ color: '#22c55e', fontSize: '1.25rem' }} />
              <span>Order Total</span>
            </h2>
            <div style={styles.summarySub}>Complete summary of charges</div>

            {/* Free delivery progress bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 600 }}>
                {freeDelivery ? (
                  <span style={{ color: '#166534' }}>You qualified for FREE delivery! 🚚</span>
                ) : (
                  <span style={{ color: '#b45309' }}>Add ₹{(freeDeliveryThreshold - subtotal).toFixed(0)} more for FREE delivery</span>
                )}
                <span>₹{subtotal.toFixed(0)} / ₹{freeDeliveryThreshold}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${freeDeliveryProgress}%`,
                  backgroundColor: freeDelivery ? '#22c55e' : '#f59e0b',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{subtotal.toFixed(2)}</span>
            </div>

            <div style={styles.summaryRow}>
              <span>Delivery Fee</span>
              {freeDelivery ? (
                <span style={{ color: '#22c55e', fontWeight: 700 }}>FREE 🚚</span>
              ) : (
                <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{deliveryCharge.toFixed(2)}</span>
              )}
            </div>

            {savings > 0 && (
              <div style={{ ...styles.summaryRow, color: '#22c55e' }}>
                <span>Catalog Discounts 🎉</span>
                <span style={{ fontWeight: 700 }}>-₹{savings.toFixed(2)}</span>
              </div>
            )}

            <hr style={styles.hr} />

            <div style={styles.totalRow}>
              <span>Total Payable</span>
              <span style={styles.totalVal}>₹{finalTotal.toFixed(2)}</span>
            </div>

            {savings > 0 && (
              <div style={styles.savingsTag}>
                <span>You are saving ₹{savings.toFixed(2)} on this order today!</span>
              </div>
            )}

            <Button
              label="Proceed to Checkout"
              icon="pi pi-credit-card"
              onClick={() => navigate('/user/checkout')}
              className="p-button-success"
              style={{ width: '100%', marginTop: '1.5rem', borderRadius: '12px', padding: '0.85rem', fontWeight: 700, fontSize: '15px' }}
            />
            <Button
              label="Continue Shopping"
              icon="pi pi-arrow-left"
              onClick={() => navigate('/user/menu-items')}
              className="p-button-outlined p-button-secondary"
              style={{ width: '100%', marginTop: '0.75rem', borderRadius: '12px', padding: '0.85rem', fontWeight: 700, fontSize: '15px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: 'none',
    padding: '2rem 5%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-1px'
  },
  sub: {
    fontSize: '0.98rem',
    color: '#64748b',
    margin: '0.35rem 0 0 0',
    fontWeight: 500
  },
  mainGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '2rem',
    alignItems: 'start',
    width: '100%',
  },
  itemsColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.25rem',
    flex: '0 0 calc(70% - 1rem)',
    minWidth: '320px',
    maxHeight: '445px',
    overflowY: 'auto' as const,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
    flexWrap: 'wrap' as const,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  itemImg: {
    width: '90px',
    height: '90px',
    borderRadius: '12px',
    objectFit: 'cover' as const,
    border: '1px solid #f1f5f9',
  },
  itemRightSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    flexWrap: 'wrap' as const,
    minWidth: '240px',
  },
  itemDetails: {
    flex: 1,
    minWidth: '160px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
  },
  itemCategory: {
    fontSize: '0.73rem',
    textTransform: 'uppercase' as const,
    color: '#22c55e',
    fontWeight: 800,
    letterSpacing: '0.75px',
  },
  itemName: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: 0,
    letterSpacing: '-0.25px'
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginTop: '0px',
  },
  origPrice: {
    fontSize: '0.85rem',
    textDecoration: 'line-through',
    color: '#94a3b8',
    fontWeight: 500
  },
  discPrice: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#22c55e',
  },
  qtyPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    border: '1px solid #e2e8f0',
    padding: '0.4rem 0.6rem',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
  },
  qtyBtn: {
    border: 'none',
    background: '#ffffff',
    color: '#1e293b',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    fontWeight: 'bold',
    transition: 'background 0.2s'
  },
  qtyText: {
    fontWeight: 800,
    fontSize: '1rem',
    color: '#1e293b',
    minWidth: '22px',
    textAlign: 'center' as const,
  },
  itemTotalColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.35rem',
    minWidth: '90px',
  },
  itemTotalVal: {
    fontSize: '1.2rem',
    fontWeight: 900,
    color: '#0f172a',
  },
  summaryColumn: {
    flex: '0 0 calc(30% - 1rem)',
    minWidth: '300px',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03)',
  },
  summaryTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    fontSize: '1.4rem',
    fontWeight: 900,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  summarySub: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    margin: '0.25rem 0 1.5rem 0',
    fontWeight: 500
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: '#475569',
    marginBottom: '1rem',
    fontWeight: 500
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #f1f5f9',
    margin: '1.5rem 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#0f172a',
  },
  totalVal: {
    fontSize: '1.8rem',
    fontWeight: 900,
    color: '#22c55e',
    letterSpacing: '-0.5px'
  },
  savingsTag: {
    backgroundColor: '#f0fdf4',
    border: '1px dashed #bbf7d0',
    borderRadius: '12px',
    padding: '0.75rem',
    textAlign: 'center' as const,
    fontSize: '0.85rem',
    color: '#15803d',
    fontWeight: 700,
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
    padding: '3.5rem 2rem',
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const,
    maxWidth: '460px',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1.25rem',
  },
  emptyIcon: {
    fontSize: '4.5rem',
    color: '#cbd5e1',
    backgroundColor: '#f8fafc',
    padding: '1.75rem',
    borderRadius: '50%',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
  },
  emptyTitle: {
    fontSize: '1.65rem',
    fontWeight: 900,
    color: '#1e293b',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  emptySub: {
    fontSize: '0.92rem',
    color: '#64748b',
    margin: 0,
    fontWeight: 500,
    lineHeight: '1.5'
  },
};

export default CartPage;
