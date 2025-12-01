import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    Button,
    Input,
    Modal,
    InputNumber,
    Select,
    Card,
    Row,
    Col,
    Space,
    Image,
    Rate,
    Popconfirm,
    message,
    Tag,
    Typography,
    Spin,
    Statistic,
    Flex,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined,
    InfoCircleOutlined,
    StarOutlined,
    TagsOutlined,
    UnorderedListOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface Rating {
    rate: number;
    count: number;
}

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string;
    rating: Rating;
    ingredients: string[];
    calories: number;
    ageRecommendation: string;
}

interface Category {
    name: string;
    count: number;
}

interface FormData {
    title: string;
    description: string;
    price: number;
    category: string;
    image: string;
    rate: number;
    count: number;
    ingredients: string[];
    calories: number;
    ageRecommendation: string;
}

interface FormErrors {
    title?: string;
    description?: string;
    price?: string;
    category?: string;
    image?: string;
    rate?: string;
    count?: string;
    ingredients?: string;
    calories?: string;
    ageRecommendation?: string;
}

interface ApiResponse {
    products?: Product[];
    data?: Product[];
    result?: Product[];
    items?: Product[];
}

const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
            return 'Server error. Please try again later.';
        } else if (error.response?.status === 404) {
            return 'Resource not found. It may have been deleted.';
        } else if (error.response?.status === 400) {
            return 'Invalid data. Please check all fields.';
        } else if (error.response?.data?.message) {
            return error.response.data.message;
        }
    } else if (error instanceof Error) {
        if (error.message?.includes('Network Error')) {
            return 'Network error. Please check your connection and try again.';
        }
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred. Please try again.';
};

