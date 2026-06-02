import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Input,
    Button,
    Pagination,
    Select,
    InputNumber,
    Space,
    Rate,
    Empty,
    Typography,
    Tag,
    Layout,
    Modal,
    Image,
    Badge
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    ShoppingCartOutlined,
    InfoCircleOutlined,
    CloseOutlined,
    GiftOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import axios from 'axios';
import 'antd/dist/reset.css';
import { AuthContext } from '../../context/AuthContext';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Product {
    _id: string;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
        rate: number;
        count: number;
    };
    ingredients?: string[];
    calories?: number;
    ageRecommendation?: string;
    discountPercentage?: number;
    discountPrice?: number;
}

interface FilterOptions {
    category: string;
    minPrice: number;
    maxPrice: number;
    minRating: number;
}

const SkeletonPulse = ({ height = '20px', width = '100%', className = '', style = {} }) => (
    <div
        className={`skeleton-pulse ${className}`}
        style={{
            height,
            width,
            backgroundColor: '#e8f5e8',
            borderRadius: '6px',
            ...style
        }}
    />
);

const customStyles = `
.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(25, 135, 84, 0.1) !important;
    transition: all 0.3s ease;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
}
@keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
}
.ant-card-cover img {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}
.store-wrapper {
    position: relative;
    overflow: hidden;
}
.store-container {
    width: 100%;
    margin: 0;
    padding: 24px 0;
}
.decoration-left-bottom {
    position: absolute;
    left: -50px;
    bottom: -50px;
    width: 200px;
    height: 200px;
    opacity: 0.15;
    z-index: -1;
}
.decoration-right-bottom {
    position: absolute;
    right: -50px;
    bottom: -50px;
    width: 220px;
    height: 220px;
    opacity: 0.15;
    z-index: -1;
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
}
.category-badge {
    position: absolute;
    bottom: 8px;
    left: 8px;
}
.filter-panel {
    background: rgba(82, 196, 26, 0.1);
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
}
.header-section {
    background: rgba(82, 196, 26, 0.1);
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 32px;
    position: relative;
}
.search-section {
    margin-bottom: 24px;
}
.ant-pagination-item-active {
    border-color: #52c41a !important;
    background-color: #52c41a !important;
}
.ant-pagination-item-active a {
    color: white !important;
}
.ant-pagination-item:hover {
    border-color: #52c41a !important;
}
.ant-pagination-item:hover a {
    color: #52c41a !important;
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
.know-more-btn .anticon {
    font-size: 12px;
    display: flex;
    align-items: center;
}
.know-more-btn span {
    display: flex;
    align-items: center;
}
.product-details-modal .ant-modal-header {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
}
.product-details-modal .ant-modal-body {
    padding: 24px;
}
.product-details-modal .ant-descriptions-item-label {
    font-weight: 600;
    color: #52c41a;
}
.modal-loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    min-height: 200px;
}
.modal-loading-spinner {
    margin-bottom: 16px;
}
.modal-loading-text {
    color: #52c41a;
    font-size: 16px;
    text-align: center;
}
.combo-deals-btn {
    animation: pulse-glow 2s infinite;
    border-radius: 10px !important;
}
.combo-card {
    transition: all 0.3s ease;
    border-radius: 14px !important;
    overflow: hidden;
}
.combo-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(22, 163, 74, 0.18) !important;
}
.combo-modal-scroll::-webkit-scrollbar {
    display: none;
}
@media (max-width: 768px) {
    .store-container {
        padding: 20px 16px;
    }
    .ant-card {
        width: 301px;
        margin: 0 auto;
    }
}
`;

