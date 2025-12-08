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
  'NonVeg': 'https://media.istockphoto.com/id/1334383300/photo/fish-biryani-spicy-and-delicious-malabar-biryani-or-hydrabadi-biryani-dum-biriyani.webp?a=1&b=1&s=612x612&w=0&k=20&c=ZqTAGd2qFYQHDxhmvWC5XSwKLIQSPEGFDOEz9wK9SEE=',
  'Veg': 'https://media.istockphoto.com/id/2126807238/photo/healthy-super-food-ragi-roti-with-raw-ragi-and-flour-selective-focus.jpg?s=612x612&w=0&k=20&c=cfFx6cC6q1ZHIp0xLaMifyPByPM-2Oq6ern7ygmgi6E=',
  'Desserts': 'https://media.istockphoto.com/id/1214305490/photo/blackforest-cake.jpg?s=612x612&w=0&k=20&c=yxQZHJ6HSGamPFo5UId6JeC0RICcuZo1DuXfYWIdpyY=',
  'Sweets': 'https://media.istockphoto.com/id/1194662949/photo/indian-dessert-or-sweet-dish-gulab-jamun-in-white-bowl-on-yellow-background.jpg?s=612x612&w=0&k=20&c=XAOQkQC-Mu-XXviGtWU6NTz8vZzT1sY0oaJQ4jWo2Fo=',
  'IceCream': 'https://www.keep-calm-and-eat-ice-cream.com/wp-content/uploads/2022/09/Pistachio-ice-cream-hero-06-500x375.jpg',
  'Fruit Juice': 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2024-03/orange-juice-1-jp-240311-1e99ea.jpg',
  'Pizzas': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
  'BreakFast': 'https://media.istockphoto.com/id/1364757902/photo/crispy-crepes-made-of-barnyard-millets-and-lentils-commonly-known-as-barnyard-millet-ghee.jpg?s=612x612&w=0&k=20&c=OujKblDoHPThj7fcxLL1FBfzRNlHK6ZwNYVXnqDhDBU=',
  'MilkShakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
  'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'Snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop',
  'Soups': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
  'Cold Drinks': 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop',
  'Hot Drinks': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
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
