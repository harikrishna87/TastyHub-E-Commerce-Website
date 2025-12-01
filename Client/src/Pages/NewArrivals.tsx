import { useState, useEffect, useContext } from 'react';
import {
    Card,
    Breadcrumb,
    Typography,
    Row,
    Col,
    Space,
    Tag,
    Spin,
    Button,
    Rate,
    message,
    Modal,
    Image,
    Divider
} from 'antd';
import {
    HomeOutlined,
    StarOutlined,
    FireOutlined,
    ClockCircleOutlined,
    ShoppingCartOutlined,
    InfoCircleOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AuthModal from "../Components/AuthModal";

const { Title, Paragraph, Text } = Typography;

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

const customStyles = `
.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(25, 135, 84, 0.1) !important;
    transition: all 0.3s ease;
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
`;

const NewArrivals = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
    const [messageApi, contextHolder] = message.useMessage();
    const auth = useContext(AuthContext);
    const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
    const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
    const [showProductModal, setShowProductModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loadingProductDetails, setLoadingProductDetails] = useState<boolean>(false);

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
        fetchNewArrivals();
    }, []);

    const fetchNewArrivals = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
            const allProducts = response.data.data;

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
            messageApi.error({
                content: "Failed to load products",
                duration: 3,
                style: { marginTop: '10vh' }
            });
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product: Product) => {
        if (!auth?.isAuthenticated) {
            setShowAuthModal(true);
            setIsLoginMode(true);
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

            messageApi.success({
                content: response.data.message || "Item added to cart successfully",
                duration: 3,
                style: { marginTop: '10vh' }
            });

            if ((window as any).updateCartCount) {
                (window as any).updateCartCount();
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    auth?.logout?.();
                    setShowAuthModal(true);
                    setIsLoginMode(true);
                    messageApi.error({
                        content: "Session expired. Please login again.",
                        duration: 3,
                        style: { marginTop: '10vh' }
                    });
                } else if (error.response?.status === 400) {
                    messageApi.info({
                        content: error.response.data.message || "Item already exists in cart",
                        duration: 3,
                        style: { marginTop: '10vh' }
                    });
                } else {
                    messageApi.error({
                        content: error.response?.data?.message || "Failed to add item to cart",
                        duration: 3,
                        style: { marginTop: '10vh' }
                    });
                }
            } else {
                messageApi.error({
                    content: "Network error. Please try again.",
                    duration: 3,
                    style: { marginTop: '10vh' }
                });
            }
        } finally {
            setAddingToCart(prev => ({ ...prev, [product._id]: false }));
        }
    };

    const handleKnowMore = async (product: Product) => {
        try {
            setLoadingProductDetails(true);
            setShowProductModal(true);
            setSelectedProduct(product);
            setLoadingProductDetails(false);
        } catch (error) {
            console.error('Error fetching product details:', error);
            setSelectedProduct(product);
            setLoadingProductDetails(false);
        }
    };

    const truncateDescription = (description: string | undefined | null) => {
        if (!description) return "";
        const maxLength = 80;
        if (description.length <= maxLength) return description;
        return `${description.substring(0, maxLength)}...`;
    };

    const getProductTags = (index: number) => {
        const tags = [];
        if (index < 3) tags.push({ type: 'new', icon: <ClockCircleOutlined />, text: 'NEW', color: 'green' });
        if (index % 3 === 0) tags.push({ type: 'trending', icon: <FireOutlined />, text: 'TRENDING', color: 'red' });
        if (index % 2 === 0) tags.push({ type: 'popular', icon: <StarOutlined />, text: 'POPULAR', color: 'orange' });
        return tags;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '75vh',
                flexDirection: 'column',
                backgroundColor: '#f5f5f5'
            }}>
                <Spin size="large" style={{ color: '#52c41a' }} />
                <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading New Arrivals...</Paragraph>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {contextHolder}
            <Row justify="center">
                <Col xs={24} sm={24} md={22} lg={20} xl={18}>
                    <div style={{ marginBottom: '24px', borderRadius: '12px' }}>
                        <Breadcrumb
                            items={[
                                {
                                    title: (
                                        <Link to="/">
                                            <Space>
                                                <HomeOutlined />
                                                <span>Home</span>
                                            </Space>
                                        </Link>
                                    ),
                                },
                                {
                                    title: (
                                        <Space>
                                            <StarOutlined />
                                            <span>New Arrivals</span>
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <Space align="center" size="middle" style={{ marginBottom: '8px' }}>
                            <StarOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                            <Title level={2} style={{ margin: 0 }}>
                                New Arrivals
                            </Title>
                        </Space>
                        <Paragraph style={{ fontSize: '16px', color: '#8c8c8c', marginLeft: '44px' }}>
                            Discover our latest delicious additions to the menu
                        </Paragraph>
                    </div>

                    <Row gutter={[24, 24]}>
                        {products.map((product, index) => (
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
                                                src={product.image}
                                                alt={product.name}
                                                style={{
                                                    height: '180px',
                                                    width: '100%',
                                                    objectFit: 'cover',
                                                    borderTopLeftRadius: '12px',
                                                    borderTopRightRadius: '12px'
                                                }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                left: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            }}>
                                                {getProductTags(index).map((tag, idx) => (
                                                    <Tag key={idx} color={tag.color} style={{ margin: 0 }}>
                                                        <Space>
                                                            {tag.icon}
                                                            {tag.text}
                                                        </Space>
                                                    </Tag>
                                                ))}
                                            </div>
                                        </div>
                                    }
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <Tag color="cyan" style={{ fontSize: '12px', padding: '2px 8px', border: '1px dashed' }}>
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
                                            {product.name || product.title || 'Unnamed Product'}
                                        </Title>

                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <Rate
                                                disabled
                                                allowHalf
                                                value={typeof product.rating === 'object' ? product.rating.rate : (product.rating || 0)}
                                                style={{ fontSize: '14px' }}
                                            />
                                            <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                                                ({typeof product.rating === 'object' ?
                                                    `${product.rating.rate.toFixed(1)} - ${product.rating.count}` :
                                                    (product.rating || 0).toFixed(1)
                                                })
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
                                            {truncateDescription(product.description)}
                                        </Paragraph>

                                        <div style={{
                                            marginTop: 'auto',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                                ₹ {product.price.toFixed(2)}
                                            </Text>
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
                                                    <Spin size="small" />
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
                        ))}
                    </Row>

                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <Divider
                            style={{ borderColor: '#52c41a' }}
                        >
                            <Space>
                                <StarOutlined style={{ color: '#8c8c8c' }} />
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                     New Dishes, Same Delicious Promise!
                                </Text>
                            </Space>
                        </Divider>
                    </div>
                </Col>
            </Row>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <InfoCircleOutlined style={{ color: '#52c41a' }} />
                        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Product Details</span>
                    </div>
                }
                open={showProductModal}
                onCancel={() => setShowProductModal(false)}
                footer={null}
                width={800}
                closeIcon={<CloseOutlined style={{ color: '#52c41a' }} />}
                style={{ maxHeight: 'none', top: 50 }}
                bodyStyle={{ maxHeight: 'none', overflow: 'visible' }}
            >
                {selectedProduct && !loadingProductDetails ? (
                    <div style={{ overflow: 'visible' }}>
                        <Row gutter={[24, 24]}>
                            <Col md={10} xs={24}>
                                <div style={{ textAlign: 'center' }}>
                                    <Image
                                        src={selectedProduct.image}
                                        alt={selectedProduct.name}
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
                                            {selectedProduct.name || selectedProduct.title}
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
                                            <Rate
                                                disabled
                                                allowHalf
                                                value={typeof selectedProduct.rating === 'object' ? selectedProduct.rating.rate : (selectedProduct.rating || 0)}
                                                style={{ fontSize: '14px' }}
                                            />
                                            <Text strong style={{ marginLeft: '8px', fontSize: '14px' }}>
                                                {typeof selectedProduct.rating === 'object' ?
                                                    selectedProduct.rating.rate.toFixed(1) :
                                                    (selectedProduct.rating || 0).toFixed(1)
                                                }
                                            </Text>
                                            {typeof selectedProduct.rating === 'object' && selectedProduct.rating.count && (
                                                <Text type="secondary" style={{ marginLeft: '8px' }}>
                                                    ({selectedProduct.rating.count} reviews)
                                                </Text>
                                            )}
                                        </div>

                                        <div>
                                            <Text strong style={{ color: '#52c41a', marginRight: '12px' }}>Price:</Text>
                                            <Text strong style={{ fontSize: '16px' }}>
                                                ₹ {selectedProduct.price.toFixed(2)}
                                            </Text>
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
                                                    <Spin size="small" />
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
                                                background: '#f5f5f5',
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
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading product details...</Paragraph>
                    </div>
                )}
            </Modal>

            <AuthModal
                show={showAuthModal}
                onHide={() => setShowAuthModal(false)}
                isLoginMode={isLoginMode}
                onToggleMode={() => setIsLoginMode(prev => !prev)}
            />
        </div>
    );
};

export default NewArrivals;