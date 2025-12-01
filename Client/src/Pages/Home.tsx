import { useState, useEffect } from 'react';
import { 
  Layout, 
  Button, 
  Alert, 
  Typography, 
  Space, 
  // Card, 
  // Badge,
  Spin,
  Carousel
} from 'antd';
import { Link } from 'react-router-dom';
import { 
  // PercentageOutlined, 
  ShoppingCartOutlined,
  StarFilled,
  StarOutlined
} from '@ant-design/icons';
import customStyles from "../styles/Styles";
import Testimonials from '../Components/Testimonials';
import ProductCategories from '../Components/ProductCategories';
import ProductSelection from '../Components/ProductSelection';
import FeaturedProducts from '../Components/FeaturedProducts';
import axios from "axios";

const { Content } = Layout;
const { Paragraph } = Typography;

const LeafIconCustom = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
  </svg>
);

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
}

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
  description: string;
}

export default function Homepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(12);
  const [categoryDiscounts, setCategoryDiscounts] = useState<{ [key: string]: number }>({});

  const carouselImages: CarouselImage[] = [
    {
      src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
      alt: "Veg Food",
      title: "Veg Food",
      description: "Farm-fresh organic veg Food delivered to your door"
    },
    {
      src: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
      alt: "Grilled Chicken",
      title: "Premium Non-Veg",
      description: "Succulent grilled meats and seafood specialties"
    },
    {
      src: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
      alt: "Delicious Pizza",
      title: "Artisan Pizzas",
      description: "Hand-tossed pizzas with premium toppings"
    },
    {
      src: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
      alt: "Sweet Desserts",
      title: "Divine Desserts",
      description: "Indulgent treats to satisfy your sweet cravings"
    },
    {
      src: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
      alt: "Fresh Fruit Juices",
      title: "Fresh Juices",
      description: "Refreshing natural fruit juices and smoothies"
    }
  ];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
        if (!response) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.data.data
        const typedProducts: Product[] = data.map((item: any) => ({
          _id: item._id,
          name: item.title,
          description: item.description || 'No description available',
          image: item.image || '',
          price: typeof item.price === 'number' ? item.price : 0,
          category: item.category || 'Uncategorized',
          rating: typeof item.rating === 'number' ? item.rating : Math.round((3 + Math.random() * 2) * 10) / 10
        }));

        setProducts(typedProducts);
        const shuffledProducts = shuffleArray<Product>(typedProducts);
        setFeaturedProducts(shuffledProducts.slice(0, 8));
        setSelectedProducts(shuffleArray<Product>([...shuffledProducts]).slice(0, productsPerPage));

        const uniqueCategories = [...new Set(typedProducts.map(product => product.category))];
        const discounts: { [key: string]: number } = {};
        uniqueCategories.forEach(category => {
          discounts[category] = Math.floor(Math.random() * 30) + 5;
        });
        setCategoryDiscounts(discounts);

        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productsPerPage, backendUrl]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter(product => product.category === selectedCategory);
      setFilteredProducts(filtered);
      setCurrentPage(1);
      const indexOfLastProduct = currentPage * productsPerPage;
      const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
      setSelectedProducts(filtered.slice(indexOfFirstProduct, indexOfLastProduct));
    } else {
      setFilteredProducts([]);
      setSelectedProducts(shuffleArray<Product>([...products]).slice(0, productsPerPage));
    }
  }, [selectedCategory, products, currentPage, productsPerPage]);

  useEffect(() => {
    if (selectedCategory && filteredProducts.length > 0) {
      const indexOfLastProduct = currentPage * productsPerPage;
      const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
      setSelectedProducts(filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct));
    }
  }, [currentPage, filteredProducts, productsPerPage, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const resetCategoryFilter = () => {
    setSelectedCategory(null);
    setCurrentPage(1);
    setSelectedProducts(shuffleArray<Product>([...products]).slice(0, productsPerPage));
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const calculateDiscountedPrice = (originalPrice: number, category: string) => {
    const discountPercentage = categoryDiscounts[category];
    if (!discountPercentage) return originalPrice;
    return originalPrice - (originalPrice * (discountPercentage / 100));
  };

  const renderStarRating = (rating: number) => {
    const safeRating = Math.min(5, Math.max(0, rating || 0));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = (safeRating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <Space style={{ color: '#faad14', marginBottom: '8px' }}>
        {Array.from({ length: fullStars }, (_, i) => (
          <StarFilled key={`full-${i}`} />
        ))}
        {hasHalfStar && <StarFilled key="half" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
        {Array.from({ length: emptyStars }, (_, i) => (
          <StarOutlined key={`empty-${i}`} />
        ))}
        <span style={{ color: '#8c8c8c', marginLeft: '4px' }}>({safeRating.toFixed(1)})</span>
      </Space>
    );
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large"  style={{ color: '#28a745' }}/>
        <Paragraph style={{ marginTop: '16px', color: '#28a745' }}>Loading your Home Page...</Paragraph>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Content style={{ 
          padding: '50px', 
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Alert
            message={error}
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div 
        style={{
          position: 'absolute',
          left: -50,
          bottom: -50,
          width: '200px',
          height: '200px',
          opacity: 0.15,
          zIndex: -1,
          display: window.innerWidth >= 768 ? 'block' : 'none'
        }}
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.61,5.51a15.2,15.2,0,0,1,12.7-1.21c4,1.72,6.3,5.66,8.38,9.47,4.33,7.94,8.64,16,15.73,21.37s17.48,7.35,25.25,2.57c3.8-2.34,6.6-6.07,9-10s4.36-8,7-11.53c10-13.78,32.33-14.35,47.68-5.77,7.56,4.22,14.33,10.86,17.35,19.18s1.79,18.61-5,24c-5.38,4.25-13.12,4.78-19.78,2.66s-12.45-6.59-17.53-11.46C87.86,31.17,71.53,16.84,51.22,13.15c-5.35-1-10.8-1.15-16.22-1.68A92.7,92.7,0,0,1,3.61,5.51Z" fill="#52c41a" />
          <path d="M134.89,8.5c6.54,5.11,9.42,14.15,7.46,22.28S133.9,44,126.23,47.52C118.47,51.1,109.52,52.32,101,53.5,79.36,56.59,57.52,59.67,35.81,54.47s-43.54-22.77-44.76-44.71C-10.16-12.32,14.5-28.59,39.5-28c11.75.27,23.43,4.58,30.45,14,8.33,11.18,8.21,27.6,18.61,36.83,7.51,6.67,18.9,7.17,28.16,3.59a31.84,31.84,0,0,0,18.17-17.88" fill="#52c41a" />
          <path d="M98,111.39a134.3,134.3,0,0,0-19.42-47C70.79,52.58,58.77,43.81,45.25,39.5,27.51,33.8,7.49,37.75-7.5,45.12" stroke="#52c41a" strokeMiterlimit="10" strokeWidth="3" />
        </svg>
      </div>

      <div 
        style={{
          position: 'absolute',
          right: -50,
          bottom: -50,
          width: '220px',
          height: '220px',
          opacity: 0.15,
          zIndex: -1,
          display: window.innerWidth >= 768 ? 'block' : 'none'
        }}
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M196.39,5.51a15.2,15.2,0,0,0-12.7-1.21c-4,1.72-6.3,5.66-8.38,9.47-4.33,7.94-8.64,16-15.73,21.37s-17.48,7.35-25.25,2.57c-3.8-2.34-6.6-6.07-9-10s-4.36-8-7-11.53c-10-13.78-32.33-14.35-47.68-5.77-7.56,4.22-14.33,10.86-17.35,19.18s-1.79,18.61,5,24c5.38,4.25,13.12,4.78,19.78,2.66s12.45-6.59,17.53-11.46c15.51-14.65,31.84-29,52.15-32.67,5.35-1,10.8-1.15,16.22-1.68A92.7,92.7,0,0,0,196.39,5.51Z" transform="translate(-100 0)" fill="#52c41a" />
          <path d="M65.11,8.5C58.57,13.61,55.69,22.65,57.65,30.78S66.1,44,73.77,47.52C81.53,51.1,90.48,52.32,99,53.5c21.64,3.09,43.48,6.17,65.19,1s43.54-22.77,44.76-44.71C210.16-12.32,185.5-28.59,160.5-28c-11.75.27-23.43,4.58-30.45,14-8.33,11.18-8.21,27.6-18.61,36.83-7.51,6.67-18.9,7.17-28.16,3.59A31.84,31.84,0,0,1,65.11,8.5" transform="translate(-100 0)" fill="#52c41a" />
          <path d="M102,111.39a134.3,134.3,0,0,1,19.42-47c7.79-11.81,19.81-20.58,33.33-24.89,17.74-5.7,37.76-1.75,52.75,5.62" transform="translate(-100 0)" stroke="#52c41a" strokeMiterlimit="10" strokeWidth="3" />
        </svg>
      </div>

      <div style={{
        maxWidth: '1200px',
        width: '90%',
        margin: '0 auto',
        marginBottom: '30px',
        marginTop: "30px"
      }}>
        <Carousel 
          autoplay 
          dots={true}
          arrows={false}
          style={{
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          {carouselImages.map((image, index) => (
            <div key={index}>
              <div
                style={{
                  height: window.innerWidth >= 768 ? '250px' : '175px',
                  background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${image.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  <Paragraph 
                    style={{ 
                      color: 'white', 
                      fontSize: window.innerWidth >= 768 ? '1.8rem' : '1.4rem',
                      marginBottom: '24px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      maxWidth: '800px',
                      margin: '0 auto 24px auto',
                      fontWeight: '500',
                      lineHeight: '1.4'
                    }}
                  >
                    {image.description}
                  </Paragraph>

                  <Button 
                    type="default" 
                    size={window.innerWidth >= 768 ? 'large' : 'middle'}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: 'white',
                      borderColor: '2px solid #52c41a',
                      fontWeight: 'bold',
                      padding: window.innerWidth >= 768 ? '8px 32px' : '6px 24px',
                      height: 'auto'
                    }}
                  >
                    <Link to="/menu-items" style={{ textDecoration: 'none' }}>
                      Shop Now
                    </Link>
                  </Button>
                </div>
                
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '20px',
                  color: 'white',
                  opacity: 0.7,
                  display: window.innerWidth >= 768 ? 'block' : 'none'
                }}>
                  <LeafIconCustom />
                </div>
                <div style={{
                  position: 'absolute',
                  right: '20px',
                  top: '20px',
                  color: 'white',
                  opacity: 0.7,
                  display: window.innerWidth >= 768 ? 'block' : 'none'
                }}>
                  <ShoppingCartOutlined style={{ fontSize: '24px' }} />
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <Content style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 24px',
        width: '90%'
      }}>

        <div style={{ marginBottom: '32px' }}>
          <FeaturedProducts 
            featuredProducts={featuredProducts}
            categoryDiscounts={categoryDiscounts}
            calculateDiscountedPrice={calculateDiscountedPrice}
            renderStarRating={renderStarRating}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <ProductCategories 
            products={products}
            categoryDiscounts={categoryDiscounts}
            selectedCategory={selectedCategory}
            handleCategoryClick={handleCategoryClick}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <ProductSelection 
            selectedProducts={selectedProducts}
            selectedCategory={selectedCategory}
            resetCategoryFilter={resetCategoryFilter}
            categoryDiscounts={categoryDiscounts}
            currentPage={currentPage}
            paginate={paginate}
            filteredProducts={filteredProducts}
            productsPerPage={productsPerPage}
          />
        </div>

        <div>
          <Testimonials />
        </div>
      </Content>
    </Layout>
  );
}