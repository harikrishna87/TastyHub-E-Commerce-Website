import React, { JSX } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Rating } from 'primereact/rating';

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

interface FeaturedProductsProps {
  featuredProducts?: Product[];
  categoryDiscounts?: { [key: string]: number };
  calculateDiscountedPrice?: (originalPrice: number, category: string) => number;
  renderStarRating?: (rating: number) => JSX.Element;
}

const customStyles = `
@keyframes continuousScroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.marquee-container {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 470px;
}

.marquee-content {
  display: flex;
  animation: continuousScroll 30s linear infinite;
  width: calc(300px * 24 + 16px * 24);
}

.marquee-content:hover {
  animation-play-state: paused;
}

.featured-product-card {
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
}

.featured-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(25, 135, 84, 0.1) !important;
}

.featured-product-card .p-card-body {
  padding: 0px !important;
  display: flex !important;
  flex-direction: column !important;
  flex-grow: 1 !important;
}

.featured-product-card .p-card-content {
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex-grow: 1 !important;
  justify-content: space-between !important;
}

.featured-discount-badge {
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

.featured-category-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
}

.featured-know-more-btn {
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

.featured-know-more-btn:hover {
  color: #389e0d;
  text-decoration: none;
}

.featured-know-more-btn i {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.featured-know-more-btn span {
  display: flex;
  align-items: center;
}
`;

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  featuredProducts = []
}) => {
  const messageApi = {
    success: (opts: any) => (window as any).showToast?.('success', 'Success', typeof opts === 'string' ? opts : opts.content || ''),
    error: (opts: any) => (window as any).showToast?.('error', 'Error', typeof opts === 'string' ? opts : opts.content || ''),
    info: (opts: any) => (window as any).showToast?.('info', 'Info', typeof opts === 'string' ? opts : opts.content || ''),
    warning: (opts: any) => (window as any).showToast?.('warn', 'Warning', typeof opts === 'string' ? opts : opts.content || ''),
  };

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const addToCart = async () => {
    messageApi.info({
      content: "Please go to Menu page / Scroll Up to add items to cart",
      duration: 3,
      style: {
        marginTop: '10vh',
      },
    });
  };

  const truncateDescription = (description: string | undefined | null) => {
    if (!description) return "";

    const maxLength = 80;
    if (description.length <= maxLength) {
      return description;
    }
    return `${description.substring(0, maxLength)}...`;
  };

  const handleKnowMore = async () => {
    messageApi.info({
      content: "Please go to Menu page / Scroll Up to know more about products",
      duration: 3,
      style: {
        marginTop: '10vh',
      },
    });
  };

  const CustomCard = ({ product, index }: { product: Product; index: number }) => {
    const ratingValue = typeof product.rating === 'object' ? product.rating.rate : (product.rating || 0);
    const ratingCount = typeof product.rating === 'object' ? product.rating.count : 0;

    const cardHeader = (
      <div style={{ position: 'relative', height: '225px', width: '300px', overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.name || product.title}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "12px 12px 0px 0px",
            objectFit: "cover"
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
          }}
        />
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <div className="featured-discount-badge">
            {product.discountPercentage}% OFF
          </div>
        ) : null}
      </div>
    );

    return (
      <Card
        key={`${product._id}-${index}`}
        className="mx-2 shadow-sm featured-product-card"
        header={cardHeader}
        style={{
          minWidth: '300px',
          maxWidth: '300px',
          borderRadius: '12px',
          marginLeft: '8px',
          marginRight: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          height: '450px',
          flexShrink: 0,
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', padding: '17px 13px', flexGrow: 1, height: '100%' }}>
          <div>
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
                className="featured-know-more-btn"
                onClick={() => handleKnowMore()}
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
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
              onClick={() => addToCart()}
              label="Add to Cart"
              icon="pi pi-shopping-cart"
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
  };

  const duplicatedProducts = [...featuredProducts, ...featuredProducts];

  return (
    <>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            Featured Products
          </h2>
        </div>

        <div className="marquee-container">
          <div className="marquee-content">
            {duplicatedProducts.map((product, index) => (
              <CustomCard
                key={`${product._id}-${index}`}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturedProducts;