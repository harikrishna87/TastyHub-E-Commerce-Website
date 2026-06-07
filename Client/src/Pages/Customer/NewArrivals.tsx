import { useState, useEffect, useContext } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

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
    createdAt?: string;
}

const NewArrivals = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
    
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [showProductModal, setShowProductModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const showToastMsg = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        if ((window as any).showToast) {
            (window as any).showToast(severity, summary, detail);
        }
    };

    useEffect(() => {
        fetchNewArrivals();
    }, []);

    const fetchNewArrivals = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
            const allProducts = response.data.data || [];

            const sortedProducts = allProducts
                .sort((a: Product, b: Product) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                })
                .slice(0, 8);

            setProducts(sortedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            showToastMsg('error', 'Error', 'Failed to load products');
        } finally {
            setLoading(false);
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
                name: product.name || product.title,
                image: product.image,
                category: product.category,
                description: product.description,
                quantity: 1,
                original_price: product.price,
                discount_price: product.price,
            };

            const response = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth?.token ? `Bearer ${auth.token}` : ''
                }
            });

            showToastMsg('success', 'Success', response.data.message || "Item added to cart successfully");

            if ((window as any).updateCartCount) {
                (window as any).updateCartCount();
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    auth?.logout?.();
                    navigate('/user/auth');
                    showToastMsg('error', 'Session Expired', 'Session expired. Please login again.');
                } else if (error.response?.status === 400) {
                    showToastMsg('info', 'Info', error.response.data.message || "Item already exists in cart");
                } else {
                    showToastMsg('error', 'Error', error.response?.data?.message || "Failed to add item to cart");
                }
            } else {
                showToastMsg('error', 'Error', "Network error. Please try again.");
            }
        } finally {
            setAddingToCart(prev => ({ ...prev, [product._id]: false }));
        }
    };

    const handleKnowMore = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    const truncateDescription = (description: string | undefined | null) => {
        if (!description) return "";
        const maxLength = 80;
        if (description.length <= maxLength) return description;
        return `${description.substring(0, maxLength)}...`;
    };

    const getProductTags = (_index?: number) => {
        const tags = [];
        tags.push({ type: 'new', icon: 'pi pi-clock', text: 'NEW', color: 'green', severity: 'success' as const });
        return tags;
    };

    const breadcrumbItems = [
        {
            template: () => (
                <Link to="/user/newarrivals" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#22c55e', fontWeight: 600 }}>
                    <i className="pi pi-star" />
                    <span>New Arrivals</span>
                </Link>
            )
        }
    ];
    const breadcrumbHome = {
        template: () => (
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#64748b' }}>
                <i className="pi pi-home" />
                <span>Home</span>
            </Link>
        )
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '75vh',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: 'transparent'
            }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
                <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading New Arrivals...</span>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: 'transparent', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .responsive-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 24px;
                    margin-bottom: 40px;
                }
                @media (max-width: 1024px) {
                    .responsive-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }
                @media (max-width: 768px) {
                    .responsive-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
                @media (max-width: 480px) {
                    .responsive-grid {
                        grid-template-columns: repeat(1, minmax(0, 1fr));
                    }
                }
                .product-card .p-card-body {
                    padding: 0px !important;
                }
                .product-card .p-card-content {
                    padding: 0 !important;
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
                    font-size: 11px;
                    z-index: 10;
                }
            `}</style>
            <div style={{ width: '100%' }}>
                
                {/* Breadcrumb */}
                <div style={{ marginBottom: '24px' }}>
                    <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} style={{ background: 'transparent', border: 'none', padding: 0 }} />
                </div>

                {/* Title section */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <i className="pi pi-star-fill" style={{ fontSize: '32px', color: '#22c55e' }} />
                        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#1f2937' }}>
                            New Arrivals
                        </h2>
                    </div>
                    <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 0 44px' }}>
                        Discover our latest delicious additions to the menu
                    </p>
                </div>

                {/* Products Grid */}
                <div className="responsive-grid">
                    {products.map((product, index) => {
                        const ratingValue = typeof product.rating === 'object' ? product.rating.rate : (product.rating || 0);
                        const ratingCount = typeof product.rating === 'object' ? product.rating.count : 0;
                        
                        const cardHeader = (
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={product.image}
                                    alt={product.name || product.title}
                                    style={{
                                        height: '200px',
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
                                {(product as any).discountPercentage && (product as any).discountPercentage > 0 ? (
                                    <div className="discount-badge">
                                        {(product as any).discountPercentage}% OFF
                                    </div>
                                ) : null}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {getProductTags(index).map((tag, idx) => (
                                        <Tag 
                                            key={idx} 
                                            value={tag.text} 
                                            severity={tag.severity}
                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px' }}
                                            icon={<i className={tag.icon} />}
                                        />
                                    ))}
                                </div>
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
                                        {product.name || product.title || 'Unnamed Product'}
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
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {truncateDescription(product.description)}
                                    </p>

                                    <div style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: 800, color: '#22c55e', fontSize: '18px' }}>
                                            ₹ {product.price.toFixed(2)}
                                        </span>
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
                    })}
                </div>

                {/* Footer divider block */}
                <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                        <i className="pi pi-star" />
                        <span>New Dishes, Same Delicious Promise!</span>
                    </div>
                </div>
            </div>

            {/* PrimeReact Product Details Dialog */}
            <Dialog
                header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e' }}>
                        <i className="pi pi-info-circle" />
                        <span style={{ fontWeight: 'bold' }}>Product Details</span>
                    </div>
                }
                visible={showProductModal}
                onHide={() => setShowProductModal(false)}
                style={{ width: '900px', maxWidth: '95vw' }}
                breakpoints={{ '960px': '75vw', '641px': '95vw' }}
                draggable={false}
                resizable={false}
            >
                {selectedProduct ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '24px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name || selectedProduct.title}
                                    style={{
                                        width: '100%',
                                        maxWidth: '280px',
                                        height: '260px',
                                        borderRadius: '12px',
                                        objectFit: 'cover',
                                        border: '1px solid #e5e7eb'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1f2937' }}>
                                    {selectedProduct.name || selectedProduct.title}
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
                                            value={Math.round(typeof selectedProduct.rating === 'object' ? selectedProduct.rating.rate : (selectedProduct.rating || 0))}
                                            stars={5}
                                            style={{ color: '#f59e0b', fontSize: '13px' }}
                                        />
                                        <span style={{ fontWeight: 'bold' }}>
                                            {typeof selectedProduct.rating === 'object' ? selectedProduct.rating.rate.toFixed(1) : (selectedProduct.rating || 0).toFixed(1)}
                                        </span>
                                    </div>

                                    <div>
                                        <strong style={{ color: '#22c55e', marginRight: '8px' }}>Price:</strong>
                                        <strong style={{ fontSize: '16px', color: '#1f2937' }}>₹ {selectedProduct.price.toFixed(2)}</strong>
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
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem', color: '#22c55e' }} />
                        <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading product details...</p>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default NewArrivals;