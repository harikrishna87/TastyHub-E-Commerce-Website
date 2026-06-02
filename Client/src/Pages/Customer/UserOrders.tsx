import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { IOrder, OrderDeliveryStatus } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const customStyles = `
  .orders-table .p-datatable-thead > tr > th {
    background-color: #f6ffed !important;
    color: #15803d !important;
    font-weight: 700 !important;
    border-bottom: 2px solid #b7eb8f !important;
    padding: 16px !important;
  }
  .orders-table .p-datatable-tbody > tr {
    transition: background-color 0.2s;
  }
  .orders-table .p-datatable-tbody > tr:hover {
    background-color: #f9fffa !important;
  }
  .orders-table .p-datatable-tbody > tr > td {
    padding: 16px !important;
    border-bottom: 1px solid #f0f0f0 !important;
  }
  .orders-table .p-paginator {
    background-color: #ffffff !important;
    border-top: 1px solid #f0f0f0 !important;
    padding: 12px !important;
    border-radius: 0 0 16px 16px !important;
  }
  .orders-table .p-paginator .p-paginator-page.p-highlight {
    background: #e6f7ff !important;
    border-color: #1890ff !important;
    color: #1890ff !important;
  }
`;

interface OrderStatusTrackerProps {
  currentStatus: OrderDeliveryStatus;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
  const getStatusIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Accepted':
      case 'Preparing':
      case 'Pickup':
      case 'Out for Delivery':
      case 'Shipped':
        return 1;
      case 'Delivered':
        return 2;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  const steps = [
    {
      key: 'Pending',
      title: 'ORDERED',
      icon: 'pi pi-clock',
      index: 0
    },
    {
      key: 'Shipped', 
      title: 'ORDER SHIPPED',
      icon: 'pi pi-truck',
      index: 1
    },
    {
      key: 'Delivered',
      title: 'DELIVERED', 
      icon: 'pi pi-gift',
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
                <i className={isCompleted ? 'pi pi-check-circle' : step.icon} />
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
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
      <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading your orders...</span>
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
  
  const messageApi = {
    info: (content: string) => (window as any).showToast?.('info', 'Info', content),
    success: (content: string) => (window as any).showToast?.('success', 'Success', content),
    error: (content: string) => (window as any).showToast?.('error', 'Error', content),
    loading: (content: string) => (window as any).showToast?.('info', 'Loading', content),
  };
  
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
    
    // Inject styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.head.removeChild(styleElement);
    };
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
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [auth?.token, backendUrl]);

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
    messageApi.loading('Generating your receipt...');

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

