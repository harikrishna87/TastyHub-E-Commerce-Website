import React, { JSX } from 'react';
import {
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Image,
  message,
  Rate
} from 'antd';
import { ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
  height: 450px;
}

.marquee-content {
  display: flex;
  animation: continuousScroll 30s linear infinite;
  width: calc(300px * 24 + 16px * 24);
}

.marquee-content:hover {
  animation-play-state: paused;
}

.featured-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(25, 135, 84, 0.1) !important;
  transition: all 0.3s ease;
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

.featured-know-more-btn .anticon {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.featured-know-more-btn span {
  display: flex;
  align-items: center;
}

.featured-product-details-modal .ant-modal-header {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

.featured-product-details-modal .ant-modal-body {
  padding: 24px;
}

.featured-product-details-modal .ant-descriptions-item-label {
  font-weight: 600;
  color: #52c41a;
}
`;



const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  featuredProducts = [],
  categoryDiscounts = {},
  calculateDiscountedPrice = (originalPrice: number, category: string) => {
    const discount = categoryDiscounts[category] || 0;
    return originalPrice * (1 - discount / 100);
  }
}) => {
  const [messageApi, contextHolder] = message.useMessage();

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

  const CustomCard = ({ product, index }: { product: Product; index: number }) => (
    <Card
      key={`${product._id}-${index}`}
      className="mx-2 shadow-sm featured-product-card"
      style={{
        minWidth: '300px',
        maxWidth: '300px',
        borderRadius: '12px',
        marginLeft: '8px',
        marginRight: '8px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        height: '400px',
        flexShrink: 0
      }}
      cover={
        <div style={{ position: 'relative' }}>
          <Image
            src={product.image}
            alt={product.name}
            style={{
              width: "302px",
              height: "200px",
              borderRadius: "12px 12px 0px 0px",
              objectFit: "cover"
            }}
            preview={false}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.display = 'none';
            }}
          />
          {categoryDiscounts[product.category] && (
            <div className="featured-discount-badge">
              {categoryDiscounts[product.category]}% OFF
            </div>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <Tag
            color="cyan"
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              border: '1px dashed'
            }}
          >
            {product.category}
          </Tag>
          <button 
            className="featured-know-more-btn" 
            onClick={() => handleKnowMore()}
            style={{fontSize: '14px'}}
          >
            <InfoCircleOutlined />
            <span>Know More</span>
          </button>
        </div>

        <Title level={5} style={{ margin: '0 0 8px 0' }} ellipsis>
          {product.name || product.title || 'Unnamed Product'}
        </Title>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Rate
            disabled
            allowHalf
            value={typeof product.rating === 'object' ? product.rating.rate : (product.rating || 0)}
            style={{ fontSize: '14px' }}
          />
          <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
            ({typeof product.rating === 'object' ? 
              `${product.rating.rate.toFixed(1)} - ${product.rating.count}` : 
              (product.rating || 0).toFixed(1)
            })
          </Text>
        </div>

        <Paragraph
          type="secondary"
          style={{
            fontSize: '12px',
            marginBottom: '16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {truncateDescription(product.description)}
        </Paragraph>

        <div style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            {categoryDiscounts[product.category] ? (
              <Space>
                <Text strong style={{ color: '#52c41a' }}>
                  ₹ {calculateDiscountedPrice(product.price, product.category).toFixed(2)}
                </Text>
                <Text delete type="secondary" style={{ fontSize: '12px' }}>
                  ₹ {product.price.toFixed(2)}
                </Text>
              </Space>
            ) : (
              <Text strong style={{ color: '#52c41a' }}>
                ₹ {product.price.toFixed(2)}
              </Text>
            )}
          </div>
          <Button
            type="primary"
            size="small"
            onClick={() => addToCart()}
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              minWidth: 110,
              height: 25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShoppingCartOutlined style={{ marginRight: 4 }} />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );

  const duplicatedProducts = [...featuredProducts, ...featuredProducts];

  return (
    <>
      {contextHolder}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Title level={2} className="section-title" style={{ margin: 0 }}>
            Featured Products
          </Title>
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