import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Rating } from 'primereact/rating';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

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

// const SkeletonPulse = ({ height = '20px', width = '100%', className = '', style = {} }) => (
//     <div
//         className={`skeleton-pulse \${className}`}
//         style={{
//             height,
//             width,
//             backgroundColor: '#e8f5e8',
//             borderRadius: '6px',
//             ...style
//         }}
//     />
// );

const customStoreStyles = `
.product-card {
    transition: all 0.3s ease;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.product-card .p-card-body {
    padding: 0px !important;
}
.product-card .p-card-content {
    padding: 0 !important;
}
.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(25, 135, 84, 0.1) !important;
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
    z-index: 2;
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
.search-section-row {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}
.search-input-col {
    flex: 1;
    min-width: 280px;
}
.search-buttons-col {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
}
.filter-grid-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}
@media (min-width: 768px) {
    .filter-grid-layout {
        grid-template-columns: repeat(4, 1fr);
    }
}
.store-products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
}
@media (min-width: 576px) {
    .store-products-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media (min-width: 992px) {
    .store-products-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
@media (min-width: 1200px) {
    .store-products-grid {
        grid-template-columns: repeat(4, 1fr);
    }
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
.know-more-btn i {
    font-size: 12px;
    display: flex;
    align-items: center;
}
.know-more-btn span {
    display: flex;
    align-items: center;
}
.combo-deals-btn {
    animation: pulse-glow 2s infinite;
    border-radius: 10px !important;
}
.combo-card {
    transition: all 0.3s ease;
    border-radius: 14px !important;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.combo-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(22, 163, 74, 0.18) !important;
}
.combo-modal-scroll::-webkit-scrollbar {
    display: none;
}
.combo-grid-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
}
@media (min-width: 768px) {
    .combo-grid-layout {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media (max-width: 768px) {
    .store-container {
        padding: 20px 16px;
    }
}
.details-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
}
@media (min-width: 768px) {
    .details-grid {
        grid-template-columns: 5fr 7fr;
    }
}
.details-desc-item {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid #f3f4f6;
}
.details-desc-label {
    width: 140px;
    font-weight: 600;
    color: #166534;
}
.details-desc-value {
    flex: 1;
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
            navigate('/user/auth');
            return;
        }

        try {
            setClaimingCombo(prev => ({ ...prev, [comboId]: true }));
            const token = auth?.token || localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            await axios.delete(`${backendUrl}/api/cart/clear_cart`, {
                headers,
                withCredentials: true
            });

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

            const res = await axios.post(`${backendUrl}/api/promo/combos/${comboId}/access`, {}, {
                headers,
                withCredentials: true
            });

            if (res.data.success) {
                if ((window as any).updateCartCount) {
                    (window as any).updateCartCount();
                }

                messageApi.success({
                    content: res.data.message || 'Combo Deal claimed and items added to cart! Proceeding to Checkout...',
                    duration: 3,
                    style: { marginTop: '10vh' }
                });

                setShowComboModal(false);

                setTimeout(() => {
                    navigate(`/user/checkout?comboId=${comboId}`);
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
        styleElement.innerHTML = customStoreStyles;
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
            const numValue = value === null || value === undefined || value === '' ? 0 : parseFloat(value);
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
            navigate('/user/auth');
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
                    navigate('/user/auth');
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

    // const renderStars = (ratingValue: number) => {
    //     const stars = [];
    //     const floor = Math.floor(ratingValue);
    //     const hasHalf = ratingValue % 1 !== 0;
    //     for (let i = 1; i <= 5; i++) {
    //         if (i <= floor) {
    //             stars.push(<i key={i} className="pi pi-star-fill" style={{ color: '#facc15', fontSize: '13px', marginRight: '2px' }} />);
    //         } else if (i === floor + 1 && hasHalf) {
    //             stars.push(<i key={i} className="pi pi-star-fill" style={{ color: '#facc15', fontSize: '13px', marginRight: '2px', opacity: 0.7 }} />);
    //         } else {
    //             stars.push(<i key={i} className="pi pi-star" style={{ color: '#d1d5db', fontSize: '13px', marginRight: '2px' }} />);
    //         }
    //     }
    //     return <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>;
    // };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
                <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading your Store Page...</span>
            </div>
        );
    }

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
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
                    <div className="search-section-row">
                        <div className="search-input-col">
                            <div style={{ position: 'relative', width: '100%' }}>
                                <span style={{ width: '100%', display: 'block', position: 'relative' }}>
                                    <i className="pi pi-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: '16px', zIndex: 2 }} />
                                    <InputText
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        placeholder="Search premium food, desserts, or drinks..."
                                        style={{
                                            width: '100%',
                                            paddingLeft: '44px',
                                            paddingRight: searchTerm ? '40px' : '16px',
                                            borderRadius: '30px',
                                            border: '2.5px solid #22c55e',
                                            height: '46px',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            outline: 'none',
                                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.08)',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: '#ffffff'
                                        }}
                                    />
                                </span>
                                {searchTerm && (
                                    <i
                                        className="pi pi-times-circle"
                                        onClick={() => setSearchTerm('')}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            zIndex: 2,
                                            transition: 'color 0.2s'
                                        }}
                                        title="Clear search"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="search-input-col search-buttons-col">
                            {combos.length > 0 && (
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className="combo-deals-btn"
                                        onClick={() => setShowComboModal(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                                            borderColor: '#16a34a',
                                            border: 'none',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontWeight: 700,
                                            height: '36px',
                                            paddingInline: '16px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <i className="pi pi-gift" />
                                        Combo Deals
                                    </button>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '-6px',
                                            right: '-6px',
                                            backgroundColor: '#16a34a',
                                            color: 'white',
                                            borderRadius: '50%',
                                            padding: '2px 6px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            lineHeight: 1
                                        }}
                                    >
                                        {combos.length}
                                    </span>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                                <button
                                    onClick={() => handleFilterChange('category', filters.category === 'Veg' ? '' : 'Veg')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: filters.category === 'Veg' ? '1px solid #22c55e' : '1px solid #e2e8f0',
                                        backgroundColor: filters.category === 'Veg' ? '#f0fdf4' : '#ffffff',
                                        color: filters.category === 'Veg' ? '#16a34a' : '#475569',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: filters.category === 'Veg' ? '0 2px 8px rgba(34, 197, 94, 0.15)' : 'none'
                                    }}
                                >
                                    <span>Pure Veg 🟢</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange('minRating', filters.minRating === 4.5 ? 0 : 4.5)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: filters.minRating === 4.5 ? '1px solid #eab308' : '1px solid #e2e8f0',
                                        backgroundColor: filters.minRating === 4.5 ? '#fef9c3' : '#ffffff',
                                        color: filters.minRating === 4.5 ? '#ca8a04' : '#475569',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: filters.minRating === 4.5 ? '0 2px 8px rgba(234, 179, 8, 0.15)' : 'none'
                                    }}
                                >
                                    <span>4.5+ Rating ★</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (filters.maxPrice === 300) {
                                            handleFilterChange('maxPrice', 2000);
                                        } else {
                                            handleFilterChange('maxPrice', 300);
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: filters.maxPrice === 300 ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                        backgroundColor: filters.maxPrice === 300 ? '#eff6ff' : '#ffffff',
                                        color: filters.maxPrice === 300 ? '#2563eb' : '#475569',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: filters.maxPrice === 300 ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none'
                                    }}
                                >
                                    <span>Under ₹300 💰</span>
                                </button>
                                <button
                                    style={{
                                        borderColor: '#22c55e',
                                        color: '#22c55e',
                                        border: '1px solid #22c55e',
                                        background: showFilters ? '#f0fdf4' : 'none',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '34px',
                                        padding: '0 16px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        marginLeft: 'auto'
                                    }}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <i className="pi pi-sliders-h" style={{ marginRight: '8px' }} />
                                    {showFilters ? 'Hide Filters' : 'More Filters'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <Card
                            style={{
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                marginBottom: '24px',
                                padding: '8px'
                            }}
                        >
                            <div className="filter-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold', color: '#15803d', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Category</span>
                                    <Dropdown
                                        value={filters.category}
                                        options={[
                                            { label: 'All Categories', value: '' },
                                            ...categories.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
                                        ]}
                                        onChange={(e) => handleFilterChange('category', e.value)}
                                        placeholder="Select Category"
                                        style={{ width: '100%', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 'bold', color: '#15803d', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Min Price</span>
                                    <InputNumber
                                        value={filters.minPrice}
                                        onValueChange={(e) => handleFilterChange('minPrice', e.value || 0)}
                                        min={0}
                                        mode="currency"
                                        currency="INR"
                                        locale="en-IN"
                                        inputStyle={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '10px 14px' }}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 'bold', color: '#15803d', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Max Price</span>
                                    <InputNumber
                                        value={filters.maxPrice}
                                        onValueChange={(e) => handleFilterChange('maxPrice', e.value || 2000)}
                                        min={0}
                                        mode="currency"
                                        currency="INR"
                                        locale="en-IN"
                                        inputStyle={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '10px 14px' }}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 'bold', color: '#15803d', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Min Rating</span>
                                    <Dropdown
                                        value={filters.minRating}
                                        options={[
                                            { label: 'Any Rating', value: 0 },
                                            { label: '1+ Stars ★', value: 1 },
                                            { label: '2+ Stars ★', value: 2 },
                                            { label: '3+ Stars ★', value: 3 },
                                            { label: '4+ Stars ★', value: 4 },
                                            { label: '4.5+ Stars ★', value: 4.5 }
                                        ]}
                                        onChange={(e) => handleFilterChange('minRating', e.value)}
                                        placeholder="Select Rating"
                                        style={{ width: '100%', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <Button
                                    label="Reset Filters"
                                    icon="pi pi-refresh"
                                    className="p-button-outlined p-button-success p-button-sm"
                                    style={{ borderRadius: '8px', fontWeight: 600 }}
                                    onClick={resetFilters}
                                />
                            </div>
                        </Card>
                    )}

                    <div style={{ marginBottom: '24px' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                        </span>
                    </div>

                    <div className="store-products-grid">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => {
                                const ratingValue = product.rating.rate;
                                const ratingCount = product.rating.count;

                                const cardHeader = (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            alt={product.title}
                                            src={product.image}
                                            style={{
                                                width: '100%',
                                                height: '200px',
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
                                    </div>
                                );

                                return (
                                    <Card
                                        key={product._id}
                                        className="product-card"
                                        header={cardHeader}
                                        style={{
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                            background: '#ffffff',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', padding: '17px 13px', flexGrow: 1 }}>
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
                                                    className="know-more-btn"
                                                    onClick={() => handleKnowMore(product)}
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
                                                {product.title || 'Unnamed Product'}
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
                                                {product.description || 'No description available'}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
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
                                                    onClick={() => addToCart(product)}
                                                    disabled={addingToCart[product._id]}
                                                    label={addingToCart[product._id] ? "" : "Add to Cart"}
                                                    icon={addingToCart[product._id] ? "pi pi-spin pi-spinner" : "pi pi-shopping-cart"}
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
                            })
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px', color: '#6b7280' }}>
                                <i className="pi pi-folder-open" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                                <div style={{ fontWeight: 600, fontSize: '16px' }}>No products found</div>
                                <div style={{ fontSize: '0.85rem' }}>Try clearing filters or checking other categories.</div>
                            </div>
                        )}
                    </div>

                    {filteredProducts.length > productsPerPage && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', gap: '8px', flexWrap: 'wrap' }}>
                            {pages.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
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
            </div>

            {/* Combo Deals Modal */}
            <Dialog
                visible={showComboModal}
                onHide={() => setShowComboModal(false)}
                footer={null}
                style={{ width: '860px', maxWidth: '95vw', borderRadius: '16px', overflow: 'hidden' }}
                modal
            >
                <div style={{ padding: '8px 0 16px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <i className="pi pi-gift" style={{ color: '#16a34a', fontSize: '26px' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#166534' }}>
                            Exclusive TastyHub Combo Deals
                        </h2>
                        <span style={{ fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px', marginLeft: 'auto', backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 8px', border: '1px solid #fca5a5' }}>
                            <i className="pi pi-bolt" /> LIMITED OFFER
                        </span>
                    </div>
                    <p style={{ color: '#15803d', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
                        Feast like royalty with special curated collections at discounted prices!
                    </p>
                </div>

                <div className="combo-modal-scroll" style={{ padding: '24px 0', maxHeight: '55vh', overflowY: 'auto' }}>
                    {combos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                            <i className="pi pi-info-circle" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                            <p>No combo deals available right now</p>
                        </div>
                    ) : (
                        <div className="combo-grid-layout">
                            {combos.map((combo) => {
                                const isAlreadyClaimed = combo.accessedUsers.includes(auth?.user?._id);
                                const isExpired = new Date() > new Date(combo.endTime);
                                const totalOriginal = combo.products.reduce((sum: number, p: any) => sum + p.price, 0);
                                const savings = Math.max(0, totalOriginal - combo.comboPrice);

                                return (
                                    <div
                                        key={combo._id}
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
                                            padding: '18px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <div>
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

                                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '14px' }}>
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
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
                                            <button
                                                disabled={isAlreadyClaimed || claimingCombo[combo._id] || isExpired}
                                                onClick={() => handleClaimCombo(combo._id)}
                                                style={{
                                                    width: '100%',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    color: 'white',
                                                    cursor: (isAlreadyClaimed || isExpired) ? 'default' : 'pointer',
                                                    background: isAlreadyClaimed || isExpired
                                                        ? '#cbd5e1'
                                                        : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {claimingCombo[combo._id] ? (
                                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }} />
                                                ) : isAlreadyClaimed ? (
                                                    'Claimed Successfully ✓'
                                                ) : isExpired ? (
                                                    'Deal Expired'
                                                ) : (
                                                    'Claim Combo Deal 🎁'
                                                )}
                                            </button>
                                            <span style={{ fontSize: '0.68rem', color: '#9ca3af', textAlign: 'center' }}>
                                                Claimed {combo.timesAccessed} of {combo.totalLimit} available
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Dialog>

            {/* Product Details Modal */}
            <Dialog
                header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e' }}>
                        <i className="pi pi-info-circle" />
                        <span style={{ fontWeight: 'bold' }}>Product Details</span>
                    </div>
                }
                visible={showProductModal}
                onHide={handleModalClose}
                style={{ width: '900px', maxWidth: '95vw' }}
                breakpoints={{ '960px': '75vw', '641px': '95vw' }}
                draggable={false}
                resizable={false}
                modal
            >
                {modalLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px' }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
                        <p style={{ marginTop: '16px', color: '#22c55e', fontWeight: 600 }}>Loading product details...</p>
                    </div>
                ) : selectedProduct ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '24px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.title}
                                    style={{
                                        width: '100%',
                                        maxWidth: '280px',
                                        height: '260px',
                                        borderRadius: '12px',
                                        objectFit: 'cover',
                                        border: '1px solid #e5e7eb'
                                    }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1f2937' }}>
                                    {selectedProduct.title}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#4b5563' }}>
                                    <div>
                                        <strong style={{ color: '#22c55e', marginRight: '8px' }}>Product ID:</strong>
                                        <Tag value={selectedProduct._id} severity="secondary" style={{ borderRadius: '4px', border: '1px dashed' }} />
                                    </div>

                                    <div>
                                        <strong style={{ color: '#22c55e', marginRight: '8px' }}>Category:</strong>
                                        <Tag value={selectedProduct.category} severity="info" style={{ borderRadius: '4px', border: '1px dashed' }} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <strong style={{ color: '#22c55e', marginRight: '2px' }}>Rating:</strong>
                                        <Rating
                                            disabled
                                            cancel={false}
                                            value={Math.round(selectedProduct.rating.rate)}
                                            stars={5}
                                            style={{ color: '#f59e0b', fontSize: '13px' }}
                                        />
                                        <span style={{ fontWeight: 'bold' }}>
                                            {selectedProduct.rating.rate.toFixed(1)}
                                        </span>
                                    </div>

                                    <div>
                                        <strong style={{ color: '#22c55e', marginRight: '8px' }}>Price:</strong>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                            {selectedProduct.discountPercentage && selectedProduct.discountPercentage > 0 ? (
                                                <>
                                                    <strong style={{ fontSize: '16px', color: '#22c55e' }}>₹{(selectedProduct.discountPrice ?? selectedProduct.price).toFixed(2)}</strong>
                                                    <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{selectedProduct.price.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <strong style={{ fontSize: '16px', color: '#1f2937' }}>₹ {selectedProduct.price.toFixed(2)}</strong>
                                            )}
                                        </span>
                                    </div>

                                    {selectedProduct.calories && (
                                        <div>
                                            <strong style={{ color: '#22c55e', marginRight: '8px' }}>Calories:</strong>
                                            <span>{selectedProduct.calories} kcal per serving</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                                    <Button
                                        onClick={() => {
                                            addToCart(selectedProduct);
                                            setShowProductModal(false);
                                        }}
                                        disabled={addingToCart[selectedProduct._id]}
                                        label={addingToCart[selectedProduct._id] ? "" : "Add to Cart"}
                                        icon={addingToCart[selectedProduct._id] ? "pi pi-spin pi-spinner" : "pi pi-shopping-cart"}
                                        className="p-button-success"
                                        style={{ width: '100%', height: '40px', borderRadius: '8px', fontWeight: 'bold' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <div>
                                <strong style={{ color: '#22c55e', display: 'block', marginBottom: '6px' }}>Description:</strong>
                                <span style={{ color: '#4b5563', lineHeight: '1.6' }}>{selectedProduct.description || 'No description available'}</span>
                            </div>

                            {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                                <div>
                                    <strong style={{ color: '#22c55e', display: 'block', marginBottom: '6px' }}>Ingredients:</strong>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {selectedProduct.ingredients.map((ingredient, idx) => (
                                            <Tag key={idx} value={ingredient} severity="warning" style={{ borderRadius: '4px', border: '1px dashed' }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProduct.ageRecommendation && (
                                <div>
                                    <strong style={{ color: '#22c55e', marginRight: '8px' }}>Age Recommendation:</strong>
                                    <span>{selectedProduct.ageRecommendation}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </Dialog>
        </div>
    );
};

export default Store;