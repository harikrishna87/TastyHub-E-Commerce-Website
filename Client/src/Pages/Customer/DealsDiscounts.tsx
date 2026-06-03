import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Paginator } from 'primereact/paginator';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { AuthContext } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateFormatter';

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
  name?: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  discountPercentage?: number;
  discountPrice?: number;
  rating?: number | { rate: number; count: number };
  ingredients?: string[];
  calories?: number;
  ageRecommendation?: string;
}

export default function DealsDiscounts() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  
  // Pagination State
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(8); // 8 items per page

  // Dialog / Details Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);

  const toastRef = useRef<Toast>(null);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      try {
        const couponRes = await axios.get(`${backendUrl}/api/promo/coupons/active`);
        if (couponRes.data.success) {
          setCoupons(couponRes.data.coupons || []);
        }
      } catch (couponErr) {
        console.warn('Failed to load active coupons:', couponErr);
      }

      const productsRes = await axios.get(`${backendUrl}/api/products/getallproducts`);
      if (productsRes.data.success) {
        const allProducts: Product[] = productsRes.data.data || [];
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
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toastRef.current?.show({
      severity: 'success',
      summary: 'Copied ✓',
      detail: `Coupon code "${code}" copied to clipboard! Apply it at checkout.`,
      life: 2500
    });
  };

  const addToCart = async (product: Product) => {
    if (!auth?.isAuthenticated) {
      navigate('/user/auth');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));

      const cartItem = {
        name: product.title || product.name,
        image: product.image,
        category: product.category,
        description: product.description || '',
        quantity: 1,
        original_price: product.price,
        discount_price: product.discountPrice ?? product.price
      };

      const token = localStorage.getItem('token') || auth?.token;
      const headers: any = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
        withCredentials: true,
        headers: headers
      });

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: response.data.message || "Item added to cart successfully",
        life: 3000
      });

      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add item to cart. Please try again.',
        life: 3000
      });
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleKnowMore = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const onPageChange = (e: any) => {
    setFirst(e.first);
    setRows(e.rows);
  };

  const activeCoupons = coupons;
  const paginatedProducts = discountedProducts.slice(first, first + rows);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      color: '#1e293b',
      background: 'transparent',
      minHeight: '80vh',
      padding: '2rem 1rem'
    }}>
      <style>{`
        .responsive-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        @media (max-width: 1024px) {
          .responsive-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 480px) {
          .responsive-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
        .product-card .p-card-body {
          padding: 0px !important;
        }
        .product-card .p-card-content {
          padding: 0 !important;
        }
        .discount-badge {
          position: absolute;
          top: 10px;
          right: -8px;
          background: #ff4d4f;
          color: white;
          padding: 5px 15px 5px 10px;
          font-weight: bold;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 10% 50%);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          font-size: 11px;
          z-index: 10;
        }
      `}</style>
      <Toast ref={toastRef} />

      <div style={{ width: '100%' }}>
        
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
            Mega Offers Page
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
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem', color: '#22c55e' }} />
            <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 600 }}>Fetching latest offers...</p>
          </div>
        ) : (
          <div>
            {/* Active Coupon Codes Section */}
            <div style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Active Coupon Codes
              </h2>
              
              {activeCoupons.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <i className="pi pi-ticket" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#334155', margin: '0 0 0.25rem 0' }}>No Active Coupon Codes</h3>
                  <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
                    There are no coupon codes running currently. Check back later for active discount offers!
                  </p>
                </div>
              ) : (
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
                          Expires: {formatDate(coupon.expiryDate)}
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
              )}
            </div>

            {/* Catalog Discounts Section */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Direct Catalog Price Cuts
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
                <div>
                  <div className="responsive-grid">
                    {paginatedProducts.map((prod) => {
                      const ratingValue = typeof prod.rating === 'object' ? prod.rating.rate : (prod.rating || 0);
                      const ratingCount = typeof prod.rating === 'object' ? prod.rating.count : 0;
                      
                      const cardHeader = (
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={prod.image} 
                            alt={prod.title || prod.name} 
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover',
                              borderTopLeftRadius: '12px',
                              borderTopRightRadius: '12px'
                            }} 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          {prod.discountPercentage && prod.discountPercentage > 0 ? (
                            <div className="discount-badge">
                              {prod.discountPercentage}% OFF
                            </div>
                          ) : null}
                        </div>
                      );

                      return (
                        <Card
                          key={prod._id}
                          className="product-card"
                          header={cardHeader}
                          style={{
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            background: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >

                          <div style={{ display: 'flex', flexDirection: 'column', padding: '17px 13px', flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <Tag 
                                value={prod.category} 
                                severity="info"
                                style={{
                                  fontSize: '11px',
                                  border: '1px dashed #3b82f6',
                                  background: 'transparent',
                                  color: '#1d4ed8',
                                  fontWeight: 600,
                                  borderRadius: '6px'
                                }}
                              />
                              <button
                                onClick={() => handleKnowMore(prod)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  color: '#22c55e',
                                  padding: 0,
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <i className="pi pi-info-circle" />
                                <span>Know More</span>
                              </button>
                            </div>

                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.title || prod.name || 'Unnamed Product'}
                            </h3>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '6px' }}>
                              <Rating
                                disabled
                                cancel={false}
                                value={Math.round(ratingValue)}
                                stars={5}
                                style={{ fontSize: '13px', color: '#f59e0b' }}
                              />
                              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                                ({ratingValue.toFixed(1)} {ratingCount > 0 ? `- ${ratingCount}` : ''})
                              </span>
                            </div>

                            <p style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              marginBottom: '16px',
                              lineHeight: '1.4',
                              height: '34px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {prod.description || 'No description available'}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                              <div>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#22c55e' }}>
                                  ₹{(prod.discountPrice ?? prod.price).toFixed(2)}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                                  ₹{prod.price.toFixed(2)}
                                </span>
                              </div>
                              <Button 
                                onClick={() => addToCart(prod)}
                                disabled={addingToCart[prod._id]}
                                label={addingToCart[prod._id] ? "" : "Add to Cart"}
                                icon={addingToCart[prod._id] ? "pi pi-spin pi-spinner" : "pi pi-shopping-cart"}
                                className="p-button-success p-button-sm"
                                style={{
                                  borderRadius: '8px',
                                  fontWeight: 700,
                                  minWidth: '110px',
                                  height: '32px',
                                  padding: '0 8px'
                                }}
                              />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Paginator */}
                  <Paginator 
                    first={first} 
                    rows={rows} 
                    totalRecords={discountedProducts.length} 
                    rowsPerPageOptions={[4, 8, 12, 16]} 
                    onPageChange={onPageChange} 
                    style={{ background: 'transparent', border: 'none', marginTop: '1rem' }}
                  />
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* PrimeReact Product Details Dialog */}
      <Dialog
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e' }}>
            <i className="pi pi-info-circle" />
            <span style={{ fontWeight: 'bold' }}>Product Details</span>
          </div>
        }
        visible={showProductModal}
        onHide={() => setShowProductModal(false)}
        style={{ width: '900px', maxWidth: '95vw' }}
        breakpoints={{ '960px': '75vw', '641px': '95vw' }}
        draggable={false}
        resizable={false}
      >
        {selectedProduct ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title || selectedProduct.name}
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    height: '260px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1f2937' }}>
                  {selectedProduct.title || selectedProduct.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#4b5563' }}>
                  <div>
                    <strong style={{ color: '#22c55e', marginRight: '8px' }}>Product ID:</strong>
                    <Tag value={selectedProduct._id} severity="secondary" style={{ borderRadius: '4px', border: '1px dashed' }} />
                  </div>

                  <div>
                    <strong style={{ color: '#22c55e', marginRight: '8px' }}>Category:</strong>
                    <Tag value={selectedProduct.category} severity="info" style={{ borderRadius: '4px', border: '1px dashed' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#22c55e', marginRight: '2px' }}>Rating:</strong>
                    <Rating
                      disabled
                      cancel={false}
                      value={Math.round(typeof selectedProduct.rating === 'object' ? selectedProduct.rating.rate : (selectedProduct.rating || 0))}
                      stars={5}
                      style={{ color: '#f59e0b', fontSize: '13px' }}
                    />
                    <span style={{ fontWeight: 'bold' }}>
                      {typeof selectedProduct.rating === 'object' ? selectedProduct.rating.rate.toFixed(1) : (selectedProduct.rating || 0).toFixed(1)}
                    </span>
                  </div>

                  <div>
                    <strong style={{ color: '#22c55e', marginRight: '8px' }}>Price:</strong>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '16px', color: '#22c55e' }}>₹{(selectedProduct.discountPrice ?? selectedProduct.price).toFixed(2)}</strong>
                      <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{selectedProduct.price.toFixed(2)}</span>
                    </span>
                  </div>

                  {selectedProduct.calories && (
                    <div>
                      <strong style={{ color: '#22c55e', marginRight: '8px' }}>Calories:</strong>
                      <span>{selectedProduct.calories} kcal per serving</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <Button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setShowProductModal(false);
                    }}
                    disabled={addingToCart[selectedProduct._id]}
                    label={addingToCart[selectedProduct._id] ? "" : "Add to Cart"}
                    icon={addingToCart[selectedProduct._id] ? "pi pi-spin pi-spinner" : "pi pi-shopping-cart"}
                    className="p-button-success"
                    style={{ width: '100%', height: '40px', borderRadius: '8px', fontWeight: 'bold' }}
                  />
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div>
                <strong style={{ color: '#22c55e', display: 'block', marginBottom: '6px' }}>Description:</strong>
                <span style={{ color: '#4b5563', lineHeight: '1.6' }}>{selectedProduct.description || 'No description available'}</span>
              </div>

              {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                <div>
                  <strong style={{ color: '#22c55e', display: 'block', marginBottom: '6px' }}>Ingredients:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedProduct.ingredients.map((ingredient, idx) => (
                      <Tag key={idx} value={ingredient} severity="warning" style={{ borderRadius: '4px', border: '1px dashed' }} />
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.ageRecommendation && (
                <div>
                  <strong style={{ color: '#22c55e', marginRight: '8px' }}>Age Recommendation:</strong>
                  <span>{selectedProduct.ageRecommendation}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}