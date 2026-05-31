import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder, OrderDeliveryStatus } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getAvailableStatusOptions = (currentStatus: OrderDeliveryStatus): OrderDeliveryStatus[] => {
  const statusFlow: Record<OrderDeliveryStatus, OrderDeliveryStatus[]> = {
    'Pending': ['Pending', 'Accepted'],
    'Accepted': ['Accepted', 'Preparing'],
    'Preparing': ['Preparing', 'Pickup'],
    'Pickup': ['Pickup', 'Out for Delivery'],
    'Out for Delivery': ['Out for Delivery', 'Delivered'],
    'Shipped': ['Shipped', 'Delivered'],
    'Delivered': ['Delivered']
  };
  return statusFlow[currentStatus] || ['Pending'];
};

const OrderManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const [addressVisible, setAddressVisible] = useState<boolean>(false);
  
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchOrders = useCallback(async () => {
    if (!auth?.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      };

      const response = await axios.get(`${backendUrl}/api/orders`, config);
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        console.warn(response.data.message || 'Failed to fetch orders.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [auth?.token, backendUrl]);


  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderDeliveryStatus) => {
    if (!auth?.token) {
      alert('You are not authenticated to perform this action.');
      return;
    }

    try {
      setStatusUpdateLoading(orderId);

      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      };

      const response = await axios.patch(
        `${backendUrl}/api/orders/${orderId}/status`,
        { status: newStatus },
        config
      );

      if (response.data.success) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, deliveryStatus: newStatus }
              : order
          )
        );
      } else {
        alert(response.data.message || 'Failed to update status.');
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#22c55e');
    doc.text('TastyHub - Order Management Report', 14, 22);

    const tableColumns = ["Order ID", "Customer", "Amount(₹)", "Status", "Date", "Items"];
    const tableRows: (string | number)[][] = [];

    orders.forEach(order => {
      const itemsList = order.items.map((item, index) =>
        `${index + 1}. ${item.name} (Qty: ${item.quantity})`
      ).join('\n');

      const amountString = `${order.totalAmount.toFixed(2)}`;

      const orderData = [
        order._id,
        `${order.user?.name || 'N/A'}\n${order.user?.email || 'N/A'}`,
        amountString,
        order.deliveryStatus,
        new Date(order.createdAt).toLocaleDateString(),
        itemsList
      ];
      tableRows.push(orderData);
    });

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        font: 'times',
        fontStyle: 'bold'
      },
      styles: {
        font: 'times',
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 18 },
        4: { cellWidth: 20 },
        5: { cellWidth: 'auto' },
      }
    });

    doc.save('order-management-report.pdf');
  };

  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  const handleViewAddress = (order: IOrder) => {
    setSelectedOrder(order);
    setAddressVisible(true);
  };

  // Plain Text Status Tag for Dialogs
  const getStatusTag = (status: OrderDeliveryStatus) => {
    let severity: "success" | "warning" | "info" | "danger" | null = 'info';
    if (status === 'Delivered') severity = 'success';
    else if (status === 'Pending') severity = 'warning';
    else if (status === 'Accepted') severity = 'info';
    else if (status === 'Preparing') severity = 'warning';
    else if (status === 'Pickup' || status === 'Out for Delivery' || status === 'Shipped') severity = 'info';
    return <Tag value={status} severity={severity} style={{ borderRadius: '6px' }} />;
  };

  // --- TEMPLATES FOR DATATABLE COLUMNS ---

  const orderIdTemplate = (row: IOrder) => (
    <code style={{ color: '#64748b', fontWeight: 600 }}>{row._id.substring(0, 10)}...</code>
  );

  const customerTemplate = (row: IOrder) => {
    const userImg = row.user?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img
          src={userImg}
          alt={row.user?.name || 'Customer'}
          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #22c55e' }}
          onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.user?.name || 'N/A'}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{row.user?.email || 'N/A'}</span>
        </div>
      </div>
    );
  };

  const amountTemplate = (row: IOrder) => (
    <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.95rem' }}>
      ₹{row.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );

  const paymentMethodTemplate = (row: IOrder) => {
    const method = (row.paymentMethod || 'cod').toUpperCase();
    return (
      <Tag
        value={method}
        severity={method === 'COD' ? 'info' : 'success'}
        style={{ borderRadius: '6px' }}
      />
    );
  };

  const paymentStatusTemplate = (row: IOrder) => {
    const method = (row.paymentMethod || 'cod').toLowerCase();
    const delivery = row.deliveryStatus || 'Pending';
    
    let isPaid = false;
    if (method === 'cod') {
      isPaid = delivery === 'Delivered';
    } else {
      isPaid = true; // online, gift_card, etc.
    }
    
    return (
      <Tag
        value={isPaid ? "Paid" : "Unpaid"}
        severity={isPaid ? "success" : "danger"}
        icon={isPaid ? "pi pi-check-circle" : "pi pi-times-circle"}
        style={{ borderRadius: '6px' }}
      />
    );
  };

  // Custom UI status change dropdown template
  const statusDropdownTemplate = (row: IOrder) => {
    const isUpdating = statusUpdateLoading === row._id;
    const statusColor = row.deliveryStatus === 'Delivered' ? '#22c55e' : 
                        (row.deliveryStatus === 'Out for Delivery' || row.deliveryStatus === 'Shipped' || row.deliveryStatus === 'Pickup' ? '#3b82f6' : '#f59e0b');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Dropdown
          value={row.deliveryStatus}
          options={getAvailableStatusOptions(row.deliveryStatus).map(opt => ({ label: opt, value: opt }))}
          onChange={(e) => handleStatusChange(row._id, e.value as any)}
          disabled={isUpdating || row.deliveryStatus === 'Delivered'}
          style={{
            borderRadius: '8px',
            color: statusColor,
            fontWeight: 600,
            fontSize: '0.85rem',
            width: '135px'
          }}
          panelStyle={{ minWidth: '135px' }}
        />
        {isUpdating && <i className="pi pi-spin pi-spinner" style={{ color: '#22c55e', fontSize: '0.9rem' }} />}
      </div>
    );
  };

  const actionsTemplate = (row: IOrder) => (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start', alignItems: 'center' }}>
      <Button
        icon="pi pi-eye"
        className="p-button-text p-button-plain p-button-sm"
        style={{ color: '#22c55e', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
        tooltip="View Details"
        onClick={() => handleViewOrder(row)}
      />
      <Button
        icon="pi pi-map-marker"
        className="p-button-text p-button-plain p-button-sm"
        style={{ color: '#3b82f6', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
        tooltip="View Address"
        onClick={() => handleViewAddress(row)}
      />
    </div>
  );

  const dateTemplate = (row: IOrder) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.88rem' }}>
      <i className="pi pi-calendar" style={{ color: '#22c55e' }} />
      <span>{new Date(row.createdAt).toLocaleDateString('en-IN')}</span>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Orders...</span>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={styles.container}>
      {/* Title Header Section */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Order Management</h1>
          <p style={styles.sub}>Track, update, and manage restaurant orders</p>
        </div>
        
        <button onClick={handleDownloadPDF} style={styles.pdfBtn}>
          <i className="pi pi-file-pdf" style={{ fontSize: '1.1rem' }} />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* Main DataTable panel (Strip KPI summary cards) */}
      <div style={styles.tablePanel}>
        <DataTable
          value={sortedOrders}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          className="p-datatable-striped"
          responsiveLayout="scroll"
          emptyMessage={() => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
              <i className="pi pi-shopping-bag" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No orders found.</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Customer checkout orders will display here once placed.</div>
            </div>
          )}
        >
          <Column field="user.name" header="CUSTOMER" body={customerTemplate} style={{ width: '22%' }} />
          <Column field="_id" header="ORDER ID" body={orderIdTemplate} style={{ width: '12%' }} />
          <Column field="paymentMethod" header="PAYMENT METHOD" body={paymentMethodTemplate} style={{ width: '12%' }} />
          <Column header="PAYMENT STATUS" body={paymentStatusTemplate} style={{ width: '12%' }} />
          <Column field="totalAmount" header="TOTAL AMOUNT" body={amountTemplate} style={{ width: '12%' }} />
          <Column field="deliveryStatus" header="DELIVERY STATUS" body={statusDropdownTemplate} style={{ width: '15%' }} />
          <Column field="createdAt" header="ORDER DATE" body={dateTemplate} style={{ width: '10%' }} />
          <Column header="ACTIONS" body={actionsTemplate} style={{ width: '5%' }} />
        </DataTable>
      </div>

      {/* Product Details Modal (Dialog) */}
      <Dialog
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e' }}>
            <i className="pi pi-shopping-cart" />
            <span>Order Product Items</span>
          </div>
        }
        visible={detailsVisible}
        style={{ width: '50vw' }}
        onHide={() => setDetailsVisible(false)}
      >
        {selectedOrder && (
          <div>
            <div style={styles.dialogSectionTitle}>Customer Information</div>
            <div style={styles.infoGrid}>
              <div><strong>Name:</strong> {selectedOrder.user?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</div>
              <div><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              <div><strong>Status:</strong> {getStatusTag(selectedOrder.deliveryStatus)}</div>
            </div>

            <div style={{ ...styles.dialogSectionTitle, marginTop: '1.5rem' }}>Product Items</div>
            <div style={styles.itemList}>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={styles.itemCard}>
                  <img src={item.image} alt={item.name} style={styles.itemImg} onError={(e)=>{(e.target as any).src='https://primefaces.org/cdn/primereact/images/logo.png'}} />
                  <div style={{ flex: 1 }}>
                    <div style={styles.itemName}>{item.name}</div>
                    <div style={styles.itemMeta}>Quantity: {item.quantity}</div>
                    <div style={styles.itemMeta}>
                      <span style={{ textDecoration: 'line-through', marginRight: '6px' }}>₹{item.original_price ?? 0}</span>
                      <strong style={{ color: '#22c55e' }}>₹{(item.discount_price ?? item.original_price) ?? 0}</strong>
                    </div>
                  </div>
                  <div style={styles.itemTotal}>₹{(((item.discount_price ?? item.original_price) ?? 0) * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={styles.dialogFooterLine}>
              <span>Total Amount:</span>
              <strong style={{ color: '#22c55e', fontSize: '1.4rem' }}>₹{selectedOrder.totalAmount.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </Dialog>

      {/* Shipping Address Modal (Dialog) */}
      <Dialog
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e' }}>
            <i className="pi pi-map-marker" />
            <span>Delivery Destination Address</span>
          </div>
        }
        visible={addressVisible}
        style={{ width: '40vw' }}
        onHide={() => setAddressVisible(false)}
      >
        {selectedOrder && selectedOrder.shippingAddress ? (
          <div style={styles.addressBox}>
            <div style={styles.addressLine}><strong>Full Name:</strong> {selectedOrder.shippingAddress.fullName}</div>
            <div style={styles.addressLine}><strong>Phone Number:</strong> {selectedOrder.shippingAddress.phone}</div>
            <div style={styles.addressLine}><strong>Address:</strong> {selectedOrder.shippingAddress.addressLine1} {selectedOrder.shippingAddress.addressLine2 ? `, ${selectedOrder.shippingAddress.addressLine2}` : ''}</div>
            <div style={styles.addressLine}><strong>City / State:</strong> {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</div>
            <div style={styles.addressLine}><strong>Postal Code / Country:</strong> {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <i className="pi pi-info-circle" style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
            <div>No delivery shipping address is specified for this order.</div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  sub: {
    fontSize: '0.88rem',
    color: '#64748b',
    margin: '0.2rem 0 0 0',
  },
  pdfBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '0.65rem 1.25rem',
    borderRadius: '12px',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
    transition: 'all 0.2s ease',
  },
  tablePanel: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  },
  dialogSectionTitle: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: '1rem',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '0.45rem',
    marginBottom: '0.85rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    fontSize: '0.88rem',
    color: '#334155',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    maxHeight: '260px',
    overflowY: 'auto' as const,
    paddingRight: '5px',
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  itemImg: {
    width: '50px',
    height: '50px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
  },
  itemName: {
    fontWeight: 600,
    color: '#0f172a',
    fontSize: '0.88rem',
  },
  itemMeta: {
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: '0.15rem',
  },
  itemTotal: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: '0.92rem',
  },
  dialogFooterLine: {
    marginTop: '1.5rem',
    borderTop: '2px solid #f1f5f9',
    paddingTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#0f172a',
  },
  addressBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    fontSize: '0.92rem',
    color: '#334155',
  },
  addressLine: {
    lineHeight: '1.5',
  },
};

export default OrderManagement;