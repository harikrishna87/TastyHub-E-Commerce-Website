import React, { useState, useContext } from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Rating } from 'primereact/rating';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  title?: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number | { rate: number; count: number };
  ingredients?: string[];
  calories?: number;
  ageRecommendation?: string;
  discountPercentage?: number;
  discountPrice?: number;
}

interface ProductSelectionProps {
  selectedProducts: Product[];
  selectedCategory: string | null;
  resetCategoryFilter: () => void;
  categoryDiscounts?: { [key: string]: number };
  currentPage: number;
  paginate: (pageNumber: number) => void;
  filteredProducts: Product[];
  productsPerPage: number;
}

const customStyles = `
.product-selection-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 576px) {
  .product-selection-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 768px) {
  .product-selection-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1200px) {
  .product-selection-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.product-card {
  transition: all 0.3s ease;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.product-card .p-card-body {
  padding: 0px !important;
}
.product-card .p-card-content {
  padding: 0 !important;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(25, 135, 84, 0.1) !important;
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
  font-size: 12px;
  z-index: 2;
}
.category-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
}
.know-more-btn {
  border: none;
  background: none;
  color: #52c41a;
  padding: 0;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-left: auto;
  line-height: 1;
}
.know-more-btn:hover {
  color: #389e0d;
  text-decoration: none;
}
.know-more-btn i {
  font-size: 12px;
  display: flex;
  align-items: center;
}
.know-more-btn span {
  display: flex;
  align-items: center;
}
.details-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 768px) {
  .details-row {
    grid-template-columns: 5fr 7fr;
  }
}
.details-desc-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
}
.details-desc-label {
  width: 140px;
  font-weight: 600;
  color: #166534;
}
.details-desc-value {
  flex: 1;
}
`;

