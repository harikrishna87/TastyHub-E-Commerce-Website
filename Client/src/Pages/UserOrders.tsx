import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Table, Tag, Spin, Alert, Typography, Modal, Button, Descriptions, Space, Tooltip, Row, Col, Card, Pagination, message } from 'antd';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder, OrderDeliveryStatus } from '../types';
import { CheckCircleOutlined, TruckOutlined, ClockCircleOutlined, EyeOutlined, CalendarOutlined, ShoppingCartOutlined, UserOutlined, DownloadOutlined, GiftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

interface OrderStatusTrackerProps {
  currentStatus: 'Pending' | 'Shipped' | 'Delivered';
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
  const getStatusIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Shipped': return 1;
      case 'Delivered': return 2;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  const steps = [
    {
      key: 'Pending',
      title: 'ORDERED',
      icon: <ClockCircleOutlined />,
      index: 0
    },
    {
      key: 'Shipped', 
      title: 'ORDER SHIPPED',
      icon: <TruckOutlined />,
      index: 1
    },
    {
      key: 'Delivered',
      title: 'DELIVERED', 
      icon: <GiftOutlined />,
      index: 2
    }
  ];

  return (
    <div style={{
      padding: '30px 20px',
      backgroundColor: '#f0f9f0',
      borderRadius: '12px',
      margin: '20px 0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          height: '4px',
          backgroundColor: '#e8e8e8',
          borderRadius: '2px',
          zIndex: 1
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#52c41a',
            borderRadius: '2px',
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <div key={step.key} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#52c41a' : '#e8e8e8',
                border: isActive ? '3px solid #52c41a' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? 'white' : '#999',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 0 4px rgba(82, 196, 26, 0.2)' : 'none'
              }}>
                {isCompleted ? <CheckCircleOutlined /> : step.icon}
              </div>
              
              <span style={{
                marginTop: '12px',
                fontSize: '12px',
                fontWeight: '600',
                color: isCompleted ? '#52c41a' : '#999',
                textAlign: 'center',
                letterSpacing: '0.5px'
              }}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #d9f7be'
      }}>
        <span style={{
          color: '#52c41a',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          {currentStatus === 'Pending' && 'Your order has been placed and is being processed'}
          {currentStatus === 'Shipped' && 'Your order is on its way to you'}
          {currentStatus === 'Delivered' && 'Your order has been successfully delivered'}
        </span>
      </div>
    </div>
  );
};

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column'
    }}>
      <Spin size="large" />
      <div style={{ marginTop: 16, color: '#52c41a' }}>
        Loading your orders...
      </div>
    </div>
  );
};

