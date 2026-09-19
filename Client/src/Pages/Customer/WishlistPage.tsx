import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

interface WishlistItem {
  _id: string;
  name: string;
  image: string;
  original_price: number;
  discount_price: number;
  category: string;
  description?: string;
}

const customWishlistStyles = `
.wishlist-grid-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;
}
@media (min-width: 576px) {
  .wishlist-grid-layout {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 992px) {
  .wishlist-grid-layout {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1200px) {
  .wishlist-grid-layout {
    grid-template-columns: repeat(4, 1fr);
  }
}
.wishlist-item-card {
  transition: all 0.2s ease-in-out;
}
.wishlist-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(34, 197, 94, 0.08) !important;
  border-color: #22c55e !important;
}
`;

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const [removingItem, setRemovingItem] = useState<{ [key: string]: boolean }>({});
  
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    (window as any).showToast?.(severity, summary, detail);
  };

  const fetchWishlist = async () => {
    if (!auth?.token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${backendUrl}/api/favorites/get_favorite_items`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        withCredentials: true
      });

      if (res.data && res.data.success) {
        setWishlistItems(res.data.Favorite_Items || []);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist items:', err);
      showToast('error', 'Error', 'Failed to fetch wishlist items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate('/user/auth');
      return;
    }

    fetchWishlist();

    const styleElement = document.createElement('style');
    styleElement.innerHTML = customWishlistStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [auth?.isAuthenticated]);

  const handleRemoveFromWishlist = async (itemId: string, name: string) => {
    if (!auth?.token) return;

    try {
      setRemovingItem(prev => ({ ...prev, [itemId]: true }));
      const res = await axios.delete(`${backendUrl}/api/favorites/delete_favorite_item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        withCredentials: true
      });

      if (res.data && res.data.success) {
        setWishlistItems(prev => prev.filter(item => item._id !== itemId));
        showToast('success', 'Removed', `"${name}" removed from wishlist`);
      }
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
      showToast('error', 'Error', 'Failed to remove item from wishlist');
    } finally {
      setRemovingItem(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!auth?.isAuthenticated) {
      navigate('/user/auth');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [item._id]: true }));

      const cartItem = {
        name: item.name,
        image: item.image,
        category: item.category,
        description: item.description || '',
        quantity: 1,
        original_price: item.original_price,
        discount_price: item.discount_price
      };

      const res = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (res.data && res.data.success) {
        showToast('success', 'Added to Cart', `"${item.name}" added to cart successfully`);
        if ((window as any).updateCartCount) {
          (window as any).updateCartCount();
        }
      }
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      showToast('error', 'Error', 'Failed to add item to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [item._id]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading your Wishlist...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0', width: '100%', minHeight: '80vh', boxSizing: 'border-box' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#1f2937' }}>My Wishlist</h2>
        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved in your favorites
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '16px', border: '1px dashed #e5e7eb' }}>
          <i className="pi pi-heart" style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4b5563', margin: '0 0 8px 0' }}>Your Wishlist is Empty</h2>
          <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto 24px auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Tap the heart icon on any food item to save it here for later ordering.
          </p>
          <Button
            label="Explore Menu"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={() => navigate('/user/menu-items')}
            className="p-button-success"
            style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 600 }}
          />
        </div>
      ) : (
        <div className="wishlist-grid-layout">
          {wishlistItems.map((item) => {
            const hasDiscount = item.original_price > item.discount_price;
            const discountPercentage = hasDiscount 
              ? Math.round(((item.original_price - item.discount_price) / item.original_price) * 100) 
              : 0;

            return (
              <div 
                key={item._id} 
                style={{
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                className="wishlist-item-card"
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '1px solid #f1f5f9'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  {hasDiscount && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '-6px',
                        backgroundColor: '#ff4d4f',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '8px' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.73rem', textTransform: 'uppercase', color: '#22c55e', fontWeight: 800, letterSpacing: '0.75px' }}>
                        {item.category}
                      </span>
                      <h3 
                        style={{ 
                          fontSize: '1.15rem', 
                          fontWeight: 800, 
                          color: '#1e293b', 
                          margin: '2px 0 0 0', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          maxWidth: '150px' 
                        }} 
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      {hasDiscount && (
                        <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: '#94a3b8', fontWeight: 500 }}>
                          ₹{item.original_price.toFixed(2)}
                        </span>
                      )}
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e' }}>
                        ₹{item.discount_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px' }}>
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={addingToCart[item._id]}
                      label={addingToCart[item._id] ? "" : "Add to Cart"}
                      icon={addingToCart[item._id] ? "pi pi-spin pi-spinner" : "pi pi-shopping-cart"}
                      className="p-button-success p-button-sm"
                      style={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '11px',
                        height: '30px',
                        padding: '0 10px',
                        flex: 1
                      }}
                    />
                    
                    <Button
                      icon={removingItem[item._id] ? "pi pi-spin pi-spinner" : "pi pi-trash"}
                      className="p-button-text p-button-danger p-button-sm"
                      onClick={() => handleRemoveFromWishlist(item._id, item.name)}
                      disabled={removingItem[item._id]}
                      style={{ 
                        width: '30px',
                        height: '30px',
                        padding: '0',
                        borderRadius: '50%',
                        backgroundColor: '#fff1f2',
                        border: 'none',
                        color: '#ff4d4f'
                      }}
                      tooltip="Remove"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