const ProductSelection: React.FC<ProductSelectionProps> = ({
  selectedProducts,
  selectedCategory,
  resetCategoryFilter,
  currentPage,
  paginate,
  filteredProducts,
  productsPerPage
}) => {
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const messageApi = {
    success: (opts: any) => (window as any).showToast?.('success', 'Success', typeof opts === 'string' ? opts : opts.content || ''),
    error: (opts: any) => (window as any).showToast?.('error', 'Error', typeof opts === 'string' ? opts : opts.content || ''),
    info: (opts: any) => (window as any).showToast?.('info', 'Info', typeof opts === 'string' ? opts : opts.content || ''),
    warning: (opts: any) => (window as any).showToast?.('warn', 'Warning', typeof opts === 'string' ? opts : opts.content || ''),
  };
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProductDetails, setLoadingProductDetails] = useState<boolean>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const addToCart = async (product: Product) => {
    if (!auth?.isAuthenticated) {
      navigate('/user/auth');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));

      const cartItem = {
        name: product.name || product.title,
        image: product.image,
        category: product.category,
        description: product.description,
        quantity: 1,
        original_price: product.price,
        discount_price: product.discountPrice ?? product.price,
      };

      const response = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth?.token ? `Bearer ${auth.token}` : ''
        }
      });

      messageApi.success({
        content: response.data.message || "Item added to cart successfully",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });

      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          auth?.logout?.();
          navigate('/user/auth');
          messageApi.error({
            content: "Session expired. Please login again.",
            duration: 3,
            style: {
              marginTop: '10vh',
            },
          });
        } else if (error.response?.status === 400) {
          messageApi.info({
            content: error.response.data.message || "Item already exists in cart",
            duration: 3,
            style: {
              marginTop: '10vh',
            },
          });
        } else {
          messageApi.error({
            content: error.response?.data?.message || "Failed to add item to cart",
            duration: 3,
            style: {
              marginTop: '10vh',
            },
          });
        }
      } else {
        messageApi.error({
          content: "Network error. Please try again.",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const truncateDescription = (description: string | undefined | null) => {
    if (!description) return "";

    const maxLength = 80;
    if (description.length <= maxLength) {
      return description;
    }
    return `${description.substring(0, maxLength)}...`;
  };

  const handleKnowMore = async (product: Product) => {
    try {
      setLoadingProductDetails(true);
      setShowProductModal(true);
      
      const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
      const allProducts = response.data.data;
      
      const completeProduct = allProducts.find((p: any) => p._id === product._id);
      
      if (completeProduct) {
        const productWithDetails = {
          _id: completeProduct._id,
          name: completeProduct.title || completeProduct.name,
          title: completeProduct.title,
          description: completeProduct.description,
          image: completeProduct.image,
          price: completeProduct.price,
          category: completeProduct.category,
          rating: completeProduct.rating,
          ingredients: completeProduct.ingredients,
          calories: completeProduct.calories,
          ageRecommendation: completeProduct.ageRecommendation
        };
        setSelectedProduct(productWithDetails);
      } else {
        setSelectedProduct(product);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setSelectedProduct(product);
    } finally {
      setLoadingProductDetails(false);
    }
  };

  // const renderStars = (rating: number | undefined | { rate: number; count: number }) => {
  //   const rate = typeof rating === 'object' ? rating.rate : (rating || 0);
  //   const stars = [];
  //   const floor = Math.floor(rate);
  //   const hasHalf = rate % 1 !== 0;
  //   for (let i = 1; i <= 5; i++) {
  //     if (i <= floor) {
  //       stars.push(<i key={i} className="pi pi-star-fill" style={{ color: '#facc15', fontSize: '13px', marginRight: '2px' }} />);
  //     } else if (i === floor + 1 && hasHalf) {
  //       stars.push(<i key={i} className="pi pi-star-fill" style={{ color: '#facc15', fontSize: '13px', marginRight: '2px', opacity: 0.7 }} />);
  //     } else {
  //       stars.push(<i key={i} className="pi pi-star" style={{ color: '#d1d5db', fontSize: '13px', marginRight: '2px' }} />);
  //     }
  //   }
  //   return <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>;
  // };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const showPagination = selectedCategory && filteredProducts.length > productsPerPage && totalPages > 1;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  return (
    <div style={{ marginBottom: '3rem' }}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 className="section-title" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
          {selectedCategory ? `${selectedCategory} Products` : 'Our Selection'}
        </h2>
        {selectedCategory && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={resetCategoryFilter}
              style={{
                borderColor: '#52c41a',
                color: '#52c41a',
                border: '1px solid #52c41a',
                background: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <i className="pi pi-times" style={{ fontSize: '10px' }} />
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {selectedProducts.length > 0 ? (
        <>
          <div className="product-selection-grid">
            {selectedProducts.map((product) => {
              const ratingValue = typeof product.rating === 'object' ? product.rating.rate : (product.rating || 0);
              const ratingCount = typeof product.rating === 'object' ? product.rating.count : 0;

              const cardHeader = (
                <div style={{ position: 'relative' }}>
                  <img
                    src={product.image}
                    alt={product.name || product.title}
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
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <div className="discount-badge">
                      {product.discountPercentage}% OFF
                    </div>
                  ) : null}
                </div>
              );

              return (
                <Card
                  key={product._id}
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
                        value={product.category}
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
                        className="know-more-btn"
                        onClick={() => handleKnowMore(product)}
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
                      {product.name || product.title || 'Unnamed Product'}
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
                      WebkitBoxOrient: 'vertical',
                      margin: '0 0 16px 0'
                    }}>
                      {truncateDescription(product.description)}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div>
                        {product.discountPercentage && product.discountPercentage > 0 ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '15px' }}>
                              ₹ {(product.discountPrice ?? product.price).toFixed(2)}
                            </span>
                            <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '12px' }}>
                              ₹ {product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '15px' }}>
                            ₹ {product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={addingToCart[product._id]}
                        label={addingToCart[product._id] ? "" : "Add to Cart"}
                        icon={addingToCart[product._id] ? "pi pi-spin pi-spinner" : "pi pi-shopping-cart"}
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

          {showPagination && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ marginRight: '16px', fontSize: '14px', color: '#6b7280' }}>
                {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} items
              </span>
              {pages.map((p) => (
                <button
                  key={p}
                  onClick={() => paginate(p)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: p === currentPage ? '1px solid #52c41a' : '1px solid #d9d9d9',
                    backgroundColor: p === currentPage ? '#52c41a' : '#ffffff',
                    color: p === currentPage ? '#ffffff' : '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    minWidth: '32px',
                    textAlign: 'center'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{
          backgroundColor: 'rgba(82, 196, 26, 0.1)',
          border: '1px solid rgba(82, 196, 26, 0.25)',
          borderRadius: '8px',
          padding: '16px',
          color: '#15803d',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          <i className="pi pi-search" style={{ fontSize: '18px' }} />
          <span>No products found in this category. Please try another category or check back later.</span>
        </div>
      )}

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
        modal
      >
        {selectedProduct && !loadingProductDetails ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name || selectedProduct.title}
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    height: '260px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '1px solid #e5e7eb'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1f2937' }}>
                  {selectedProduct.name || selectedProduct.title}
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
                      {selectedProduct.discountPercentage && selectedProduct.discountPercentage > 0 ? (
                        <>
                          <strong style={{ fontSize: '16px', color: '#22c55e' }}>₹{(selectedProduct.discountPrice ?? selectedProduct.price).toFixed(2)}</strong>
                          <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{selectedProduct.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <strong style={{ fontSize: '16px', color: '#1f2937' }}>₹ {selectedProduct.price.toFixed(2)}</strong>
                      )}
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
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
            <p style={{ marginTop: '16px', color: '#52c41a', fontWeight: 600 }}>Loading product details...</p>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ProductSelection;