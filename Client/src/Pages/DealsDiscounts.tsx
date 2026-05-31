import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { AuthContext } from '../context/AuthContext';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  discountPercentage?: number;
  discountPrice?: number;
}

export default function DealsDiscounts() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const toastRef = useRef<Toast>(null);
  
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Pre-configured backup coupons if the user is guest or announcements are empty
  const defaultCoupons: Coupon[] = [
    {
      _id: 'default1',
      code: 'FIRST20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 500,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    },
    {
      _id: 'default2',
      code: 'WELCOME100',
      discountType: 'fixed',
      discountValue: 100,
      minOrderAmount: 800,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString()
    },
    {
      _id: 'default3',
      code: 'FEAST50',
      discountType: 'fixed',
      discountValue: 50,
      minOrderAmount: 400,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString()
    }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch active coupon announcements if authenticated
      if (auth?.isAuthenticated) {
        const token = auth.token || localStorage.getItem('token');
        try {
          const couponRes = await axios.get(`${backendUrl}/api/promo/coupons/announcements`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (couponRes.data.success) {
            setCoupons(couponRes.data.announcements || []);
          }
        } catch (couponErr) {
          console.warn('Failed to load active coupons:', couponErr);
        }
      }

      // 2. Fetch all products to extract active catalog discounts
      const productsRes = await axios.get(`${backendUrl}/api/products/getallproducts`);
      if (productsRes.data.success) {
        const allProducts: Product[] = productsRes.data.data || [];
        // Filter products with active discounts
        const itemsWithDiscount = allProducts.filter(p => p.discountPercentage && p.discountPercentage > 0);
        setDiscountedProducts(itemsWithDiscount);
      }
    } catch (err) {
      console.error('Failed to load deals page data:', err);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load dynamic discount data. Please refresh.',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth?.isAuthenticated]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toastRef.current?.show({
      severity: 'success',
      summary: 'Copied ✓',
      detail: `Coupon code "${code}" copied to clipboard! Apply it at checkout.`,
      life: 2500
    });
  };

  const handleShopNow = () => {
    navigate('/menu-items');
  };

  const activeCoupons = coupons.length > 0 ? coupons : defaultCoupons;

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      color: '#1e293b',
      background: '#f8fafc',
      minHeight: '80vh',
      padding: '2rem 1rem'
    }}>
      <Toast ref={toastRef} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
          <span>/</span>
          <span style={{ color: '#22c55e' }}>Deals & Discounts</span>
        </div>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          textAlign: 'center',
          marginBottom: '3rem',
          border: '1px solid #fef08a',
          boxShadow: '0 10px 30px rgba(234, 179, 8, 0.05)'
        }}>
          <span style={{
            background: '#ca8a04',
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
            🎉 Mega Offers Page
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#854d0e', margin: '0 0 1rem 0', letterSpacing: '-1px' }}>
            Deals, Coupons & Catalog Discounts
          </h1>
          <p style={{ color: '#a16207', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5, fontWeight: 500 }}>
            Save big on your next meal! Check out active discount promo codes and dynamic catalog price cuts below.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem', color: '#eab308' }} />
            <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 600 }}>Fetching latest offers...</p>
          </div>
        ) : (
          <div>
            {/* Active Coupon Codes Section */}
            <div style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎟️ Active Coupon Codes
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
              }}>
                {activeCoupons.map((coupon) => (
                  <Card 
                    key={coupon._id}
                    style={{
                      borderRadius: '16px',
                      border: '2px dashed #e2e8f0',
                      background: '#ffffff',
                      boxShadow: 'none',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <Tag 
                        value={coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                        severity="warning"
                        style={{ fontSize: '0.8rem', fontWeight: 800, padding: '0.3rem 0.6rem', borderRadius: '6px' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                        Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#334155', margin: '0 0 0.5rem 0' }}>
                      Min Order: ₹{coupon.minOrderAmount}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      {coupon.discountType === 'percentage' 
                        ? `Save ${coupon.discountValue}% on orders worth ₹${coupon.minOrderAmount} and above.`
                        : `Get flat ₹${coupon.discountValue} discount on your checkout worth ₹${coupon.minOrderAmount} and above.`}
                    </p>

                    <div style={{
                      display: 'flex',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem'
                    }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                        {coupon.code}
                      </span>
                      <Button 
                        icon="pi pi-copy" 
                        className="p-button-rounded p-button-text p-button-sm"
                        style={{ color: '#eab308' }}
                        onClick={() => copyToClipboard(coupon.code)}
                        tooltip="Copy Code"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Catalog Discounts Section */}
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔥 Direct Catalog Price Cuts
              </h2>

              {discountedProducts.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <i className="pi pi-percentage" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#334155', margin: '0 0 0.25rem 0' }}>No Active Product Discounts</h3>
                  <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
                    All products are currently at standard competitive pricing. Stay tuned for dynamic weekend deals!
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '2.5rem'
                }}>
                  {discountedProducts.map((prod) => (
                    <Card
                      key={prod._id}
                      style={{
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        background: '#ffffff',
                        boxShadow: 'none'
                      }}
                    >
                      <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <img 
                          src={prod.image} 
                          alt={prod.title} 
                          style={{
                            width: '100%',
                            height: '160px',
                            objectFit: 'cover',
                            borderRadius: '12px'
                          }} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px'
                        }}>
                          {prod.discountPercentage}% OFF
                        </div>
                      </div>

                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {prod.category}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0.25rem 0 0.75rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.title}
                      </h4>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ef4444' }}>
                            ₹{(prod.discountPrice ?? prod.price).toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                            ₹{prod.price.toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          label="Shop Now" 
                          icon="pi pi-shopping-cart"
                          className="p-button-sm p-button-outlined p-button-success" 
                          style={{ borderRadius: '8px', fontWeight: 700 }}
                          onClick={handleShopNow}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}