const shuffleArray = (array: Product[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const Store: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
    const [filters, setFilters] = useState<FilterOptions>({
        category: '',
        minPrice: 0,
        maxPrice: 1000,
        minRating: 0
    });
    const messageApi = {
        success: (opts: any) => (window as any).showToast?.('success', 'Success', typeof opts === 'string' ? opts : opts.content || ''),
        error: (opts: any) => (window as any).showToast?.('error', 'Error', typeof opts === 'string' ? opts : opts.content || ''),
        info: (opts: any) => (window as any).showToast?.('info', 'Info', typeof opts === 'string' ? opts : opts.content || ''),
        warning: (opts: any) => (window as any).showToast?.('warn', 'Warning', typeof opts === 'string' ? opts : opts.content || ''),
    };
    const contextHolder = null;
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [showProductModal, setShowProductModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [combos, setCombos] = useState<any[]>([]);
    const [claimingCombo, setClaimingCombo] = useState<{ [key: string]: boolean }>({});
    const [showComboModal, setShowComboModal] = useState<boolean>(false);
    const productsPerPage = 12;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchCombos = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/promo/combos`);
            if (response.data.success) {
                setCombos(response.data.combos || []);
            }
        } catch (err) {
            console.error('Failed to fetch combos:', err);
        }
    };

    const handleClaimCombo = async (comboId: string) => {
        if (!auth?.isAuthenticated) {
            setShowComboModal(false);
            navigate('/auth');
            return;
        }

        try {
            setClaimingCombo(prev => ({ ...prev, [comboId]: true }));
            const token = auth?.token || localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // 1. Clear the cart
            await axios.delete(`${backendUrl}/api/cart/clear_cart`, {
                headers,
                withCredentials: true
            });

            // 2. Sequentially add each product of that combo deal to the cart
            const combo = combos.find(c => c._id === comboId);
            if (combo && combo.products) {
                for (const p of combo.products) {
                    const fullProd = products.find(prod => prod.title.toLowerCase() === p.title.toLowerCase() || prod._id === p._id);
                    const cartItem = fullProd ? {
                        name: fullProd.title,
                        image: fullProd.image,
                        category: fullProd.category,
                        description: fullProd.description,
                        quantity: 1,
                        original_price: fullProd.price,
                        discount_price: fullProd.discountPrice ?? fullProd.price
                    } : {
                        name: p.title,
                        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
                        category: 'Combo',
                        description: 'Special Combo Deal Product',
                        quantity: 1,
                        original_price: p.price,
                        discount_price: p.price
                    };

                    await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
                        headers,
                        withCredentials: true
                    });
                }
            }

            // 3. Claim the combo
            const res = await axios.post(`${backendUrl}/api/promo/combos/${comboId}/access`, {}, {
                headers,
                withCredentials: true
            });

            if (res.data.success) {
                // 4. Update the global cart count
                if ((window as any).updateCartCount) {
                    (window as any).updateCartCount();
                }

                messageApi.success({
                    content: res.data.message || 'Combo Deal claimed and items added to cart! Proceeding to Checkout...',
                    duration: 3,
                    style: { marginTop: '10vh' }
                });

                setShowComboModal(false);

                // 5. Navigate to checkout
                setTimeout(() => {
                    navigate(`/checkout?comboId=${comboId}`);
                }, 1000);
            }
        } catch (err: any) {
            messageApi.error({
                content: err.response?.data?.message || 'Failed to claim combo deal',
                duration: 4,
                style: { marginTop: '10vh' }
            });
        } finally {
            setClaimingCombo(prev => ({ ...prev, [comboId]: false }));
        }
    };

    useEffect(() => {
        fetchCombos();
    }, []);



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
                setLoading(true);
                const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
                const shuffledProducts = shuffleArray(response.data.data);

                setProducts(shuffledProducts);
                setFilteredProducts(shuffledProducts);

                const uniqueCategories = [...new Set(response.data.data.map((product: Product) => product.category))] as string[];
                setCategories(uniqueCategories);

                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let results = [...products];

        if (searchTerm) {
            results = results.filter(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (filters.category) {
            results = results.filter(product => product.category === filters.category);
        }

        results = results.filter(product =>
            product.price >= filters.minPrice && product.price <= filters.maxPrice
        );

        results = results.filter(product => product.rating.rate >= filters.minRating);

        setFilteredProducts(results);
        setCurrentPage(1);
    }, [searchTerm, filters, products]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handleFilterChange = (name: string, value: any) => {
        if (name === 'minPrice' || name === 'maxPrice' || name === 'minRating') {
            const numValue = value === null || value === undefined ? 0 : parseFloat(value);
            setFilters(prev => ({
                ...prev,
                [name]: numValue
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const addToCart = async (product: Product) => {
        if (!auth?.isAuthenticated) {
            navigate('/auth');
            return;
        }

        try {
            setAddingToCart(prev => ({ ...prev, [product._id]: true }));

            const cartItem = {
                name: product.title,
                image: product.image,
                category: product.category,
                description: product.description,
                quantity: 1,
                original_price: product.price,
                discount_price: product.discountPrice ?? product.price
            };

            const token = localStorage.getItem('token') || auth?.token;

            const headers: any = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
                withCredentials: true,
                headers: headers
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
                    messageApi.error({
                        content: "Please login to add items to cart",
                        duration: 3,
                        style: {
                            marginTop: '10vh',
                        },
                    });
                    navigate('/auth');
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
                        content: "Failed to add item to cart",
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

    const resetFilters = () => {
        setFilters({
            category: '',
            minPrice: 0,
            maxPrice: 1000,
            minRating: 0
        });
        setSearchTerm('');
    };

    const handleKnowMore = async (product: Product) => {
        setModalLoading(true);
        setShowProductModal(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setSelectedProduct(product);
        } catch (error) {
            console.error('Error fetching product details:', error);
            messageApi.error({
                content: "Failed to load product details",
                duration: 3,
                style: {
                    marginTop: '10vh',
                },
            });
            setShowProductModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowProductModal(false);
        setSelectedProduct(null);
        setModalLoading(false);
    };

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
                <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading your Store Page...</span>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
            <Content>
                <div className="store-wrapper">
                    <div className="decoration-left-bottom" style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.61,5.51a15.2,15.2,0,0,1,12.7-1.21c4,1.72,6.3,5.66,8.38,9.47,4.33,7.94,8.64,16,15.73,21.37s17.48,7.35,25.25,2.57c3.8-2.34,6.6-6.07,9-10s4.36-8,7-11.53c10-13.78,32.33-14.35,47.68-5.77,7.56,4.22,14.33,10.86,17.35,19.18s1.79,18.61-5,24c-5.38,4.25-13.12,4.78-19.78,2.66s-12.45-6.59-17.53-11.46C87.86,31.17,71.53,16.84,51.22,13.15c-5.35-1,10.8-1.15,16.22-1.68A92.7,92.7,0,0,1,3.61,5.51Z" transform="translate(6.5 55)" fill="#52c41a" />
                            <path d="M134.89,8.5c6.54,5.11,9.42,14.15,7.46,22.28S133.9,44,126.23,47.52C118.47,51.1,109.52,52.32,101,53.5C79.36,56.59,57.52,59.67,35.81,54.47s-43.54-22.77-44.76-44.71C-10.16-12.32,14.5-28.59,39.5-28c11.75.27,23.43,4.58,30.45,14,8.33,11.18,8.21,27.6,18.61,36.83,7.51,6.67,18.9,7.17,28.16,3.59a31.84,31.84,0,0,0,18.17-17.88" transform="translate(6.5 55)" fill="#52c41a" />
                            <path d="M98,111.39a134.3,134.3,0,0,0-19.42-47C70.79,52.58,58.77,43.81,45.25,39.5C27.51,33.8,7.49,37.75-7.5,45.12" transform="translate(6.5 55)" stroke="#52c41a" strokeMiterlimit="10" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="decoration-right-bottom" style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M196.39,5.51a15.2,15.2,0,0,0-12.7-1.21c-4,1.72-6.3,5.66-8.38,9.47-4.33,7.94-8.64,16-15.73,21.37s-17.48,7.35-25.25,2.57c-3.8-2.34-6.6-6.07-9-10s-4.36-8-7-11.53c-10-13.78-32.33-14.35-47.68-5.77-7.56,4.22-14.33,10.86-17.35,19.18s-1.79,18.61,5,24c5.38,4.25,13.12,4.78,19.78,2.66s12.45-6.59,17.53-11.46c15.51-14.65,31.84-29,52.15-32.67,5.35-1,10.8-1.15,16.22-1.68A92.7,92.7,0,0,0,196.39,5.51Z" transform="translate(-6.5 55)" fill="#52c41a" />
                            <path d="M65.11,8.5C58.57,13.61,55.69,22.65,57.65,30.78S66.1,44,73.77,47.52C81.53,51.1,90.48,52.32,99,53.5c21.64,3.09,43.48,6.17,65.19,1s43.54-22.77,44.76-44.71C210.16-12.32,185.5-28.59,160.5-28c-11.75.27-23.43,4.58-30.45,14-8.33,11.18-8.21,27.6-18.61,36.83-7.51,6.67-18.9,7.17-28.16,3.59A31.84,31.84,0,0,1,65.11,8.5" transform="translate(-6.5 55)" fill="#52c41a" />
                            <path d="M102,111.39a134.3,134.3,0,0,1,19.42-47c7.79-11.81,19.81-20.58,33.33-24.89,17.74-5.7,37.76-1.75,52.75,5.62" transform="translate(-6.5 55)" stroke="#52c41a" strokeMiterlimit="10" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="store-container">
                        <Row gutter={[16, 16]} className="search-section">
                            <Col md={12} xs={24}>
                                <Input.Search
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    style={{ borderColor: '#52c41a' }}
                                    enterButton={
                                        <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                            <SearchOutlined />
                                        </Button>
                                    }
                                />
                            </Col>
                            <Col md={12} xs={24}>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    {combos.length > 0 && (
                                        <Badge count={combos.length} color="#16a34a" offset={[-4, 4]}>
                                            <Button
                                                className="combo-deals-btn"
                                                type="primary"
                                                onClick={() => setShowComboModal(true)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                                                    borderColor: '#16a34a',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontWeight: 700,
                                                    height: '36px',
                                                    paddingInline: '16px'
                                                }}
                                                icon={<GiftOutlined />}
                                            >
                                                Combo Deals
                                            </Button>
                                        </Badge>
                                    )}
                                    <Button
                                        type="default"
                                        style={{
                                            borderColor: '#52c41a',
                                            color: '#52c41a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '36px'
                                        }}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <FilterOutlined style={{ marginRight: '8px' }} />
                                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                        {showFilters && (
                            <div className="filter-panel">
                                <Row gutter={[16, 16]}>
                                    <Col md={6} xs={24}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>Category</Text>
                                            <Select
                                                value={filters.category}
                                                onChange={(value) => handleFilterChange('category', value)}
                                                style={{ width: '100%', marginTop: '8px', borderColor: '#52c41a' }}
                                                placeholder="All Categories"
                                            >
                                                <Option value="">All Categories</Option>
                                                {categories.map((category) => (
                                                    <Option key={category} value={category}>
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </Col>
                                    <Col md={6} xs={24}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>Min Price (₹)</Text>
                                            <InputNumber
                                                min={0}
                                                value={filters.minPrice}
                                                onChange={(value) => handleFilterChange('minPrice', value)}
                                                style={{ width: '100%', marginTop: '8px' }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={6} xs={24}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>Max Price (₹)</Text>
                                            <InputNumber
                                                min={0}
                                                value={filters.maxPrice}
                                                onChange={(value) => handleFilterChange('maxPrice', value)}
                                                style={{ width: '100%', marginTop: '8px' }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={6} xs={24}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>Min Rating</Text>
                                            <Select
                                                value={filters.minRating}
                                                onChange={(value) => handleFilterChange('minRating', value)}
                                                style={{ width: '100%', marginTop: '8px' }}
                                            >
                                                <Option value={0}>Any Rating</Option>
                                                <Option value={1}>1+ Stars</Option>
                                                <Option value={2}>2+ Stars</Option>
                                                <Option value={3}>3+ Stars</Option>
                                                <Option value={4}>4+ Stars</Option>
                                                <Option value={4.5}>4.5+ Stars</Option>
                                            </Select>
                                        </div>
                                    </Col>
                                    <Col xs={24} style={{ textAlign: 'right', marginTop: '16px' }}>
                                        <Button
                                            type="default"
                                            style={{ borderColor: '#52c41a', color: '#52c41a' }}
                                            onClick={resetFilters}
                                        >
                                            Reset Filters
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <Text type="secondary">
                                {loading ? (
                                    <SkeletonPulse width='200px' height='20px' />
                                ) : (
                                    `Showing ${indexOfFirstProduct + 1}-${Math.min(indexOfLastProduct, filteredProducts.length)} of ${filteredProducts.length} products`
                                )}
                            </Text>
                        </div>

                        <Row gutter={[24, 24]}>
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product) => (
                                    <Col xl={6} lg={8} md={12} sm={12} xs={24} key={product._id}>
                                        <Card
                                            className="product-card"
                                            style={{
                                                height: '100%',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                            cover={
                                                <div style={{ position: 'relative' }}>
                                                    <img
                                                        alt={product.title}
                                                        src={product.image}
                                                        style={{
                                                            height: '215px',
                                                            width: '100%',
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
                                                    <div className="category-badge"></div>
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
                                                        className="know-more-btn"
                                                        onClick={() => handleKnowMore(product)}
                                                        style={{ fontSize: '14px' }}
                                                    >
                                                        <InfoCircleOutlined />
                                                        <span>Know More</span>
                                                    </button>
                                                </div>
                                                <Title level={5} style={{ margin: '0 0 8px 0' }} ellipsis>
                                                    {product.title}
                                                </Title>

                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                    <Rate
                                                        disabled
                                                        allowHalf
                                                        value={product.rating.rate}
                                                        style={{ fontSize: '14px' }}
                                                    />
                                                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                                                        ({product.rating.count})
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
                                                    {product.description || 'No description available'}
                                                </Paragraph>

                                                <div style={{
                                                    marginTop: 'auto',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        {product.discountPercentage && product.discountPercentage > 0 ? (
                                                            <Space>
                                                                <Text strong style={{ color: '#52c41a' }}>
                                                                    ₹ {(product.discountPrice ?? product.price).toFixed(2)}
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
                                                        onClick={() => addToCart(product)}
                                                        disabled={addingToCart[product._id]}
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
                                                        {addingToCart[product._id] ? (
                                                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem', color: '#ffffff' }} />
                                                        ) : (
                                                            <>
                                                                <ShoppingCartOutlined style={{ marginRight: 4 }} />
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col span={24}>
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No products found"
                                        style={{ margin: '50px 0' }}
                                    />
                                </Col>
                            )}
                        </Row>

                        {filteredProducts.length > productsPerPage && (
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <Pagination
                                    current={currentPage}
                                    total={filteredProducts.length}
                                    pageSize={productsPerPage}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                    style={{
                                        display: 'inline-block'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {contextHolder}

                {/* Combo Deals Modal */}
                <Modal
                    open={showComboModal}
                    onCancel={() => setShowComboModal(false)}
                    footer={null}
                    width={860}
                    centered
                    closeIcon={<CloseOutlined style={{ color: '#fff', fontSize: '16px' }} />}
                    styles={{
                        content: { padding: 0, borderRadius: '16px', overflow: 'hidden' },
                        body: { padding: 0 }
                    }}
                >
                    <div style={{ padding: '20px 24px 16px 24px', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <GiftOutlined style={{ color: '#16a34a', fontSize: '26px' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#166534' }}>
                                Exclusive TastyHub Combo Deals
                            </h2>
                            <Tag color="error" style={{ fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px', marginLeft: 'auto' }}>
                                <ThunderboltOutlined /> LIMITED OFFER
                            </Tag>
                        </div>
                        <p style={{ color: '#15803d', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
                            Feast like royalty with special curated collections at discounted prices!
                        </p>
                    </div>

                    <div className="combo-modal-scroll" style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {combos.length === 0 ? (
                            <Empty description="No combo deals available right now" style={{ padding: '40px 0' }} />
                        ) : (
                            <Row gutter={[20, 20]}>
                                {combos.map((combo) => {
                                    const isAlreadyClaimed = combo.accessedUsers.includes(auth?.user?._id);
                                    const isExpired = new Date() > new Date(combo.endTime);
                                    const totalOriginal = combo.products.reduce((sum: number, p: any) => sum + p.price, 0);
                                    const savings = Math.max(0, totalOriginal - combo.comboPrice);

                                    return (
                                        <Col key={combo._id} md={12} xs={24}>
                                            <Card
                                                className="combo-card"
                                                style={{
                                                    border: isAlreadyClaimed
                                                        ? '1.5px solid #86efac'
                                                        : isExpired
                                                        ? '1.5px solid #e2e8f0'
                                                        : '1.5px solid #bbf7d0',
                                                    background: isAlreadyClaimed
                                                        ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                                                        : isExpired
                                                        ? '#fafafa'
                                                        : '#fff',
                                                    height: '100%'
                                                }}
                                                styles={{ body: { padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' } }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0, flex: 1, paddingRight: '8px' }}>
                                                        {combo.name}
                                                    </h3>
                                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>₹{combo.comboPrice}</div>
                                                        {savings > 0 && (
                                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                                                                ₹{totalOriginal}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {savings > 0 && (
                                                    <div style={{ backgroundColor: '#22c55e', color: 'white', fontSize: '0.73rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', width: 'fit-content', marginBottom: '12px' }}>
                                                        SAVE ₹{savings.toFixed(2)} INSTANTLY!
                                                    </div>
                                                )}

                                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '14px', flex: 1 }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Items Included:
                                                    </span>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        {combo.products.map((p: any) => (
                                                            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <img
                                                                    src={p.image}
                                                                    alt={p.title}
                                                                    style={{ width: '34px', height: '34px', borderRadius: '7px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                                                                />
                                                                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>{p.title}</span>
                                                                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginLeft: 'auto', flexShrink: 0 }}>₹{p.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <Button
                                                        type="primary"
                                                        disabled={isAlreadyClaimed || claimingCombo[combo._id] || isExpired}
                                                        loading={claimingCombo[combo._id]}
                                                        onClick={() => handleClaimCombo(combo._id)}
                                                        style={{
                                                            width: '100%',
                                                            height: '40px',
                                                            borderRadius: '8px',
                                                            background: isAlreadyClaimed || isExpired
                                                                ? '#cbd5e1'
                                                                : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                                                            borderColor: isAlreadyClaimed || isExpired ? '#cbd5e1' : '#16a34a',
                                                            fontWeight: 700,
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {isAlreadyClaimed
                                                            ? 'Claimed Successfully ✓'
                                                            : isExpired
                                                            ? 'Deal Expired'
                                                            : 'Claim Combo Deal 🎁'}
                                                    </Button>
                                                    <span style={{ fontSize: '0.68rem', color: '#9ca3af', textAlign: 'center' }}>
                                                        Claimed {combo.timesAccessed} of {combo.totalLimit} available
                                                    </span>
                                                </div>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </div>
                </Modal>

                {/* Product Details Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <InfoCircleOutlined style={{ color: '#52c41a' }} />
                            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Product Details</span>
                        </div>
                    }
                    open={showProductModal}
                    onCancel={handleModalClose}
                    footer={null}
                    width={800}
                    className="product-details-modal"
                    closeIcon={<CloseOutlined style={{ color: '#52c41a' }} />}
                    style={{ maxHeight: 'none', top: 50 }}
                    styles={{ body: { maxHeight: 'none', overflow: 'visible' } }}
                >
                    {modalLoading ? (
                        <div className="modal-loading-content">
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
                            <div className="modal-loading-text" style={{ marginTop: '16px', color: '#22c55e', fontWeight: 600 }}>
                                Loading product details...
                            </div>
                        </div>
                    ) : selectedProduct ? (
                        <div style={{ overflow: 'visible' }}>
                            <Row gutter={[24, 24]}>
                                <Col md={10} xs={24}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Image
                                            src={selectedProduct.image}
                                            alt={selectedProduct.title}
                                            style={{
                                                width: '100%',
                                                maxWidth: '300px',
                                                height: '290px',
                                                borderRadius: '12px',
                                                objectFit: 'cover'
                                            }}
                                            preview={false}
                                        />
                                    </div>
                                </Col>
                                <Col md={14} xs={24}>
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <Title level={3} style={{ color: '#52c41a', margin: 0, flex: 1 }}>
                                                {selectedProduct.title}
                                            </Title>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <Text strong style={{ color: '#52c41a', marginRight: '12px' }}>Product ID:</Text>
                                                <Tag color='purple' style={{ fontSize: '12px', border: '1px dashed' }}>{selectedProduct._id}</Tag>
                                            </div>

                                            <div>
                                                <Text strong style={{ color: '#52c41a', marginRight: '12px' }}>Category:</Text>
                                                <Tag color="cyan" style={{ fontSize: '12px', border: '1px dashed' }}>
                                                    {selectedProduct.category}
                                                </Tag>
                                            </div>

                                            <div>
                                                <Text strong style={{ color: '#52c41a', marginRight: '12px' }}>Rating:</Text>
                                                <Rate disabled allowHalf value={selectedProduct.rating.rate} style={{ fontSize: '14px' }} />
                                                <Text strong style={{ marginLeft: '8px', fontSize: '14px' }}>
                                                    {selectedProduct.rating.rate}
                                                </Text>
                                                <Text type="secondary" style={{ marginLeft: '8px' }}>
                                                    ({selectedProduct.rating.count} reviews)
                                                </Text>
                                            </div>

                                            <div>
                                                <Text strong style={{ color: '#52c41a', marginRight: '12px' }}>Price:</Text>
                                                {selectedProduct.discountPercentage && selectedProduct.discountPercentage > 0 ? (
                                                    <Space>
                                                        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                                            ₹ {(selectedProduct.discountPrice ?? selectedProduct.price).toFixed(2)}
                                                        </Text>
                                                        <Text delete type="secondary" style={{ fontSize: '14px' }}>
                                                            ₹ {selectedProduct.price.toFixed(2)}
                                                        </Text>
                                                    </Space>
                                                ) : (
                                                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                                        ₹ {selectedProduct.price.toFixed(2)}
                                                    </Text>
                                                )}
                                            </div>

                                            {selectedProduct.calories && (
                                                <div>
                                                    <Text strong style={{ color: '#52c41a', marginRight: '12px' }}>Calories:</Text>
                                                    <Text style={{ fontSize: '14px' }}>
                                                        {selectedProduct.calories} per serving
                                                    </Text>
                                                </div>
                                            )}

                                            <div style={{ marginTop: '20px' }}>
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    onClick={() => {
                                                        addToCart(selectedProduct);
                                                        setShowProductModal(false);
                                                    }}
                                                    disabled={addingToCart[selectedProduct._id]}
                                                    style={{
                                                        backgroundColor: '#52c41a',
                                                        borderColor: '#52c41a',
                                                        width: '100%',
                                                        height: '45px',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {addingToCart[selectedProduct._id] ? (
                                                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem', color: '#ffffff' }} />
                                                    ) : (
                                                        <>
                                                            <ShoppingCartOutlined style={{ marginRight: '8px' }} />
                                                            Add to Cart
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row style={{ marginTop: '24px' }}>
                                <Col span={24}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: '8px' }}>Image URL:</Text>
                                            <Text
                                                copyable
                                                style={{
                                                    fontSize: '12px',
                                                    display: 'block',
                                                    wordBreak: 'break-all',
                                                    whiteSpace: 'normal',
                                                    background: 'transparent',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #e8e8e8'
                                                }}
                                            >
                                                {selectedProduct.image}
                                            </Text>
                                        </div>

                                        <div>
                                            <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: '8px' }}>Description:</Text>
                                            <Text style={{ fontSize: '14px', lineHeight: '1.6', display: 'block' }}>
                                                {selectedProduct.description || 'No description available'}
                                            </Text>
                                        </div>

                                        {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                                            <div>
                                                <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: '8px' }}>Ingredients:</Text>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {selectedProduct.ingredients.map((ingredient, index) => (
                                                        <Tag
                                                            key={index}
                                                            color="blue"
                                                            style={{
                                                                border: '1px dashed',
                                                                fontSize: '12px',
                                                                padding: '2px 8px'
                                                            }}
                                                        >
                                                            {ingredient}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedProduct.ageRecommendation && (
                                            <div>
                                                <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: '8px' }}>Age Recommendation:</Text>
                                                <Text style={{ fontSize: '14px' }}>
                                                    {selectedProduct.ageRecommendation}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    ) : null}
                </Modal>


            </Content>
        </Layout>
    );
};

export default Store;