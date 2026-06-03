import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';
import customStyles from "../../styles/Styles";
import Testimonials from '../../Components/Testimonials';
import ProductSelection from '../../Components/ProductSelection';
import FeaturedProducts from '../../Components/FeaturedProducts';
import FeaturedRestaurants from '../../Components/FeaturedRestaurants';

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number | { rate: number; count: number };
  discountPercentage?: number;
  discountPrice?: number;
}

interface OfferBanner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  linkCategory: string;
  discountText: string;
  isActive: boolean;
}

const bubbleCategories = [
  { name: 'Biryani', value: 'NonVeg', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150&auto=format&fit=crop&q=80' },
  { name: 'Burgers', value: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80' },
  { name: 'Pizzas', value: 'Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=80' },
  { name: 'Pure Veg', value: 'Veg', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80' },
  { name: 'Desserts', value: 'Desserts', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80' },
  { name: 'Sweets', value: 'Sweets', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=80' },
  { name: 'Ice Cream', value: 'IceCream', image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=150&auto=format&fit=crop&q=80' },
  { name: 'Juices', value: 'Fruit Juice', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=150&auto=format&fit=crop&q=80' }
];

const defaultBanners: OfferBanner[] = [
  {
    _id: 'default-biryani',
    title: 'Royal Biryani Feast',
    subtitle: 'Experience the rich, authentic flavors of slow-cooked gourmet biryanis.',
    image: '/biryani_banner.png',
    linkCategory: 'NonVeg',
    discountText: 'ROYALBIRYANI',
    isActive: true
  },
  {
    _id: 'default-burger',
    title: 'Gourmet Craft Burgers',
    subtitle: 'Juicy hand-pressed patties, toasted brioche buns, and house-made sauces.',
    image: '/burgers_banner.png',
    linkCategory: 'Burgers',
    discountText: 'BURGERCRUSH',
    isActive: true
  },
  {
    _id: 'default-pizza',
    title: 'Woodfired Artisanal Pizzas',
    subtitle: 'Hand-stretched dough baked to perfection in traditional stone ovens.',
    image: '/pizzas_banner.png',
    linkCategory: 'Pizzas',
    discountText: 'PIZZALOVE',
    isActive: true
  },
  {
    _id: 'default-desserts',
    title: 'Sweet Tooth Delights',
    subtitle: 'Indulge in premium molten cakes, artisanal gelatos, and traditional sweets.',
    image: '/desserts_banner.png',
    linkCategory: 'Desserts',
    discountText: 'SWEETCAKE',
    isActive: true
  },
  {
    _id: 'default-veg',
    title: 'Fresh Garden Harvest',
    subtitle: 'Nutrient-dense, organic green bowls and pure vegetarian specialties.',
    image: '/veg_banner.png',
    linkCategory: 'Veg',
    discountText: 'HEALTHYVEG',
    isActive: true
  }
];

export default function Homepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<OfferBanner[]>(defaultBanners);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  // Fetch products & banners dynamically from server endpoints
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, bannerRes] = await Promise.all([
          axios.get(`${backendUrl}/api/products/getallproducts`),
          axios.get(`${backendUrl}/api/offers`)
        ]);

        // Process Products
        const data = prodRes.data.data;
        const typedProducts: Product[] = data.map((item: any) => ({
          _id: item._id,
          name: item.title,
          description: item.description || 'No description available',
          image: item.image || '',
          price: typeof item.price === 'number' ? item.price : 0,
          category: item.category || 'Uncategorized',
          rating: item.rating ? item.rating : { rate: 0, count: 0 },
          discountPercentage: item.discountPercentage || 0,
          discountPrice: item.discountPrice || item.price
        }));

        setProducts(typedProducts);
        const shuffledProducts = shuffleArray<Product>(typedProducts);
        setFeaturedProducts(shuffledProducts.slice(0, 8));
        setSelectedProducts(shuffleArray<Product>([...shuffledProducts]).slice(0, productsPerPage));

        // Process Unique Categories Discounts
        const uniqueCategories = [...new Set(typedProducts.map(product => product.category))];
        const discounts: { [key: string]: number } = {};
        uniqueCategories.forEach(category => {
          discounts[category] = 0;
        });
        setCategoryDiscounts(discounts);

        // Process Promotional Banners under Admin Control
        if (bannerRes.data.success) {
          const activeBanners = (bannerRes.data.data || []).filter((b: OfferBanner) => b.isActive);
          setBanners(activeBanners.length > 0 ? activeBanners : defaultBanners);
        } else {
          setBanners(defaultBanners);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load gourmet catalogs. Please try again later.');
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [productsPerPage, backendUrl]);

  // Handle category & search filters combined
  useEffect(() => {
    let results = [...products];

    if (selectedCategory) {
      results = results.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(results);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, products]);

  // Handle paginate list
  useEffect(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

    if (selectedCategory || searchQuery) {
      setSelectedProducts(filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct));
    } else {
      setSelectedProducts(products.slice(indexOfFirstProduct, indexOfLastProduct));
    }
  }, [currentPage, filteredProducts, products, productsPerPage, selectedCategory, searchQuery]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    scrollToSelection();
  };

  const resetCategoryFilter = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    scrollToSelection();
  };

  const scrollToSelection = () => {
    setTimeout(() => {
      const element = document.getElementById('our-selection-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSearchSubmit = (value: string) => {
    setSearchQuery(value);
    scrollToSelection();
  };

  const calculateDiscountedPrice = (originalPrice: number, category: string) => {
    const discountPercentage = categoryDiscounts[category];
    if (!discountPercentage) return originalPrice;
    return originalPrice - (originalPrice * (discountPercentage / 100));
  };

  const renderStarRating = (rating: number) => {
    const safeRating = Math.min(5, Math.max(0, rating || 0));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = (safeRating % 1) >= 0.5;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#faad14', marginBottom: '8px' }}>
        {Array.from({ length: fullStars }, (_, i) => (
          <i key={`full-${i}`} className="pi pi-star-fill" />
        ))}
        {hasHalfStar && <i className="pi pi-star-fill" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
        {Array.from({ length: 5 - Math.ceil(safeRating) }, (_, i) => (
          <i key={`empty-${i}`} className="pi pi-star" style={{ color: '#d9d9d9' }} />
        ))}
        <span style={{ color: '#8c8c8c', marginLeft: '4px', fontSize: '12px' }}>({safeRating.toFixed(1)})</span>
      </div>
    );
  };

  // PrimeReact Carousel Slide Template
  const bannerTemplate = (banner: OfferBanner) => {
    return (
      <div 
        onClick={() => handleCategoryClick(banner.linkCategory)}
        style={{
          backgroundImage: `linear-gradient(to right, rgba(11, 26, 17, 0.95), rgba(28, 54, 34, 0.4)), url(${banner.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '24px',
          height: '380px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <Tag value={`PROMO CODE: ${banner.discountText}`} severity="success" style={{ marginBottom: '1rem', fontWeight: 'bold' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: '1.2', color: 'white' }}>{banner.title}</h2>
          <p style={{ fontSize: '1.1rem', color: '#bfbfbf', margin: '0 0 1.5rem 0' }}>{banner.subtitle}</p>
          <Button label="Order Now" icon="pi pi-shopping-bag" className="p-button-success" style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: '8px', padding: '10px 20px', fontWeight: 600 }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#52c41a' }} />
        <span style={{ color: '#52c41a', fontWeight: 600 }}>Loading gourmet catalogs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '24px 32px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <i className="pi pi-exclamation-triangle" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#991b1b' }}>Gourmet Catalog Error</h3>
          <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent', position: 'relative', overflow: 'hidden' }}>
      
      {/* PrimeReact Active Deals Offer Banners Carousel (Controlled by Admin APIs) */}
      {banners.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <Carousel 
            value={banners} 
            itemTemplate={bannerTemplate} 
            numVisible={1} 
            numScroll={1} 
            circular 
            autoplayInterval={5000} 
            showNavigators={false}
            showIndicators={false}
          />
        </div>
      )}

      {/* Hero section fall-back if banners carousel is empty */}
      {banners.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #0b1a11 0%, #1c3622 100%)',
          borderRadius: '24px',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '3rem',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
            <Tag value="🟢 GOURMET PARTNER" severity="success" style={{ marginBottom: '1rem', borderRadius: '20px' }} />
            <h1 style={{ color: 'white', fontSize: '3.2rem', fontWeight: 800, margin: '16px 0', letterSpacing: '-1px' }}>
              Craving Delicious Food?
            </h1>
            <p style={{ color: '#bfbfbf', fontSize: '1.2rem', marginBottom: '32px' }}>
              Order thalis, street food, custom burgers, woodfired pizzas, and gourmet desserts from top local kitchens.
            </p>
          </div>
        </div>
      )}

      {/* Primary Search Banner */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        padding: '24px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        marginBottom: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>What are you craving today?</h3>
        <div className="p-inputgroup" style={{ maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <InputText 
            placeholder="Search pizza, pasta, biryani, burgers..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
            style={{ padding: '10px 16px', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}
          />
          <Button 
            icon="pi pi-search" 
            label="Search" 
            className="p-button-success" 
            style={{ background: '#52c41a', borderColor: '#52c41a', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
            onClick={() => handleSearchSubmit(searchQuery)}
          />
        </div>
      </div>

      {/* "What's on your mind?" Bubble Slider */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.5px', fontSize: '1.5rem', color: '#0f172a', margin: '0 0 1.5rem 0' }}>
          What's on your mind?
        </h3>
        <div className="bubble-container">
          {bubbleCategories.map((cat, i) => (
            <div 
              key={i} 
              className={`category-bubble ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.value)}
            >
              <div className="category-bubble-image-wrapper">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="category-bubble-text">{cat.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic popular restaurants explorer component */}
      <FeaturedRestaurants 
        onSelectCategory={handleCategoryClick} 
        selectedCategory={selectedCategory} 
      />

      {/* Continuous scroll Featured items */}
      <div style={{ marginBottom: '4rem' }}>
        <FeaturedProducts
          featuredProducts={featuredProducts}
          categoryDiscounts={categoryDiscounts}
          calculateDiscountedPrice={calculateDiscountedPrice}
          renderStarRating={renderStarRating}
        />
      </div>

      {/* Active browser selections */}
      <div id="our-selection-section" style={{ scrollMarginTop: '100px', marginBottom: '4rem' }}>
        {searchQuery && (
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px', 
            padding: '12px 24px', 
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', color: '#166534', fontWeight: 600 }}>
              Showing results for craving: <strong>"{searchQuery}"</strong> {selectedCategory && `in ${selectedCategory}`}
            </span>
            <Button 
              icon="pi pi-times" 
              className="p-button-rounded p-button-text p-button-sm" 
              onClick={resetCategoryFilter}
              style={{ color: '#166534', width: '30px', height: '30px' }}
            />
          </div>
        )}
        
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


      {/* Testimonials */}
      <div style={{ marginBottom: '4rem' }}>
        <Testimonials />
      </div>

    </div>
  );
}
