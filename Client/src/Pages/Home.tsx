import { useState, useEffect } from 'react';
import { Layout, Alert, Typography, Space, Spin } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import customStyles from "../styles/Styles";
import Testimonials from '../Components/Testimonials';
import ProductCategories from '../Components/ProductCategories';
import ProductSelection from '../Components/ProductSelection';
import FeaturedProducts from '../Components/FeaturedProducts';
import axios from "axios";

const { Content } = Layout;
const { Paragraph } = Typography;

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
  discountPercentage?: number;
  discountPrice?: number;
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

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
        const data = response.data.data;
        const typedProducts: Product[] = data.map((item: any) => ({
          _id: item._id,
          name: item.title,
          description: item.description || 'No description available',
          image: item.image || '',
          price: typeof item.price === 'number' ? item.price : 0,
          category: item.category || 'Uncategorized',
          rating: typeof item.rating === 'number' ? item.rating : Math.round((3 + Math.random() * 2) * 10) / 10,
          discountPercentage: item.discountPercentage || 0,
          discountPrice: item.discountPrice || item.price
        }));

        setProducts(typedProducts);
        const shuffledProducts = shuffleArray<Product>(typedProducts);
        setFeaturedProducts(shuffledProducts.slice(0, 8));
        setSelectedProducts(shuffleArray<Product>([...shuffledProducts]).slice(0, productsPerPage));

        const uniqueCategories = [...new Set(typedProducts.map(product => product.category))];
        const discounts: { [key: string]: number } = {};
        uniqueCategories.forEach(category => {
          discounts[category] = 0;
        });
        setCategoryDiscounts(discounts);
        setLoading(false);
      } catch {
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
      <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" style={{ color: '#28a745' }} />
        <Paragraph style={{ marginTop: '16px', color: '#28a745' }}>Loading your Home Page...</Paragraph>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Alert message={error} type="error" showIcon />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent', position: 'relative', overflow: 'hidden' }}>
      <Content style={{ width: '100%' }}>
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