const UserOrders: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<IOrder | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptContentRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 4;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [isModalVisible, selectedOrder]);

  const fetchUserOrders = useCallback(async () => {
    if (!auth?.token) {
      setError('You are not logged in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
      
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      };
      
      const [response] = await Promise.all([
        axios.get(`${backendUrl}/api/orders/myorders`, config),
        minLoadingTime
      ]);
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch your orders.');
      }
    } catch (err: any) {
      console.error('Error fetching user orders:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch your orders.';
      setError(errorMessage);
      messageApi.error({
        content: errorMessage,
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    } finally {
      setLoading(false);
    }
  }, [auth?.token, backendUrl, messageApi]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const showModal = (order: IOrder) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const showStatusModal = (order: IOrder) => {
    setSelectedOrderForStatus(order);
    setIsStatusModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
    setSelectedOrderForStatus(null);
  };

  const handleDownloadReceipt = async () => {
    if (!receiptContentRef.current || !selectedOrder) {
      messageApi.error('Could not generate receipt. Content not found.');
      return;
    }

    setIsDownloading(true);
    messageApi.loading({ content: 'Generating your receipt...', key: 'pdf-download', duration: 0 });

    try {
      const receiptElement = receiptContentRef.current;
      const canvas = await html2canvas(receiptElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Receipt-Order-${selectedOrder._id}.pdf`);

      messageApi.success({ content: 'Receipt downloaded successfully!', key: 'pdf-download', duration: 3 });

    } catch (err) {
      console.error('Error generating PDF receipt:', err);
      messageApi.error({ content: 'Failed to download receipt. Please try again.', key: 'pdf-download', duration: 3 });
    } finally {
      setIsDownloading(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusTag = (status: OrderDeliveryStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <Tag color="warning" style={{ borderRadius: '5px', padding: '2px 10px', display: 'flex', alignItems: 'center', border:'1px dashed' }}>
            <ClockCircleOutlined style={{ marginRight: '4px' }} /> Pending
          </Tag>
        );
      case 'Shipped':
        return (
          <Tag color="processing" style={{ borderRadius: '5px', padding: '2px 10px', display: 'flex', alignItems: 'center', border:'1px dashed' }}>
            <TruckOutlined style={{ marginRight: '4px' }} /> Shipped
          </Tag>
        );
      case 'Delivered':
        return (
          <Tag color="success" style={{ borderRadius: '5px', padding: '2px 10px', display: 'flex', alignItems: 'center', border:'1px dashed' }}>
            <CheckCircleOutlined style={{ marginRight: '4px' }} /> Delivered
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getStatusBadge = (order: IOrder) => {
    return (
      <Button 
        type="link" 
        size="small" 
        icon={<InfoCircleOutlined />}
        onClick={() => showStatusModal(order)}
        style={{ padding: 0 }}
      >
        Track Status
      </Button>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '40px 24px', 
        maxWidth: 1400, 
        margin: '0 auto' 
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px 24px', 
        maxWidth: 1400, 
        margin: '0 auto' 
      }}>
        {contextHolder}
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Alert
            message="Access Denied or Error!"
            description={
              <div>
                <p>{error}</p>
                <p>Please ensure you are logged in to view your orders.</p>
              </div>
            }
            type="error"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </div>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const columns = [
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Order ID</span>,
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id: string) => <Tag color='blue'>{id}</Tag>,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Customer</span>,
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user: any) => (
        <div>
          <div style={{ fontWeight: 500, color: '#262626' }}>{user?.name || 'N/A'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user?.email || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Amount</span>,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'center' as const,
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Status</span>,
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      width: 130,
      render: (_: OrderDeliveryStatus, record: IOrder) => getStatusBadge(record),
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Order Date</span>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#52c41a' }} />
          <span>{new Date(date).toLocaleDateString('en-IN')}</span>
        </Space>
      ),
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Items</span>,
      dataIndex: 'items',
      key: 'items',
      width: 150,
      render: (items: any, record: IOrder) => (
        <Button 
          type="link" 
          onClick={() => showModal(record)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: 0
          }}
        >
          <EyeOutlined style={{ marginRight: 4 }} /> 
          View Items ({items?.length || 0})
        </Button>
      ),
    },
  ];

  const totalItems = selectedOrder?.items?.length || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = selectedOrder?.items?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ 
      padding: '32px 24px', 
      maxWidth: 1250, 
      margin: '0 auto'
    }}>
      {contextHolder}
      
      <div style={{ 
        textAlign: 'center',
        marginBottom: 32
      }}>
        <Title level={1} style={{ 
          margin: 0, 
          color: '#52c41a',
          fontSize: '30px',
          fontWeight: 700
        }}>
          My Orders History
        </Title>
      </div>

      <Card
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: '20px',
            fontWeight: 600,
            color: '#52c41a'
          }}>
            <ShoppingCartOutlined style={{ marginRight: 12, fontSize: '24px', color: '#52c41a' }} />
            Your Order History
          </div>
        }
        style={{ 
          borderRadius: '16px',
          border: '2px dashed #b7eb8f',
          boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
          background: 'white'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: '#f6ffed',
            borderRadius: '12px',
            border: '1px solid #d9f7be'
          }}>
            <ShoppingCartOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#52c41a', margin: 0 }}>No orders placed yet</Title>
            <Text style={{ color: '#8c8c8c' }}>Your orders will appear here once you start shopping</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={sortedOrders}
            rowKey="_id"
            size="large"
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
            }}
          />
        )}
      </Card>

      {selectedOrder && (
        <Modal
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>Order Details - {isMobile ? selectedOrder._id.substring(0, 6) + '...' : selectedOrder._id}</span>
            </Space>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Close
            </Button>,
            <Button
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              loading={isDownloading}
              onClick={handleDownloadReceipt}
              style={{backgroundColor: "#52c41a"}}
            >
              Download Receipt
            </Button>,
          ]}
          width={isMobile ? '95%' : 800}
          style={isMobile ? { top: 15 } : { top: 15 }}
        >
          <Title level={4} style={{ marginBottom: 16, color: '#52c41a' }}>Customer Details</Title>
          <Descriptions
            bordered
            column={isMobile ? 1 : 2}
            size={isMobile ? 'small' : 'default'}
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Customer Name">
              <Space>
                <UserOutlined />
                {selectedOrder.user?.name || 'N/A'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Customer Email">
              <Tooltip title={selectedOrder.user?.email || 'N/A'}>
                <Text>{isMobile ? truncateText(selectedOrder.user?.email || 'N/A', 20) : (selectedOrder.user?.email || 'N/A')}</Text>
              </Tooltip>
            </Descriptions.Item>
          </Descriptions>

          <Title level={4} style={{ marginBottom: 16, color: '#52c41a' }}>Order Information</Title>
          <Descriptions
            bordered
            column={isMobile ? 1 : 2}
            size={isMobile ? 'small' : 'default'}
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Order ID">
              <Tooltip title={selectedOrder._id}>
                <Text code style={{color: '#52c41a'}}>{isMobile ? truncateText(selectedOrder._id, 15) : selectedOrder._id}</Text>
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Order Date">
              {new Date(selectedOrder.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                ₹{selectedOrder.totalAmount.toFixed(2)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedOrder.deliveryStatus)}
            </Descriptions.Item>
          </Descriptions>

          <Title level={4} style={{ marginBottom: 16, color: '#52c41a' }}>
            Order Items ({totalItems} items)
          </Title>
          <Row gutter={[16, 16]}>
            {currentItems.map((item, idx) => (
                <Col span={isMobile ? 24 : 12} key={startIndex + idx}>
                    <Card size="small" hoverable style={{ padding: '16px', height: '100%', border:'2px dashed #b7eb8f' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            {item.image && (
                                <div style={{ flexShrink: 0 }}>
                                    <img src={item.image} alt={item.name} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '2px solid #b7eb8f' }} onError={(e) => { (e.target as HTMLImageElement).src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+5BhMlyJFAcxBOJqhE8wQ7kKQQtKSlkZzZnZklBW1KKaUKZhJFM7MpIQ6lJTJKKJGJ6GElJvK5Z+cFklVVr6vr9e/39v3V/e8P"; }} />
                                </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{item.name || 'Unknown Item'}</Title>
                                <div style={{ marginBottom: '8px' }}><Text type="secondary" style={{ fontSize: '14px' }}>Quantity: <Text strong>{item.quantity || 0}</Text></Text></div>
                                <div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Text delete style={{ color: '#8c8c8c', fontSize: '14px' }}>₹{((item as any).original_price || 0).toFixed(2)}</Text>
                                    <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>₹{((item as any).discount_price || 0).toFixed(2)}</Text>
                                </div></div>
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
          </Row>

          {totalItems > itemsPerPage && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <Pagination current={currentPage} total={totalItems} pageSize={itemsPerPage} onChange={handlePageChange} showSizeChanger={false} showQuickJumper={false} size={isMobile ? 'small' : 'default'} />
            </div>
          )}
          <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
            <div ref={receiptContentRef} style={{
                width: '320px',
                padding: '20px',
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#000',
                backgroundColor: '#fff',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>FoodDelight</h3>
                <p style={{ margin: 0, fontSize: '11px' }}>1-23 Gourmet Street, Nellore - 524001</p>
                <p style={{ margin: 0, fontSize: '11px' }}>www.FoodDelight.com</p>
              </div>
              <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
              <p style={{ margin: '2px 0' }}><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p style={{ margin: '2px 0' }}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p style={{ margin: '2px 0' }}><strong>Customer:</strong> {selectedOrder.user.name}</p>
              <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingBottom: '5px' }}>ITEM</th>
                    <th style={{ textAlign: 'center', paddingBottom: '5px' }}>QTY</th>
                    <th style={{ textAlign: 'right', paddingBottom: '5px' }}>PRICE</th>
                    <th style={{ textAlign: 'right', paddingBottom: '5px' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={`receipt-${index}`}>
                      <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{item.name}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', verticalAlign: 'top' }}>{(item as any).discount_price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', verticalAlign: 'top' }}>{(item.quantity * (item as any).discount_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '2px 0' }}><strong>Subtotal:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}</p>
                <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: 'bold' }}><strong>TOTAL:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}</p>
              </div>
              <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <p style={{ margin: 0 }}>Thank you for your order!</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {selectedOrderForStatus && (
        <Modal
          title={
            <Space>
              <TruckOutlined />
              <span>Order Status Tracking - {isMobile ? selectedOrderForStatus._id.substring(0, 6) + '...' : selectedOrderForStatus._id}</span>
            </Space>
          }
          open={isStatusModalVisible}
          onCancel={handleStatusModalCancel}
          footer={[
            <Button key="close" onClick={handleStatusModalCancel}>
              Close
            </Button>,
          ]}
          width={isMobile ? '95%' : 600}
          style={isMobile ? { top: 150 } : { top: 175 }}
        >
          <Title level={4} style={{ marginBottom: 16, color: '#52c41a' }}>Delivery Progress</Title>
          <OrderStatusTracker currentStatus={selectedOrderForStatus.deliveryStatus} />
        </Modal>
      )}
    </div>
  );
};

export default UserOrders;