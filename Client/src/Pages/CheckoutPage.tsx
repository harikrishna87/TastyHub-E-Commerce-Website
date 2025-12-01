import React, { useState, useEffect, useContext, useRef } from 'react';
import { Card, Typography, Row, Col, Button, Form, Input, Space, message, Spin, Divider } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const { Title, Text } = Typography;

interface CartItem {
    _id: string;
    name: string;
    image: string;
    discount_price: number;
    original_price: number;
    quantity: number;
}

interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface ShippingAddress {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
    handler: (response: RazorpayResponse) => void;
    modal: {
        ondismiss: () => void;
    };
}

const CheckoutPage: React.FC = () => {
    const [personalForm] = Form.useForm();
    const [shippingForm] = Form.useForm();
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [submittingRazorpay, setSubmittingRazorpay] = useState<boolean>(false);
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({});
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
    const deliveryCharge = 30;
    const topRef = useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (!auth?.isAuthenticated) {
            navigate('/');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        fetchUserProfile();
        fetchCartItems();

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [auth?.isAuthenticated]);

    useEffect(() => {
        scrollToTop();
    }, [currentStep]);

    const fetchUserProfile = async (): Promise<void> => {
        if (!auth?.token) return;

        try {
            const response = await fetch(`${backendUrl}/api/auth/getme`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
            });

            if (!response.ok) return;

            const data = await response.json();
            if (data.success) {
                personalForm.setFieldsValue({
                    firstName: data.user.name?.split(' ')[0] || '',
                    lastName: data.user.name?.split(' ').slice(1).join(' ') || '',
                    email: data.user.email || '',
                    phone: data.user.shippingAddress?.phone || '',
                });

                if (data.user.shippingAddress) {
                    setShippingAddress(data.user.shippingAddress);
                    shippingForm.setFieldsValue({
                        fullName: data.user.shippingAddress.fullName || '',
                        phone: data.user.shippingAddress.phone || '',
                        addressLine1: data.user.shippingAddress.addressLine1 || '',
                        addressLine2: data.user.shippingAddress.addressLine2 || '',
                        city: data.user.shippingAddress.city || '',
                        state: data.user.shippingAddress.state || '',
                        postalCode: data.user.shippingAddress.postalCode || '',
                        country: data.user.shippingAddress.country || '',
                    });
                }
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        }
    };

    const fetchCartItems = async (): Promise<void> => {
        if (!auth?.token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/cart/get_cart_items`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (res.status === 401) {
                if (auth?.logout) auth.logout();
                navigate('/');
                return;
            }

            const data = await res.json();
            if (data && data.Cart_Items) {
                setCartItems(data.Cart_Items);
                if (data.Cart_Items.length === 0) {
                    messageApi.warning('Your cart is empty!');
                    setTimeout(() => navigate('/menu-items'), 2000);
                }
            }
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
            messageApi.error('Failed to load cart items');
        } finally {
            setLoading(false);
        }
    };

    const handlePersonalInfoNext = (values: PersonalInfo): void => {
        setPersonalInfo(values);
        setCurrentStep(1);
    };

    const handleShippingNext = (values: ShippingAddress): void => {
        setShippingAddress(values);
        setCurrentStep(2);
    };

    const handleRazorpayPayment = async (): Promise<void> => {
        if (!personalInfo || !shippingAddress || !selectedPayment) return;
        setSubmittingRazorpay(true);

        try {
            const profileResponse = await fetch(`${backendUrl}/api/auth/updateprofile`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth?.token}`,
                },
                body: JSON.stringify({ shippingAddress }),
            });

            const profileData = await profileResponse.json();
            if (!profileData.success) {
                throw new Error('Failed to update shipping address');
            }

            const { data: keyData } = await axios.get<{ key: string }>(`${backendUrl}/razorpay/getkey`);
            const { key } = keyData;

            const numericTotalPrice = cartItems.reduce(
                (sum, item) => sum + item.discount_price * item.quantity,
                0
            );
            const freeDeliveryApplied = numericTotalPrice >= 200;
            const finalTotal = freeDeliveryApplied
                ? numericTotalPrice
                : numericTotalPrice + deliveryCharge;

            const { data: orderData } = await axios.post<{ order: { id: string; amount: number } }>(
                `${backendUrl}/razorpay/payment/process`,
                { amount: finalTotal },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            const { order } = orderData;

            const options: RazorpayOptions = {
                key,
                amount: order.amount,
                currency: 'INR',
                name: 'FoodDelights',
                description: 'Food Order Payment',
                order_id: order.id,
                prefill: {
                    name: `${personalInfo.firstName} ${personalInfo.lastName}`,
                    email: personalInfo.email,
                    contact: personalInfo.phone,
                },
                theme: { color: '#52c41a' },
                handler: async function (response: RazorpayResponse): Promise<void> {
                    if (response.razorpay_payment_id) {
                        try {
                            const orderResponse = await axios.post(
                                `${backendUrl}/api/orders`,
                                {
                                    shippingAddress,
                                    paymentMethod: 'online',
                                    paymentId: response.razorpay_payment_id,
                                },
                                {
                                    headers: { Authorization: `Bearer ${auth?.token}` },
                                    withCredentials: true,
                                }
                            );

                            if (orderResponse.data.success) {
                                const orderId = orderResponse.data.order._id;

                                await fetch(`${backendUrl}/api/cart/clear_cart`, {
                                    method: 'DELETE',
                                    headers: {
                                        Authorization: `Bearer ${auth?.token}`,
                                        'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                });

                                messageApi.success('Payment successful! Order placed.');
                                navigate(`/ordersuccess/${orderId}`);
                            }
                        } catch (error) {
                            console.error('Order creation error:', error);
                            messageApi.error(
                                'Payment successful but order creation failed. Please contact support.'
                            );
                        }
                    }
                },
                modal: {
                    ondismiss: function (): void {
                        setSubmittingRazorpay(false);
                        messageApi.info('Payment cancelled');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401 && auth?.logout) {
                auth.logout();
                navigate('/');
            }
            messageApi.error({
                content:
                    (axios.isAxiosError(error) && error.response?.data?.message) ||
                    (error as Error).message ||
                    'Payment failed',
                duration: 3,
            });
            setSubmittingRazorpay(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                backgroundColor: '#f8f9fa'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    const numericTotalPrice = cartItems.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
    const freeDeliveryApplied = numericTotalPrice >= 200;
    const finalTotal = freeDeliveryApplied ? numericTotalPrice : numericTotalPrice + deliveryCharge;

    const OrderSummaryCard = () => (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', color: '#52c41a' }}>
                    <ShoppingCartOutlined style={{ marginRight: 8, fontSize: 20 }} />
                    <span style={{ fontSize: '18px', fontWeight: 600 }}>Order Summary</span>
                </div>
            }
            style={{
                borderRadius: '12px',
                position: window.innerWidth >= 992 ? 'sticky' : 'relative',
                top: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                marginTop:"15px" 
            }}
            bodyStyle={{ padding: '24px'}}
        >
            <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                {cartItems.map((item) => (
                    <div key={item._id} style={{
                        display: 'flex',
                        marginBottom: 20,
                        paddingBottom: 20,
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            flexShrink: 0,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #f0f0f0'
                        }}>
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                        <div style={{ marginLeft: 16, flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Text strong style={{ fontSize: '15px', lineHeight: 1.2, marginRight: 8 }}>
                                    {item.name}
                                </Text>
                                <Text strong style={{ color: '#52c41a', fontSize: '15px', whiteSpace: 'nowrap' }}>
                                    ₹{(item.discount_price * item.quantity).toFixed(2)}
                                </Text>
                            </div>
                            <div style={{ marginTop: 8, color: '#666', fontSize: '13px' }}>
                                Qty: {item.quantity}
                            </div>
                            <div style={{ marginTop: 4 }}>
                                {item.original_price > item.discount_price && (
                                    <Text delete type="secondary" style={{ marginRight: 8, fontSize: '13px' }}>
                                        ₹{item.original_price}
                                    </Text>
                                )}
                                <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                                    ₹{item.discount_price}
                                </Text>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '20px' }}>
                {(() => {
                    const totalSaved = cartItems.reduce((sum, item) => {
                        const itemSavings = (item.original_price - item.discount_price) * item.quantity;
                        return sum + itemSavings;
                    }, 0);

                    return totalSaved > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#52c41a' }}>
                            <Text style={{ color: '#52c41a', fontSize: '15px' }}>Total Amount You Saved 🎉 Today</Text>
                            <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>₹{totalSaved.toFixed(2)}</Text>
                        </div>
                    ) : null;
                })()}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Subtotal</Text>
                    <Text strong>₹{numericTotalPrice.toFixed(2)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Text style={{ fontSize: '15px' }}>Delivery Charges</Text>
                    {freeDeliveryApplied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Text delete style={{ color: '#999', fontSize: '14px' }}>₹{deliveryCharge}</Text>
                            <Text style={{ color: '#52c41a', fontSize: '15px' }}>Free 🚚</Text>
                        </div>
                    ) : (
                        <Text style={{ fontSize: '15px' }}>₹{deliveryCharge}</Text>
                    )}
                </div>
                <Divider style={{ margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: '18px', fontWeight: 600 }}>Total Amount</Text>
                    <Text style={{ fontSize: '24px', fontWeight: 700, color: '#52c41a' }}>
                        ₹{finalTotal.toFixed(2)}
                    </Text>
                </div>
            </div>
        </Card>
    );

    return (
        <div ref={topRef} style={{
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            padding: '24px 16px'
        }}>
            {contextHolder}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/menu-items')}
                    style={{
                        color: '#52c41a',
                        fontSize: '16px',
                        marginBottom: '24px',
                        padding: '4px 8px'
                    }}
                >
                    Back to Shop
                </Button>

                <div style={{ marginBottom: '50px', padding: '0 12px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        maxWidth: '700px',
                        margin: '0 auto',
                        position: 'relative'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(6px, 1vw, 8px)',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div style={{
                                width: 'clamp(32px, 6vw, 40px)',
                                height: 'clamp(32px, 6vw, 40px)',
                                borderRadius: '50%',
                                backgroundColor: currentStep >= 0 ? '#52c41a' : '#e0e0e0',
                                color: currentStep >= 0 ? '#fff' : '#999',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'clamp(14px, 2.5vw, 16px)',
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}>
                                1
                            </div>
                            <span style={{
                                color: currentStep >= 0 ? '#52c41a' : '#999',
                                fontSize: 'clamp(12px, 2vw, 14px)',
                                fontWeight: currentStep >= 0 ? '500' : '400',
                                whiteSpace: 'nowrap'
                            }}>
                                Personal Info
                            </span>
                        </div>

                        <div style={{
                            flex: 1,
                            height: '2px',
                            backgroundColor: '#e0e0e0',
                            margin: '0 clamp(6px, 1.5vw, 12px)',
                            position: 'relative',
                            minWidth: 'clamp(15px, 4vw, 30px)'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                backgroundColor: '#52c41a',
                                width: currentStep >= 1 ? '100%' : '0%',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(6px, 1vw, 8px)',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div style={{
                                width: 'clamp(32px, 6vw, 40px)',
                                height: 'clamp(32px, 6vw, 40px)',
                                borderRadius: '50%',
                                backgroundColor: currentStep >= 1 ? '#52c41a' : '#e0e0e0',
                                color: currentStep >= 1 ? '#fff' : '#999',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'clamp(14px, 2.5vw, 16px)',
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}>
                                2
                            </div>
                            <span style={{
                                color: currentStep >= 1 ? '#52c41a' : '#999',
                                fontSize: 'clamp(12px, 2vw, 14px)',
                                fontWeight: currentStep >= 1 ? '500' : '400',
                                whiteSpace: 'nowrap'
                            }}>
                                Shipping
                            </span>
                        </div>

                        <div style={{
                            flex: 1,
                            height: '2px',
                            backgroundColor: '#e0e0e0',
                            margin: '0 clamp(6px, 1.5vw, 12px)',
                            position: 'relative',
                            minWidth: 'clamp(15px, 4vw, 30px)'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                backgroundColor: '#52c41a',
                                width: currentStep >= 2 ? '100%' : '0%',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(6px, 1vw, 8px)',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div style={{
                                width: 'clamp(32px, 6vw, 40px)',
                                height: 'clamp(32px, 6vw, 40px)',
                                borderRadius: '50%',
                                backgroundColor: currentStep >= 2 ? '#52c41a' : '#e0e0e0',
                                color: currentStep >= 2 ? '#fff' : '#999',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'clamp(14px, 2.5vw, 16px)',
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}>
                                3
                            </div>
                            <span style={{
                                color: currentStep >= 2 ? '#52c41a' : '#999',
                                fontSize: 'clamp(12px, 2vw, 14px)',
                                fontWeight: currentStep >= 2 ? '500' : '400',
                                whiteSpace: 'nowrap'
                            }}>
                                Payment
                            </span>
                        </div>
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16} style={{ order: window.innerWidth < 992 ? 2 : 1 }}>
                        {currentStep === 0 && (
                            <Card
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    marginTop:"15px" 
                                }}
                                bodyStyle={{ padding: '32px' }}
                            >
                                <Title level={3} style={{ marginBottom: '24px', color: '#52c41a' }}>
                                    Personal Information
                                </Title>
                                <Form
                                    form={personalForm}
                                    layout="vertical"
                                    onFinish={handlePersonalInfoNext}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="firstName"
                                                label="First Name"
                                                rules={[{ required: true, message: 'Please enter first name' }]}
                                            >
                                                <Input size="large" placeholder="Enter first name" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="lastName"
                                                label="Last Name"
                                                rules={[{ required: true, message: 'Please enter last name' }]}
                                            >
                                                <Input size="large" placeholder="Enter last name" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="email"
                                                label="Email Address"
                                                rules={[
                                                    { required: true, message: 'Please enter email' },
                                                    { type: 'email', message: 'Please enter valid email' }
                                                ]}
                                            >
                                                <Input size="large" placeholder="Enter email address" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="phone"
                                                label="Phone Number"
                                                rules={[
                                                    { required: true, message: 'Please enter phone number' },
                                                    { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter valid phone number' }
                                                ]}
                                            >
                                                <Input size="large" placeholder="Enter phone number" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        htmlType="submit"
                                        style={{
                                            backgroundColor: '#52c41a',
                                            borderColor: '#52c41a',
                                            height: '50px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            marginTop: '16px'
                                        }}
                                    >
                                        Next Step
                                    </Button>
                                </Form>
                            </Card>
                        )}

                        {currentStep === 1 && (
                            <Card
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                                bodyStyle={{ padding: '32px' }}
                            >
                                <Title level={3} style={{ marginBottom: '24px', color: '#52c41a' }}>
                                    Shipping Address
                                </Title>
                                <Form
                                    form={shippingForm}
                                    layout="vertical"
                                    onFinish={handleShippingNext}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="fullName"
                                                label="Full Name"
                                                rules={[{ required: true, message: 'Please enter full name' }]}
                                            >
                                                <Input size="large" placeholder="Recipient's full name" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="phone"
                                                label="Contact Phone"
                                                rules={[
                                                    { required: true, message: 'Please enter phone number' },
                                                    { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter valid phone number' }
                                                ]}
                                            >
                                                <Input size="large" placeholder="Recipient's phone" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="addressLine1"
                                        label="Address Line 1"
                                        rules={[{ required: true, message: 'Please enter address' }]}
                                    >
                                        <Input size="large" placeholder="Street address, P.O. box, etc." style={{ borderRadius: '8px' }} />
                                    </Form.Item>

                                    <Form.Item
                                        name="addressLine2"
                                        label="Address Line 2 (Optional)"
                                    >
                                        <Input size="large" placeholder="Apartment, suite, unit, etc." style={{ borderRadius: '8px' }} />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="city"
                                                label="City"
                                                rules={[{ required: true, message: 'Please enter city' }]}
                                            >
                                                <Input size="large" placeholder="City" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="state"
                                                label="State / Province"
                                                rules={[{ required: true, message: 'Please enter state' }]}
                                            >
                                                <Input size="large" placeholder="State" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="postalCode"
                                                label="Postal / Zip Code"
                                                rules={[{ required: true, message: 'Please enter postal code' }]}
                                            >
                                                <Input size="large" placeholder="Postal code" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="country"
                                                label="Country"
                                                rules={[{ required: true, message: 'Please enter country' }]}
                                            >
                                                <Input size="large" placeholder="Country" style={{ borderRadius: '8px' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16} style={{ marginTop: '16px' }}>
                                        <Col xs={24} sm={12}>
                                            <Button
                                                size="large"
                                                block
                                                onClick={() => setCurrentStep(0)}
                                                style={{
                                                    height: '50px',
                                                    fontSize: '16px',
                                                    borderRadius: '8px',
                                                    marginBottom: '10px'
                                                }}
                                            >
                                                Back
                                            </Button>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Button
                                                type="primary"
                                                size="large"
                                                block
                                                htmlType="submit"
                                                style={{
                                                    backgroundColor: '#52c41a',
                                                    borderColor: '#52c41a',
                                                    height: '50px',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    borderRadius: '8px',
                                                    marginBottom: '10px'
                                                }}
                                            >
                                                Proceed to Payment
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card>
                        )}

                        {currentStep === 2 && (
                            <Card
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                                bodyStyle={{ padding: '32px' }}
                            >
                                <Title level={3} style={{ marginBottom: '24px', color: '#52c41a' }}>
                                    Payment Method
                                </Title>

                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <div style={{
                                        padding: '20px',
                                        background: '#f6ffed',
                                        border: '1px solid #b7eb8f',
                                        borderRadius: '8px',
                                        marginBottom: '16px'
                                    }}>
                                        <Text strong style={{ color: '#389e0d', fontSize: '16px' }}>
                                            Choose Your Payment Method
                                        </Text>
                                        <p style={{ color: '#389e0d', margin: '8px 0 0 0' }}>
                                            Pay securely using your preferred payment gateway
                                        </p>
                                    </div>

                                    <Row gutter={[16, 16]}>
                                            <Button
                                                size="large"
                                                onClick={() => setSelectedPayment(selectedPayment === 'razorpay' ? null : 'razorpay')}
                                                style={{
                                                    height: '60px',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '12px',
                                                    border: selectedPayment === 'razorpay' ? '2px solid #52c41a' : '2px solid #e8e8e8',
                                                    background: '#fff',
                                                    transition: 'all 0.3s',
                                                    position: 'relative'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedPayment !== 'razorpay') {
                                                        e.currentTarget.style.borderColor = '#528FF0';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedPayment !== 'razorpay') {
                                                        e.currentTarget.style.borderColor = '#e8e8e8';
                                                    }
                                                }}
                                            >
                                                {selectedPayment === 'razorpay' && (
                                                    <CheckCircleFilled 
                                                        style={{
                                                            position: 'absolute',
                                                            top: '8px',
                                                            right: '8px',
                                                            fontSize: '24px',
                                                            color: '#52c41a'
                                                        }}
                                                    />
                                                )}
                                                <img
                                                    src="https://cdn.iconscout.com/icon/free/png-512/free-razorpay-logo-icon-svg-download-png-1399875.png?f=webp&w=512"
                                                    alt="Razorpay"
                                                    style={{ height: '100px' }}
                                                />
                                            </Button>
                                    </Row>

                                    {selectedPayment && (
                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            onClick={handleRazorpayPayment}
                                            loading={submittingRazorpay}
                                            disabled={submittingRazorpay}
                                            style={{
                                                backgroundColor: '#52c41a',
                                                borderColor: '#52c41a',
                                                height: '60px',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                borderRadius: '12px',
                                                marginTop: '16px',
                                                width: '100%'
                                            }}
                                        >
                                            Proceed to Payment
                                        </Button>
                                    )}

                                    <Button
                                        size="large"
                                        block
                                        onClick={() => setCurrentStep(1)}
                                        style={{
                                            height: '60px',
                                            fontSize: '16px',
                                            borderRadius: '12px',
                                            width: '100%',
                                            border: '2px solid #d9d9d9'
                                        }}
                                    >
                                        Back to Shipping
                                    </Button>
                                </Space>
                            </Card>
                        )}
                    </Col>

                    <Col xs={24} lg={8} style={{ order: window.innerWidth < 992 ? 1 : 2 }}>
                        <OrderSummaryCard />
                    </Col>
                </Row>
            </div>

            <style>{`
        .ant-steps-item-finish .ant-steps-item-icon {
          border-color: #52c41a !important;
          background-color: #f6ffed !important;
        }
        .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
          color: #52c41a !important;
        }
        .ant-steps-item-process .ant-steps-item-icon {
          background-color: #52c41a !important;
          border-color: #52c41a !important;
        }
        .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
          background-color: #52c41a !important;
        }
        .ant-btn-primary:hover {
          background-color: #73d13d !important;
          border-color: #73d13d !important;
        }
        .ant-input:hover, .ant-input:focus {
          border-color: #52c41a !important;
          box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
        }
        @media (max-width: 768px) {
          .ant-steps-item-title {
            font-size: 12px !important;
          }
        }
      `}</style>
        </div>
    );
};

export default CheckoutPage;