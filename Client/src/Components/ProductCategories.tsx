import React from 'react';
import { Row, Col, Card, Button, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
}

interface ProductCategoriesProps {
  products: Product[];
  categoryDiscounts: { [key: string]: number };
  selectedCategory: string | null;
  handleCategoryClick: (category: string) => void;
}

const categoryImages: { [key: string]: string } = {
  'NonVeg': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
  'Veg': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
  'Fruit Juice': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop',
  'Pizzas': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
  'IceCream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
  'Default': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop'
};

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  products,
  categoryDiscounts,
  selectedCategory,
  handleCategoryClick
}) => {
  const getCategoryImage = (category: string): string => {
    return categoryImages[category] || categoryImages['Default'];
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Title level={2} className="section-title">Product Categories</Title>
      </div>
      <Row gutter={[16, 16]}>
        {Array.from(new Set(products.map(p => p.category))).map((category) => (
          <Col xs={24} md={8} key={category}>
            <Card
              hoverable
              style={{
                height: '100%',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(82, 196, 26, 0.1)',
                border: selectedCategory === category ? '2px dashed #52c41a' : '1px solid #d9d9d9',
                position: 'relative',
                overflow: 'hidden'
              }}
              bodyStyle={{
                padding: '0',
                display: 'flex',
                height: '150px'
              }}
              onClick={() => handleCategoryClick(category)}
            >
              <div style={{
                width: '50%',
                backgroundImage: `url(${getCategoryImage(category)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div style={{
                width: '50%',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Title level={4} style={{ 
                  fontWeight: 'bold', 
                  color: '#52c41a', 
                  marginBottom: '0.5rem',
                  textTransform: 'capitalize'
                }}>
                  {category}
                </Title>
                <Text style={{ display: 'block', marginBottom: '1rem', color: '#666' }}>
                  {products.filter(p => p.category === category).length} items
                </Text>
                <Button 
                  type="primary" 
                  size="small"
                  style={{ 
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    alignSelf: 'flex-start'
                  }}
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                >
                  View All
                </Button>
              </div>
              {categoryDiscounts[category] && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  zIndex: 1
                }}>
                  -{categoryDiscounts[category]}% OFF
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductCategories;