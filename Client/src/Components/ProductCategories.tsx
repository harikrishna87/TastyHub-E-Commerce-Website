import React, { useState } from 'react';
import { Row, Col, Card, Button, Typography, Pagination } from 'antd';
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
  'NonVeg': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  'Veg': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
  'Sweets': 'https://images.unsplash.com/photo-1589187151053-5ec8818e661b?w=400&h=300&fit=crop',
  'IceCream': 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400&h=300&fit=crop',
  'Fruit Juice': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
  'Pizzas': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
  'BreakFast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
  'MilkShakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
  'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'Snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop',
  'Soups': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
  'Cold Drinks': 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop',
  'Hot Drinks': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
  'Default': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop'
};

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  products,
  categoryDiscounts,
  selectedCategory,
  handleCategoryClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const getCategoryImage = (category: string): string => {
    return categoryImages[category] || categoryImages['Default'];
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  const totalCategories = categories.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Title level={2} className="section-title">Product Categories</Title>
      </div>
      <Row gutter={[16, 16]}>
        {paginatedCategories.map((category) => (
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
              styles={{
                body: {
                  padding: '0',
                  display: 'flex',
                  height: '150px'
                }
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
      {totalCategories > pageSize && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <Pagination
            current={currentPage}
            total={totalCategories}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default ProductCategories;
