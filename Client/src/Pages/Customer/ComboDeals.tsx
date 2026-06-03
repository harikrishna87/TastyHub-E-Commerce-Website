import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { AuthContext } from '../../context/AuthContext';


interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

interface ComboDeal {
  _id: string;
  name: string;
  products: Product[];
  comboPrice: number;
  totalLimit: number;
  timesAccessed: number;
  accessedUsers: string[];
  endTime: string;
  isActive: boolean;
}

export default function ComboDeals() {
  const [combos, setCombos] = useState<ComboDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [buyingCombo, setBuyingCombo] = useState<{ [key: string]: boolean }>({});

  const toastRef = useRef<Toast>(null);
  
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/promo/combos`);
      if (response.data.success) {
        setCombos(response.data.combos || []);
      }
    } catch (err) {
      console.error('Failed to fetch combos:', err);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load combo deals. Please try again.',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const handleBuyCombo = async (combo: ComboDeal) => {
    if (!auth?.isAuthenticated) {
      navigate('/user/auth');
      return;
    }

    const isAlreadyClaimed = combo.accessedUsers.includes(auth.user?._id || '');
    if (isAlreadyClaimed) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Already Claimed',
        detail: 'You have already claimed this combo deal. It has a limit of 1 per customer.',
        life: 4000
      });
      return;
    }

    try {
      setBuyingCombo(prev => ({ ...prev, [combo._id]: true }));
      const token = auth.token || localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Clear cart
      await axios.delete(`${backendUrl}/api/cart/clear_cart`, { headers, withCredentials: true });

      // 2. Add each item in combo to cart
      for (const prod of combo.products) {
        const cartItem = {
          name: prod.title,
          image: prod.image,
          category: prod.category,
          description: prod.description,
          quantity: 1,
          original_price: prod.price,
          discount_price: prod.price // combo deal has overall fixed pricing at checkout!
        };
        await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, { headers, withCredentials: true });
      }

      // Notify and redirect
      toastRef.current?.show({
        severity: 'success',
        summary: 'Combo Cart Populated',
        detail: 'Your cart has been set up with the combo items. Redirecting to Checkout...',
        life: 2500
      });

      setTimeout(() => {
        if ((window as any).updateCartCount) {
          (window as any).updateCartCount();
        }
        navigate(`/user/checkout?comboId=${combo._id}`);
      }, 1500);

    } catch (error) {
      console.error('Error populating combo cart:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Checkout Failed',
        detail: 'Failed to initialize combo checkout. Please try again.',
        life: 4000
      });
    } finally {
      setBuyingCombo(prev => ({ ...prev, [combo._id]: false }));
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      color: '#1e293b',
      background: 'transparent',
      minHeight: '80vh',
      padding: '2rem 1rem'
    }}>
      <Toast ref={toastRef} />


      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Breadcrumbs */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
          <span>/</span>
          <span style={{ color: '#22c55e' }}>Combo Deals</span>
        </div>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          textAlign: 'center',
          marginBottom: '3rem',
          border: '1px solid #a7f3d0',
          boxShadow: '0 10px 30px rgba(34, 197, 94, 0.05)'
        }}>
          <span style={{
            background: '#22c55e',
            color: '#ffffff',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            Limited Feast Offers
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#14532d', margin: '0 0 1rem 0', letterSpacing: '-1px' }}>
            Exclusive Feast Combo Deals
          </h1>
          <p style={{ color: '#166534', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5, fontWeight: 500 }}>
            Enjoy premium collections of your favorite dishes together for a single incredibly discounted price.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem', color: '#22c55e' }} />
            <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 600 }}>Loading dynamic combo deals...</p>
          </div>
        ) : combos.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <i className="pi pi-gift" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#334155', margin: '0 0 0.5rem 0' }}>No Active Combo Deals</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
              We are currently designing fresh combo deals. Check back soon to grab absolute culinary bargains!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {combos.map((combo) => {
              const isAlreadyClaimed = combo.accessedUsers.includes(auth?.user?._id || '');
              const totalOriginal = combo.products.reduce((sum, p) => sum + p.price, 0);
              const savings = Math.max(0, totalOriginal - combo.comboPrice);
              const isExpired = new Date() > new Date(combo.endTime);

              return (
                <Card 
                  key={combo._id} 
                  style={{
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  className="hover:shadow-md transition-shadow duration-300"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', letterSpacing: '-0.5px' }}>{combo.name}</h3>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>TastyHub Special Combo</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#22c55e' }}>₹{combo.comboPrice}</div>
                      {savings > 0 && (
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>Original: ₹{totalOriginal}</div>
                      )}
                    </div>
                  </div>

                  {savings > 0 && (
                    <div style={{
                      backgroundColor: '#22c55e',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      width: 'fit-content',
                      marginBottom: '1.5rem',
                      boxShadow: '0 4px 10px rgba(34, 197, 94, 0.15)'
                    }}>
                      INSTANT SAVINGS: ₹{savings.toFixed(2)}
                    </div>
                  )}

                  {/* Items list */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginBottom: '1.5rem', flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                      Products Included ({combo.products.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {combo.products.map((prod) => (
                        <div key={prod._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={prod.image} 
                            alt={prod.title} 
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0'
                            }} 
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{prod.title}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>{prod.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checkout buttons */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: 'auto' }}>
                    <Button 
                      label={isAlreadyClaimed ? 'Already Claimed ✓' : isExpired ? 'Deal Expired' : 'Buy Feast Combo'} 
                      icon="pi pi-shopping-bag" 
                      className="w-full p-button-success" 
                      disabled={isAlreadyClaimed || isExpired || buyingCombo[combo._id]}
                      loading={buyingCombo[combo._id]}
                      onClick={() => handleBuyCombo(combo)}
                      style={{
                        borderRadius: '12px',
                        fontWeight: 700,
                        padding: '0.75rem',
                        backgroundColor: isAlreadyClaimed ? '#cbd5e1' : '#22c55e',
                        borderColor: isAlreadyClaimed ? '#cbd5e1' : '#22c55e'
                      }}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                      <span>Claim Limit: 1 Per User</span>
                      <span>Claims: {combo.timesAccessed} / {combo.totalLimit}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