      messageApi.success('Receipt downloaded successfully!');

    } catch (err) {
      console.error('Error generating PDF receipt:', err);
      messageApi.error('Failed to download receipt. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // const truncateText = (text: string, maxLength: number) => {
  //   if (text.length <= maxLength) return text;
  //   return text.substring(0, maxLength) + '...';
  // };

  const getStatusTag = (status: OrderDeliveryStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span style={{ background: '#fffbe6', color: '#d46b08', border: '1px dashed #ffe58f', borderRadius: '5px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <i className="pi pi-clock" /> Pending
          </span>
        );
      case 'Shipped':
        return (
          <span style={{ background: '#e6f7ff', color: '#096dd9', border: '1px dashed #91d5ff', borderRadius: '5px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <i className="pi pi-truck" /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span style={{ background: '#f6ffed', color: '#389e0d', border: '1px dashed #b7eb8f', borderRadius: '5px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <i className="pi pi-check-circle" /> Delivered
          </span>
        );
      default:
        return (
          <span style={{ background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: '5px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {status}
          </span>
        );
    }
  };

  const getStatusBadge = (order: IOrder) => {
    return (
      <button 
        onClick={() => showStatusModal(order)}
        style={{
          background: 'none',
          border: 'none',
          color: '#22c55e',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: 0
        }}
      >
        <i className="pi pi-info-circle" /> Track Status
      </button>
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
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div style={{ padding: '24px', border: '1px solid #fca5a5', borderRadius: '12px', background: '#fef2f2', color: '#991b1b', textAlign: 'left' }}>
            <h4 style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '16px' }}><i className="pi pi-info-circle" style={{ marginRight: '8px' }} /> Access Denied or Error!</h4>
            <p style={{ margin: '0 0 8px 0' }}>{error}</p>
            <p style={{ margin: 0 }}>Please ensure you are logged in to view your orders.</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
      margin: '0 auto',
      fontFamily: 'Outfit, sans-serif'
    }}>
      
      <div style={{ 
        textAlign: 'center',
        marginBottom: 32
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#52c41a',
          fontSize: '30px',
          fontWeight: 700
        }}>
          My Orders History
        </h1>
      </div>

      <Card
        className="orders-table"
        style={{ 
          borderRadius: '16px',
          border: '2px dashed #b7eb8f',
          boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
          background: 'white',
          overflow: 'hidden'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          fontSize: '20px',
          fontWeight: 600,
          color: '#52c41a',
          padding: '24px 24px 12px 24px'
        }}>
          <i className="pi pi-shopping-cart" style={{ marginRight: 12, fontSize: '24px', color: '#52c41a' }} />
          Your Order History
        </div>

        {orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: '#f6ffed',
            borderRadius: '12px',
            border: '1px solid #d9f7be',
            margin: '24px'
          }}>
            <i className="pi pi-shopping-cart" style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
            <h4 style={{ color: '#52c41a', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>No orders placed yet</h4>
            <span style={{ color: '#8c8c8c' }}>Your orders will appear here once you start shopping</span>
          </div>
        ) : (
          <DataTable 
            value={sortedOrders} 
            dataKey="_id" 
            paginator 
            rows={10} 
            responsiveLayout="scroll"
          >
            <Column 
              header="Order ID" 
              body={(rowData: IOrder) => (
                <span style={{ background: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff', borderRadius: '4px', padding: '2px 8px', fontSize: '13px', fontWeight: 600 }}>
                  {rowData._id}
                </span>
              )} 
              style={{ width: '150px' }} 
            />
            <Column 
              header="Customer" 
              body={(rowData: IOrder) => (
                <div>
                  <div style={{ fontWeight: 500, color: '#262626' }}>{rowData.user?.name || 'N/A'}</div>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {rowData.user?.email || 'N/A'}
                  </span>
                </div>
              )} 
            />
            <Column 
              header="Amount" 
              body={(rowData: IOrder) => (
                <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '14px' }}>
                  ₹{rowData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )} 
              style={{ textAlign: 'center', width: '120px' }} 
            />
            <Column 
              header="Status" 
              body={(rowData: IOrder) => getStatusBadge(rowData)} 
              style={{ width: '140px' }} 
            />
            <Column 
              header="Order Date" 
              body={(rowData: IOrder) => (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="pi pi-calendar" style={{ color: '#52c41a' }} />
                  <span>{new Date(rowData.createdAt).toLocaleDateString('en-IN')}</span>
                </span>
              )} 
              style={{ width: '140px' }} 
            />
            <Column 
              header="Items" 
              body={(rowData: IOrder) => (
                <button 
                  onClick={() => showModal(rowData)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: 0,
                    background: 'none',
                    border: 'none',
                    color: '#1890ff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  <i className="pi pi-eye" /> 
                  View Items ({rowData.items?.length || 0})
                </button>
              )} 
              style={{ width: '160px' }} 
            />
          </DataTable>
        )}
      </Card>

      {selectedOrder && (
        <Dialog
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52c41a', fontWeight: 'bold', fontSize: '1.25rem' }}>
              <i className="pi pi-shopping-cart" />
              <span>Order Details - {isMobile ? selectedOrder._id.substring(0, 6) + '...' : selectedOrder._id}</span>
            </div>
          }
          visible={isModalVisible}
          onHide={handleCancel}
          style={{ width: isMobile ? '95%' : '800px' }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '12px 0 0 0' }}>
              <Button label="Close" onClick={handleCancel} className="p-button-outlined p-button-secondary" style={{ color: '#595959', border: '1px solid #d9d9d9' }} />
              <Button
                label="Download Receipt"
                icon="pi pi-download"
                loading={isDownloading}
                onClick={handleDownloadReceipt}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", color: 'white' }}
              />
            </div>
          }
        >
          <div style={{ padding: '8px 0' }}>
            <h4 style={{ marginBottom: 16, color: '#52c41a', fontSize: '1.15rem', fontWeight: 'bold' }}>Customer Details</h4>
            
            <div style={{ marginBottom: '24px', border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Customer Name</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#595959', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="pi pi-user" /> {selectedOrder.user?.name || 'N/A'}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Customer Email</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#595959' }}>
                  {selectedOrder.user?.email || 'N/A'}
                </div>
              </div>
            </div>

            <h4 style={{ marginBottom: 16, color: '#52c41a', fontSize: '1.15rem', fontWeight: 'bold' }}>Order Information</h4>
            
            <div style={{ marginBottom: '24px', border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Order ID</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#52c41a', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {selectedOrder._id}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Order Date</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#595959' }}>
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Total Amount</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#52c41a', fontWeight: 'bold', fontSize: '16px' }}>
                  ₹{selectedOrder.totalAmount.toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', background: '#fafafa', fontWeight: 600, color: '#262626', borderRight: '1px solid #f0f0f0' }}>Status</div>
                <div style={{ flex: '1 1 200px', padding: '12px 16px', color: '#595959' }}>
                  {getStatusTag(selectedOrder.deliveryStatus)}
                </div>
              </div>
            </div>

            <h4 style={{ marginBottom: 16, color: '#52c41a', fontSize: '1.15rem', fontWeight: 'bold' }}>
              Order Items ({totalItems} items)
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {currentItems.map((item, idx) => (
                <div key={startIndex + idx} style={{ padding: '16px', borderRadius: '8px', border: '2px dashed #b7eb8f', backgroundColor: '#fff', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {item.image && (
                    <img src={item.image} alt={item.name} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '2px solid #b7eb8f' }} onError={(e) => { (e.target as HTMLImageElement).src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+5BhMlyJFAcxBOJqhE8wQ7kKQQtKSlkZzZnZklBW1KKaUKZhJFM7MpIQ6lJTJKKJGJ6GElJvK5Z+cFklVVr6vr9e/39v3V/e8P"; }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#262626' }}>{item.name || 'Unknown Item'}</h5>
                    <div style={{ marginBottom: '8px', color: '#8c8c8c', fontSize: '14px' }}>Quantity: <strong style={{ color: '#262626' }}>{item.quantity || 0}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ textDecoration: 'line-through', color: '#8c8c8c', fontSize: '14px' }}>₹{((item as any).original_price || 0).toFixed(2)}</span>
                      <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '16px' }}>₹{((item as any).discount_price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalItems > itemsPerPage && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: 24 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{
                    background: currentPage === 1 ? '#f5f5f5' : '#fff',
                    color: currentPage === 1 ? '#bfbfbf' : '#52c41a',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="pi pi-chevron-left" /> Previous
                </button>
                <span style={{ fontSize: '14px', color: '#595959' }}>
                  Page <strong>{currentPage}</strong> of <strong>{Math.ceil(totalItems / itemsPerPage)}</strong>
                </span>
                <button
                  disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{
                    background: currentPage === Math.ceil(totalItems / itemsPerPage) ? '#f5f5f5' : '#fff',
                    color: currentPage === Math.ceil(totalItems / itemsPerPage) ? '#bfbfbf' : '#52c41a',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: currentPage === Math.ceil(totalItems / itemsPerPage) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next <i className="pi pi-chevron-right" />
                </button>
              </div>
            )}
            
            {/* Receipt container for printing */}
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
          </div>
        </Dialog>
      )}

      {selectedOrderForStatus && (
        <Dialog
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52c41a', fontWeight: 'bold', fontSize: '1.25rem' }}>
              <i className="pi pi-truck" />
              <span>Order Status Tracking - {isMobile ? selectedOrderForStatus._id.substring(0, 6) + '...' : selectedOrderForStatus._id}</span>
            </div>
          }
          visible={isStatusModalVisible}
          onHide={handleStatusModalCancel}
          style={{ width: isMobile ? '95%' : '600px' }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0 0' }}>
              <Button label="Close" onClick={handleStatusModalCancel} className="p-button-outlined p-button-secondary" style={{ color: '#595959', border: '1px solid #d9d9d9' }} />
            </div>
          }
        >
          <div style={{ padding: '8px 0' }}>
            <h4 style={{ marginBottom: 16, color: '#52c41a', fontSize: '1.15rem', fontWeight: 'bold' }}>Delivery Progress</h4>
            <OrderStatusTracker currentStatus={selectedOrderForStatus.deliveryStatus} />
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default UserOrders;