const LoadingSpinner: React.FC = () => {
    return (
        <Row justify="center" align="middle" style={{ minHeight: '60vh' }}>
            <Col>
                <Row justify="center">
                    <Col>
                        <Spin size="large" />
                    </Col>
                </Row>
                <Row justify="center" style={{ marginTop: '16px' }}>
                    <Col>
                        <Text style={{ color: '#52c41a', fontSize: '16px' }}>
                            Loading products...
                        </Text>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        rate: 0,
        count: 0,
        ingredients: [''],
        calories: 0,
        ageRecommendation: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const pageSize: number = 10;

    const [messageApi, contextHolder] = message.useMessage();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.title.trim()) {
            errors.title = 'Product title is required';
        }

        if (!formData.description.trim()) {
            errors.description = 'Product description is required';
        } else if (formData.description.length > 500) {
            errors.description = 'Description must be 500 characters or less';
        }

        if (!formData.price || formData.price <= 0) {
            errors.price = 'Please enter a valid price greater than 0';
        }

        if (!formData.category) {
            errors.category = 'Please select a product category';
        }

        if (!formData.image.trim()) {
            errors.image = 'Product image URL is required';
        }

        if (!formData.rate || formData.rate < 0 || formData.rate > 5) {
            errors.rate = 'Please enter a valid rating between 0 and 5';
        }

        if (!formData.count || formData.count < 0) {
            errors.count = 'Please enter a valid rating count';
        }

        if (!formData.ingredients || formData.ingredients.length === 0 || formData.ingredients.every(ingredient => ingredient.trim() === '')) {
            errors.ingredients = 'Please add at least one ingredient';
        }

        if (!formData.calories || formData.calories < 0) {
            errors.calories = 'Please enter valid calories';
        }

        if (!formData.ageRecommendation.trim()) {
            errors.ageRecommendation = 'Age recommendation is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const fetchProducts = async (): Promise<void> => {
        try {
            setLoading(true);
            messageApi.loading({ content: 'Loading products...', key: 'loading' });

            const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
            
            const [response] = await Promise.all([
                axios.get<ApiResponse | Product[]>(`${backendUrl}/api/products/getallproducts`),
                minLoadingTime
            ]);

            let fetchedProducts: Product[] = [];

            if (Array.isArray(response.data)) {
                fetchedProducts = response.data;
            } else if (response.data && typeof response.data === 'object') {
                const apiResponse = response.data as ApiResponse;
                fetchedProducts = apiResponse.products || apiResponse.data || apiResponse.result || apiResponse.items || [];
            }

            if (!Array.isArray(fetchedProducts)) {
                console.error('API response is not an array:', response.data);
                messageApi.error({
                    content: 'Invalid data format received from server',
                    key: 'loading',
                    style: {
                        marginTop: '20vh',
                    },
                });
                return;
            }

            const shuffledProducts = shuffleArray(fetchedProducts);
            setProducts(shuffledProducts);
            setFilteredProducts(shuffledProducts);

            const categoryCount: { [key: string]: number } = {};
            shuffledProducts.forEach((product: Product) => {
                if (product.category) {
                    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
                }
            });

            const categoryData: Category[] = Object.entries(categoryCount).map(([name, count]) => ({
                name,
                count
            }));

            setCategories(categoryData);

            messageApi.success({
                content: `Successfully loaded ${shuffledProducts.length} products`,
                key: 'loading',
                duration: 2,
                style: {
                    marginTop: '20vh',
                },
            });

        } catch (error) {
            console.error('Error fetching products:', error);

            const errorMessage = getErrorMessage(error);
            messageApi.error({
                content: `${errorMessage}`,
                key: 'loading',
                duration: 4,
                style: {
                    marginTop: '20vh',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const shuffleTableData = () => {
        setTableLoading(true);
        setTimeout(() => {
            const shuffledFiltered = shuffleArray(filteredProducts);
            setFilteredProducts(shuffledFiltered);
            setCurrentPage(1);
            setTableLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered: Product[] = products;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter((product: Product) => product.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter((product: Product) =>
                (product.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [selectedCategory, searchTerm, products]);

    const handleCategoryClick = (categoryName: string): void => {
        setSelectedCategory(categoryName === selectedCategory ? 'all' : categoryName);
    };

    const handleAddProduct = (): void => {
        setEditingProduct(null);
        setFormData({
            title: '',
            description: '',
            price: 0,
            category: '',
            image: '',
            rate: 0,
            count: 0,
            ingredients: [''],
            calories: 0,
            ageRecommendation: ''
        });
        setFormErrors({});
        setIsModalVisible(true);
    };

    const handleEditProduct = (product: Product): void => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image,
            rate: product.rating.rate,
            count: product.rating.count,
            ingredients: product.ingredients && product.ingredients.length > 0 ? product.ingredients : [''],
            calories: product.calories,
            ageRecommendation: product.ageRecommendation
        });
        setFormErrors({});
        setIsModalVisible(true);
    };

    const handleDeleteProduct = async (productId: string): Promise<void> => {
        const loadingKey = 'deleting';
        messageApi.loading({ content: 'Deleting product...', key: loadingKey });

        try {
            await axios.delete(`${backendUrl}/api/products/deleteproduct/${productId}`);

            const updatedProducts = products.filter((p: Product) => p._id !== productId);
            setProducts(updatedProducts);

            const updatedFilteredProducts = filteredProducts.filter((p: Product) => p._id !== productId);
            setFilteredProducts(updatedFilteredProducts);

            const categoryCount: { [key: string]: number } = {};
            updatedProducts.forEach((product: Product) => {
                if (product.category) {
                    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
                }
            });

            const categoryData: Category[] = Object.entries(categoryCount).map(([name, count]) => ({
                name,
                count
            }));
            setCategories(categoryData);

            messageApi.success({
                content: 'Product deleted successfully!',
                key: loadingKey,
                duration: 3,
                style: {
                    marginTop: '20vh',
                },
            });

        } catch (error) {
            console.error('Error deleting product:', error);

            const errorMessage = getErrorMessage(error);
            messageApi.error({
                content: `${errorMessage}`,
                key: loadingKey,
                duration: 4,
                style: {
                    marginTop: '20vh',
                },
            });
        }
    };

    const handleModalOk = async (): Promise<void> => {
        if (!validateForm()) {
            return;
        }

        const productData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: formData.price,
            category: formData.category,
            image: formData.image.trim(),
            rating: {
                rate: formData.rate,
                count: formData.count
            },
            ingredients: formData.ingredients.filter(ingredient => ingredient.trim() !== ''),
            calories: formData.calories,
            ageRecommendation: formData.ageRecommendation.trim()
        };

        const loadingKey = 'saving';
        messageApi.loading({ content: editingProduct ? 'Updating product...' : 'Adding product...', key: loadingKey });

        try {
            if (editingProduct && editingProduct._id) {
                await axios.put<Product>(`${backendUrl}/api/products/updateproduct/${editingProduct._id}`, productData);

                const updatedProduct: Product = {
                    ...productData,
                    _id: editingProduct._id
                };

                const updatedProducts = products.map((p: Product) =>
                    p._id === editingProduct._id ? updatedProduct : p
                );
                setProducts(updatedProducts);

                const updatedFilteredProducts = filteredProducts.map((p: Product) =>
                    p._id === editingProduct._id ? updatedProduct : p
                );
                setFilteredProducts(updatedFilteredProducts);

                messageApi.success({
                    content: 'Product updated successfully!',
                    key: loadingKey,
                    duration: 3,
                    style: {
                        marginTop: '20vh',
                    },
                });
            } else {
                const response = await axios.post<Product>(`${backendUrl}/api/products/addproduct`, productData);
                const newProduct = response.data;

                const updatedProducts = [...products, newProduct];
                setProducts(updatedProducts);

                const categoryCount: { [key: string]: number } = {};
                updatedProducts.forEach((product: Product) => {
                    if (product.category) {
                        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
                    }
                });

                const categoryData: Category[] = Object.entries(categoryCount).map(([name, count]) => ({
                    name,
                    count
                }));
                setCategories(categoryData);

                messageApi.success({
                    content: 'Product added successfully!',
                    key: loadingKey,
                    duration: 3,
                    style: {
                        marginTop: '20vh',
                    },
                });
            }

            setIsModalVisible(false);
            setFormData({
                title: '',
                description: '',
                price: 0,
                category: '',
                image: '',
                rate: 0,
                count: 0,
                ingredients: [''],
                calories: 0,
                ageRecommendation: ''
            });
            setFormErrors({});
            setEditingProduct(null);

        } catch (error) {
            console.error('Error saving product:', error);

            const errorMessage = getErrorMessage(error);
            messageApi.error({
                content: `${errorMessage}`,
                key: loadingKey,
                duration: 4,
                style: {
                    marginTop: '20vh',
                },
            });
        }
    };

    const handleFormChange = (field: keyof FormData, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (formErrors[field]) {
            setFormErrors({ ...formErrors, [field]: undefined });
        }
    };

    const addIngredientField = () => {
        const currentIngredients = formData.ingredients || [''];
        setFormData({ ...formData, ingredients: [...currentIngredients, ''] });
    };

    const removeIngredientField = (index: number) => {
        const currentIngredients = formData.ingredients || [''];
        if (currentIngredients.length > 1) {
            const newIngredients = currentIngredients.filter((_, i) => i !== index);
            setFormData({ ...formData, ingredients: newIngredients });
        }
    };

    const updateIngredient = (index: number, value: string) => {
        const currentIngredients = formData.ingredients || [''];
        const newIngredients = [...currentIngredients];
        newIngredients[index] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    if (loading) {
        return (
            <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
                <LoadingSpinner />
            </div>
        );
    }

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price || 0), 0);
    const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;
    const averageRating = totalProducts > 0 ? products.reduce((sum, product) => sum + (product.rating?.rate || 0), 0) / totalProducts : 0;

    const categoryColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    const createResponsivePieChart = () => {
        if (categories.length === 0) return null;
        
        const total = categories.reduce((sum, cat) => sum + cat.count, 0);
        let currentAngle = 0;
        
        const radius = 100;
        const centerX = 100;
        const centerY = 100;
        const svgSize = 200;
        
        return (
            <svg 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                style={{ maxWidth: '200px', maxHeight: '200px' }}
                preserveAspectRatio="xMidYMid meet"
            >
                <circle 
                    cx={centerX} 
                    cy={centerY} 
                    r="40" 
                    fill="white" 
                    stroke="#f0f0f0" 
                    strokeWidth="2" 
                />
                {categories.map((category, index) => {
                    const percentage = (category.count / total) * 100;
                    const angle = (category.count / total) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    
                    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                    
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');
                    
                    const labelAngle = (startAngle + endAngle) / 2;
                    const labelRadius = radius * 0.65;
                    const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
                    const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);
                    
                    currentAngle += angle;
                    
                    return (
                        <g key={category.name}>
                            <path
                                d={pathData}
                                fill={categoryColors[index % categoryColors.length]}
                                stroke="white"
                                strokeWidth="2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleCategoryClick(category.name)}
                            />
                            {percentage > 5 && (
                                <text
                                    x={labelX}
                                    y={labelY + 1}
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="white"
                                    fontWeight="bold"
                                >
                                    {percentage.toFixed(1)}%
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        );
    };

    const columns: ColumnsType<Product> = [
        {
            title: <span style={{ color: "#52c41a", fontWeight: 600 }}>Image</span>,
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (image: string) => (
                <Image
                    width={50}
                    height={50}
                    src={image}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    preview={false}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+5BhMlyJFAcxBOJqhE8wQ7kKQQtKSlkZzZnZklBW1KKaUKZhJFM7MpIQ6lJTJKKJGJ6GElJvK5Z+cFklVVr6vr9e/39v3V/e8P"
                />
            ),
        },
        {
            title: <span style={{ color: "#52c41a", fontWeight: 600 }}>Name</span>,
            dataIndex: 'title',
            key: 'title',
            width: 200,
            sorter: (a: Product, b: Product) => (a.title || '').localeCompare(b.title || ''),
            render: (title: string) => (
                <Text strong style={{ color: '#262626' }}>{title}</Text>
            ),
        },
        {
            title: <span style={{ color: "#52c41a", fontWeight: 600 }}>Price</span>,
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => (
                <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                    ₹{(price || 0).toFixed(2)}
                </Text>
            ),
            sorter: (a: Product, b: Product) => (a.price || 0) - (b.price || 0),
        },
        {
            title: <span style={{ color: "#52c41a", fontWeight: 600 }}>Category</span>,
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color="cyan" style={{ border:'1px dashed' }}>{category}</Tag>
            ),
        },
        {
            title: <span style={{ color: "#52c41a", fontWeight: 600 }}>Description</span>,
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (description: string) => (
                <Text ellipsis={{ tooltip: description }} style={{ maxWidth: 200 }}>
                    {description}
                </Text>
            ),
        },
        {
            title: <span style={{ color: "#52c41a", fontWeight: 600 }}>Calories</span>,
            dataIndex: 'calories',
            key: 'calories',
            render: (calories: number) => (
                <Text style={{ color: '#ff7875' }}>
                    {calories} cal
                </Text>
            ),
        },
        {
            title: <span style={{ color: "#52c41a", fontWeight: 600 }}>Rating</span>,
            dataIndex: 'rating',
            key: 'rating',
            width: 200,
            render: (rating: Rating) => (
                <Space direction="vertical" size={0}>
                    <Rate disabled allowHalf defaultValue={rating?.rate || 0} style={{ fontSize: 14 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>({rating?.count || 0} reviews)</Text>
                </Space>
            ),
            sorter: (a: Product, b: Product) => (a.rating?.rate || 0) - (b.rating?.rate || 0),
        },
        {
            title: <span style={{ color: "#52c41a", fontWeight: 600 }}>Actions</span>,
            key: 'actions',
            width: 120,
            render: (_: any, record: Product) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditProduct(record)}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    />
                    <Popconfirm
                        title="Delete Product"
                        description="Are you sure you want to delete this product? This action cannot be undone."
                        onConfirm={() => handleDeleteProduct(record._id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        icon={<DeleteOutlined style={{ color: 'red' }} />}
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
            {contextHolder}
            
            <Title level={2} style={{ textAlign: 'center', marginBottom: 40, color: "#52c41a" }}>
                Product Management Dashboard
            </Title>

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} xl={12}>
                    <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                        <Col xs={24} sm={12}>
                            <Card 
                                style={{ 
                                    borderRadius: '12px',
                                    border: '2px dashed #b7eb8f',
                                    boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
                                    background: 'white',
                                    height: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Products</span>}
                                    value={totalProducts}
                                    valueStyle={{ 
                                        color: '#52c41a', 
                                        fontSize: '25px', 
                                        fontWeight: 700 
                                    }}
                                />
                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                                    <ShoppingCartOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                        Available products
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                        
                        <Col xs={24} sm={12}>
                            <Card 
                                style={{ 
                                    borderRadius: '12px',
                                    border: '2px dashed #b7eb8f',
                                    boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
                                    background: 'white',
                                    height: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Value</span>}
                                    value={totalValue}
                                    precision={2}
                                    prefix="₹"
                                    valueStyle={{ 
                                        color: '#52c41a', 
                                        fontSize: '25px', 
                                        fontWeight: 700 
                                    }}
                                />
                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                        <span style={{color:'#52c41a', fontSize: '16px'}}>₹ </span>Inventory value
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Card 
                                style={{ 
                                    borderRadius: '12px',
                                    border: '2px dashed #b7eb8f',
                                    boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
                                    background: 'white',
                                    height: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Average Price</span>}
                                    value={averagePrice}
                                    precision={2}
                                    prefix="₹"
                                    valueStyle={{ 
                                        color: '#52c41a', 
                                        fontSize: '25px', 
                                        fontWeight: 700 
                                    }}
                                />
                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                                    <TagsOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                        Per product
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                        
                        <Col xs={24} sm={12}>
                            <Card 
                                style={{ 
                                    borderRadius: '12px',
                                    border: '2px dashed #b7eb8f',
                                    boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
                                    background: 'white',
                                    height: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Average Rating</span>}
                                    value={averageRating}
                                    precision={1}
                                    valueStyle={{ 
                                        color: '#52c41a', 
                                        fontSize: '25px', 
                                        fontWeight: 700 
                                    }}
                                />
                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                                    <StarOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                        Customer rating
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                
                <Col xs={24} xl={12}>
                    <Card
                        style={{ 
                            borderRadius: '12px',
                            border: '2px dashed #b7eb8f',
                            boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
                            background: 'white',
                            minHeight: '296px'
                        }}
                    >
                        <Title level={4} style={{ marginBottom: '20px', color: '#52c41a'}}>
                            <AppstoreOutlined /> Category Types
                        </Title>
                        
                        {categories.length > 0 ? (
                            <>
                                <div className="mobile-categories" style={{ display: 'block' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ 
                                            width: '100%', 
                                            maxWidth: '280px',
                                            aspectRatio: '1',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {createResponsivePieChart()}
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '8px'
                                    }}>
                                        {categories.map((category, index) => (
                                            <div 
                                                key={`category-${category.name}`}
                                                style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    background: '#f9f9f9',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    border: '1px solid #e6f7ff',
                                                    minHeight: '40px'
                                                }}
                                                onClick={() => handleCategoryClick(category.name)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#e6f7ff';
                                                    e.currentTarget.style.transform = 'translateX(5px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#f9f9f9';
                                                    e.currentTarget.style.transform = 'translateX(0px)';
                                                }}
                                            >
                                                <div 
                                                    style={{ 
                                                        width: '12px', 
                                                        height: '12px', 
                                                        backgroundColor: categoryColors[index % categoryColors.length],
                                                        borderRadius: '50%',
                                                        marginRight: '12px',
                                                        border: '2px solid white',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                        flexShrink: 0
                                                    }} 
                                                />
                                                <Text strong style={{ color: '#262626', fontSize: '14px', flex: 1 }}>
                                                    {category.name}
                                                </Text>
                                                <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'bold' }}>
                                                    {category.count}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="desktop-categories" style={{ display: 'none' }}>
                                    <Row gutter={[24, 24]}>
                                        <Col span={10}>
                                            <div style={{ 
                                                height: '200px', 
                                                display: 'flex', 
                                                justifyContent: 'center', 
                                                alignItems: 'center' 
                                            }}>
                                                {createResponsivePieChart()}
                                            </div>
                                        </Col>
                                        <Col span={14}>
                                            <div style={{ 
                                                padding: '10px 0', 
                                                height: '200px', 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                justifyContent: 'center'
                                            }}>
                                                {categories.map((category, index) => (
                                                    <div 
                                                        key={`category-${category.name}`}
                                                        style={{ 
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '6px 12px',
                                                            marginBottom: '4px',
                                                            borderRadius: '6px',
                                                            background: '#f9f9f9',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            border: '1px solid #e6f7ff'
                                                        }}
                                                        onClick={() => handleCategoryClick(category.name)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#e6f7ff';
                                                            e.currentTarget.style.transform = 'translateX(5px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#f9f9f9';
                                                            e.currentTarget.style.transform = 'translateX(0px)';
                                                        }}
                                                    >
                                                        <div 
                                                            style={{ 
                                                                width: '12px', 
                                                                height: '12px', 
                                                                backgroundColor: categoryColors[index % categoryColors.length],
                                                                borderRadius: '50%',
                                                                marginRight: '12px',
                                                                border: '2px solid white',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                flexShrink: 0
                                                            }} 
                                                        />
                                                        <Text strong style={{ color: '#262626', fontSize: '14px', flex: 1 }}>
                                                            {category.name}
                                                        </Text>
                                                        <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'bold' }}>
                                                            {category.count}
                                                        </Text>
                                                    </div>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                color: '#8c8c8c',
                                padding: '40px 20px',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <AppstoreOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                <Text>No categories available</Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Flex justify='space-between' align='center' wrap gap={10}>
                        <Space>
                            <UnorderedListOutlined style={{ color: '#52c41a' }} />
                            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Product Management</span>
                        </Space>
                    </Flex>
                }
                style={{ 
                    borderRadius: '12px',
                    border: '2px dashed #b7eb8f',
                    boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
                    background: 'white'
                }}
            >
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: "10px", flexWrap: 'wrap' }}>
                    <Search
                        placeholder="Search products..."
                        allowClear
                        enterButton={<Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                            <SearchOutlined />
                        </Button>}
                        size="large"
                        style={{ width: 300 }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                    <Space>
                        <Button
                            type="default"
                            onClick={shuffleTableData}
                            size="large"
                            style={{ borderColor: '#52c41a', color: '#52c41a', borderRadius: '8px' }}
                        >
                            Shuffle
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={handleAddProduct}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', borderRadius: '8px' }}
                        >
                            Add Product
                        </Button>
                    </Space>
                </div>
                {filteredProducts.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px',
                        background: '#f6ffed',
                        borderRadius: '12px',
                        border: '1px dashed #d9f7be'
                    }}>
                        <InfoCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
                        <Title level={4} style={{ color: '#52c41a', margin: 0 }}>No products found</Title>
                        <Text style={{ color: '#8c8c8c' }}>Products will appear here once you add them to your inventory</Text>
                    </div>
                ) : (
                    <Spin spinning={tableLoading}>
                        <Table
                            columns={columns}
                            dataSource={filteredProducts}
                            rowKey="_id"
                            scroll={{ x: 'max-content' }}
                            pagination={{
                                current: currentPage,
                                pageSize: pageSize,
                                total: filteredProducts.length,
                                onChange: (page: number) => setCurrentPage(page),
                                showSizeChanger: false,
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
                            }}
                            rowClassName={(_, index) => 
                                index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                            }
                        />
                    </Spin>
                )}
            </Card>

            <Modal
                title={
                    <span style={{ color: '#52c41a' }}>
                        {editingProduct ? "Update Product" : "Add New Product"}
                    </span>
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    setFormData({
                        title: '',
                        description: '',
                        price: 0,
                        category: '',
                        image: '',
                        rate: 0,
                        count: 0,
                        ingredients: [''],
                        calories: 0,
                        ageRecommendation: ''
                    });
                    setFormErrors({});
                }}
                style={{ color: "#52c41a" }}
                width={800}
                okText={editingProduct ? "Update" : "Add"}
                okButtonProps={{
                    style: { backgroundColor: '#52c41a', borderColor: '#52c41a' }
                }}
            >
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Product Title *</label>
                        <Input
                            placeholder="Enter product title"
                            value={formData.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('title', e.target.value)}
                            status={formErrors.title ? 'error' : ''}
                        />
                        {formErrors.title && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                {formErrors.title}
                            </Text>
                        )}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Description (Max 500 characters) *</label>
                        <Input.TextArea
                            rows={5}
                            placeholder="Enter product description"
                            showCount
                            maxLength={500}
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFormChange('description', e.target.value)}
                            status={formErrors.description ? 'error' : ''}
                        />
                        {formErrors.description && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                {formErrors.description}
                            </Text>
                        )}
                    </div>

                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Price (₹) *</label>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    step={0.01}
                                    placeholder="295.00"
                                    value={formData.price}
                                    onChange={(value: number | null) => handleFormChange('price', value || 0)}
                                    status={formErrors.price ? 'error' : ''}
                                />
                                {formErrors.price && (
                                    <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                        {formErrors.price}
                                    </Text>
                                )}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Category *</label>
                                <Select
                                    placeholder="Select category"
                                    style={{ width: '100%' }}
                                    value={formData.category}
                                    onChange={(value: string) => handleFormChange('category', value)}
                                    status={formErrors.category ? 'error' : ''}
                                >
                                    <Option value="NonVeg">NonVeg</Option>
                                    <Option value="Veg">Veg</Option>
                                    <Option value="Desserts">Desserts</Option>
                                    <Option value="IceCream">IceCream</Option>
                                    <Option value="Fruit Juice">Fruit Juice</Option>
                                    <Option value="Pizzas">Pizzas</Option>
                                </Select>
                                {formErrors.category && (
                                    <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                        {formErrors.category}
                                    </Text>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Image URL *</label>
                        <Input
                            placeholder="https://example.com/image.jpg"
                            value={formData.image}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('image', e.target.value)}
                            status={formErrors.image ? 'error' : ''}
                        />
                        {formErrors.image && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                {formErrors.image}
                            </Text>
                        )}
                    </div>

                    <Row gutter={16}>
                        <Col span={8}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Rating *</label>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={5}
                                    step={0.5}
                                    placeholder="4.5"
                                    value={formData.rate}
                                    onChange={(value: number | null) => handleFormChange('rate', value || 0)}
                                    status={formErrors.rate ? 'error' : ''}
                                />
                                {formErrors.rate && (
                                    <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                        {formErrors.rate}
                                    </Text>
                                )}
                            </div>
                        </Col>
                        <Col span={8}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Rating Count *</label>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="400"
                                    value={formData.count}
                                    onChange={(value: number | null) => handleFormChange('count', value || 0)}
                                    status={formErrors.count ? 'error' : ''}
                                />
                                {formErrors.count && (
                                    <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                        {formErrors.count}
                                    </Text>
                                )}
                            </div>
                        </Col>
                        <Col span={8}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Calories *</label>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="485"
                                    value={formData.calories}
                                    onChange={(value: number | null) => handleFormChange('calories', value || 0)}
                                    status={formErrors.calories ? 'error' : ''}
                                />
                                {formErrors.calories && (
                                    <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                        {formErrors.calories}
                                    </Text>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Age Recommendation *</label>
                        <Input
                            placeholder="e.g., Suitable for all ages, Kids love the mild spices, adults..."
                            value={formData.ageRecommendation}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('ageRecommendation', e.target.value)}
                            status={formErrors.ageRecommendation ? 'error' : ''}
                        />
                        {formErrors.ageRecommendation && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                {formErrors.ageRecommendation}
                            </Text>
                        )}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                            Ingredients *
                        </label>
                        <div style={{ 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '6px', 
                            padding: '12px',
                            background: '#fafafa'
                        }}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                gap: '8px',
                                marginBottom: '12px'
                            }}>
                                {formData.ingredients.map((ingredient, index) => (
                                    <div key={index} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Input
                                            placeholder={`Ingredient ${index + 1}`}
                                            value={ingredient}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateIngredient(index, e.target.value)}
                                            style={{ flex: 1 }}
                                            size="small"
                                        />
                                        {formData.ingredients.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => removeIngredientField(index)}
                                                size="small"
                                                style={{ padding: '4px', minWidth: 'auto', flexShrink: 0 }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                size="small"
                                style={{ 
                                    borderColor: '#52c41a', 
                                    color: '#52c41a',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                }}
                                onClick={addIngredientField}
                            >
                                Add Ingredient
                            </Button>
                        </div>
                        {formErrors.ingredients && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                {formErrors.ingredients}
                            </Text>
                        )}
                    </div>
                </div>
            </Modal>
            
            <style>{`
                .table-row-light {
                    background-color: #fafafa;
                }
                .table-row-dark {
                    background-color: #ffffff;
                }
                .table-row-light:hover,
                .table-row-dark:hover {
                    background-color: #f6ffed !important;
                }
                
                @media (max-width: 991px) {
                    .desktop-categories {
                        display: none !important;
                    }
                    .mobile-categories {
                        display: block !important;
                    }
                }
                
                @media (min-width: 992px) {
                    .mobile-categories {
                        display: none !important;
                    }
                    .desktop-categories {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default ProductsPage;