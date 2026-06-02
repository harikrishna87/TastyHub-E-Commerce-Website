import React, { useState } from 'react';

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

const customCategoriesStyles = `
.categories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.category-card {
  transition: all 0.3s ease;
}
.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(82, 196, 26, 0.15);
}
`;

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  products,
  categoryDiscounts,
  selectedCategory,
  handleCategoryClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customCategoriesStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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

  const totalPages = Math.ceil(totalCategories / pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Product Categories</h2>
      </div>
      <div className="categories-grid">
        {paginatedCategories.map((category) => (
          <div
            key={category}
            className="category-card"
            style={{
              height: '150px',
              cursor: 'pointer',
              borderRadius: '12px',
              backgroundColor: 'rgba(82, 196, 26, 0.1)',
              border: selectedCategory === category ? '2px dashed #52c41a' : '1px solid #d9d9d9',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex'
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
              position: 'relative',
              boxSizing: 'border-box'
            }}>
              <h4 style={{ 
                fontWeight: 'bold', 
                color: '#52c41a', 
                marginBottom: '0.5rem',
                marginTop: 0,
                fontSize: '18px',
                textTransform: 'capitalize'
              }}>
                {category}
              </h4>
              <span style={{ display: 'block', marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
                {products.filter(p => p.category === category).length} items
              </span>
              <button 
                style={{ 
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View All</span>
                <i className="pi pi-arrow-right" style={{ fontSize: '10px' }} />
              </button>
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
          </div>
        ))}
      </div>
      {totalCategories > pageSize && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '8px' }}>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
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
    </div>
  );
};

export default ProductCategories;
