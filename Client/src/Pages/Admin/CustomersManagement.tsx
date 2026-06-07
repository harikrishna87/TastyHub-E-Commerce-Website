import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { AuthContext } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateFormatter';

interface ICustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  role: string;
  walletBalance?: number;
  image?: string;
  createdAt: string;
  verified?: boolean;
  isActive?: boolean;
}

interface IOrderItem {
  productId: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
}

interface IOrder {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Out For Delivery' | 'Delivered' | 'Cancelled';
  deliveryStatus?: string;
  createdAt: string;
}

const CustomersManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const toast = useRef<Toast>(null);
  
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  
  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState<boolean>(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch Customers list
  const fetchCustomers = useCallback(async () => {
    if (!auth?.token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.get(`${backendUrl}/api/auth/customers`, config);
      if (res.data.success) {
        // Filter out admins from showing in standard customers lists
        const filtered = (res.data.users || []).filter((u: ICustomer) => u.role === 'user');
        setCustomers(filtered);
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Failed to load customers'
      });
    } finally {
      setLoading(false);
    }
  }, [auth?.token, backendUrl]);

  // Fetch all orders to aggregate customer spendings
  const fetchAllOrders = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.get(`${backendUrl}/api/orders`, config);
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders for aggregation:', err);
    }
  }, [auth?.token, backendUrl]);

  useEffect(() => {
    fetchCustomers();
    fetchAllOrders();
  }, [fetchCustomers, fetchAllOrders]);

  // Handle Toggle Customer Status (Activate/Deactivate)
  const handleToggleCustomerStatus = async (customer: ICustomer) => {
    const isActive = customer.isActive !== false;
    const actionText = isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} this customer account?`)) {
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth?.token}` },
        withCredentials: true,
      };
      const res = await axios.patch(`${backendUrl}/api/auth/users/${customer._id}/toggle-status`, {}, config);
      if (res.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `Customer account ${isActive ? 'deactivated' : 'activated'} successfully`
        });
        fetchCustomers();
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || `Failed to ${actionText} customer`
      });
    }
  };

  // Open Customer details Modal
  const openCustomerDetails = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setCustomerModalVisible(true);
  };

  // Filter orders for the selected customer
  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => {
      const orderUserId = typeof o.user === 'object' ? o.user?._id : o.user;
      return orderUserId === selectedCustomer._id;
    });
  }, [selectedCustomer, orders]);

  // Aggregate stats
  const selectedCustomerStats = useMemo(() => {
    if (selectedCustomerOrders.length === 0) {
      return { totalSpent: 0, orderCount: 0 };
    }
    const totalSpent = selectedCustomerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return {
      totalSpent,
      orderCount: selectedCustomerOrders.length
    };
  }, [selectedCustomerOrders]);

  // Headers & templates for customer table
  const imageBodyTemplate = (rowData: ICustomer) => {
    const avatarSrc = rowData.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    return (
      <Avatar
        image={avatarSrc}
        shape="circle"
        size="large"
        style={{ border: '2px solid #22c55e' }}
      />
    );
  };

  const nameBodyTemplate = (rowData: ICustomer) => {
    return (
      <button
        onClick={() => openCustomerDetails(rowData)}
        style={{
          border: 'none',
          background: 'none',
          padding: 0,
          color: '#15803d',
          fontWeight: '600',
          cursor: 'pointer',
          textDecoration: 'none'
        }}
      >
        {rowData.name}
      </button>
    );
  };

  const phoneBodyTemplate = (rowData: ICustomer) => {
    return <span>{rowData.shippingAddress?.phone || rowData.phone || 'N/A'}</span>;
  };



  const dateBodyTemplate = (rowData: ICustomer) => {
    return <span>{formatDate(rowData.createdAt)}</span>;
  };

  const verifiedBodyTemplate = (rowData: ICustomer) => {
    const isVerified = rowData.verified !== false;
    return (
      <Tag
        severity={isVerified ? 'success' : 'warning'}
        value={isVerified ? 'Verified' : 'Unverified'}
        style={{ fontSize: '0.75rem' }}
      />
    );
  };

  const activeBodyTemplate = (rowData: ICustomer) => {
    const isActive = rowData.isActive !== false;
    return (
      <Tag
        severity={isActive ? 'success' : 'danger'}
        value={isActive ? 'Active' : 'Inactive'}
        style={{ fontSize: '0.75rem' }}
      />
    );
  };

  const actionBodyTemplate = (rowData: ICustomer) => {
    const isActive = rowData.isActive !== false;
    return (
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start', alignItems: 'center' }}>
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-plain p-button-sm"
          style={{ color: '#22c55e', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
          tooltip="View Profile & Orders"
          tooltipOptions={{ position: 'top' }}
          onClick={() => openCustomerDetails(rowData)}
        />
        <Button
          icon={isActive ? "pi pi-lock" : "pi pi-lock-open"}
          className="p-button-text p-button-plain p-button-sm"
          style={{ color: isActive ? '#ef4444' : '#22c55e', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
          tooltip={isActive ? "Deactivate Account" : "Activate Account"}
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleToggleCustomerStatus(rowData)}
        />
      </div>
    );
  };

  // Header element
  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 700 }}>Customers Directory</h3>
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <i className="pi pi-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none', fontSize: '0.9rem' }} />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
          placeholder="Search Name, Email, Phone..."
          style={{ paddingLeft: '2.5rem', width: '280px', borderRadius: '10px', border: '1px solid #d1d5db', height: '38px', fontSize: '0.88rem' }}
        />
      </span>
    </div>
  );

  // Empty table template
  const emptyTableTemplate = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
        <i className="pi pi-users" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No customers found</div>
        <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>No standard registered customers are available.</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Customers Database...</span>
      </div>
    );
  }

  // Custom Toast templates
  return (
    <div style={{ padding: '0.25rem' }}>
      <Toast ref={toast} className="custom-toast" />

      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Customers Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            Browse registered customer profiles, track total order history, and manage accounts.
          </p>
        </div>
      </div>

      {/* Main Customers DataTable */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)', padding: '1.5rem', overflow: 'hidden' }}>
        <DataTable
          value={customers}
          loading={loading}
          paginator
          rows={10}
          header={header}
          globalFilter={globalFilter}
          emptyMessage={emptyTableTemplate}
          responsiveLayout="scroll"
          style={{ fontSize: '0.9rem' }}
          rowHover
        >
          <Column body={imageBodyTemplate} style={{ width: '4rem' }} />
          <Column header="Name" body={nameBodyTemplate} sortable field="name" style={{ fontWeight: 600 }} />
          <Column field="email" header="Email" sortable />
          <Column field="shippingAddress.phone" header="Phone" body={phoneBodyTemplate} />
          <Column header="Joined" body={dateBodyTemplate} sortable field="createdAt" />
          <Column header="Verified Status" body={verifiedBodyTemplate} sortable field="verified" />
          <Column header="Account Status" body={activeBodyTemplate} sortable field="isActive" />
          <Column body={actionBodyTemplate} style={{ width: '8rem' }} />
        </DataTable>
      </div>

      {/* Beautiful Aggregated Customer Dialog */}
      <Dialog
        visible={customerModalVisible}
        onHide={() => {
          setCustomerModalVisible(false);
          setSelectedCustomer(null);
        }}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', width: '100%' }}>
            <i className="pi pi-user-edit" style={{ color: '#15803d', fontSize: '1.3rem' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>Customer Insights & History</span>
          </div>
        }
        style={{ width: '800px', maxWidth: '95vw', borderRadius: '16px' }}
        modal
        dismissableMask
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', fontFamily: 'Inter, sans-serif' }}>
            {/* Header Cards Info - Flex side-by-side */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Profile Card */}
              <div style={{ flex: '1 1 300px', display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <Avatar
                  image={selectedCustomer.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                  size="xlarge"
                  shape="circle"
                  style={{ border: '3px solid #15803d', width: '70px', height: '70px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>{selectedCustomer.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#4b5563', wordBreak: 'break-all' }}>{selectedCustomer.email}</span>
                  <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Phone: {selectedCustomer.shippingAddress?.phone || selectedCustomer.phone || 'N/A'}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                    <Tag severity={selectedCustomer.verified !== false ? 'success' : 'warning'} value={selectedCustomer.verified !== false ? 'Verified' : 'Unverified'} />
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Joined: {formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Total Orders</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{selectedCustomerStats.orderCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Total Spent</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>₹{selectedCustomerStats.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Aggregated Order History Header */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>
                Order History ({selectedCustomerOrders.length})
              </h4>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                <DataTable
                  value={selectedCustomerOrders}
                  emptyMessage={() => (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      <i className="pi pi-shopping-cart" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.5rem' }} />
                      <div>No orders placed yet.</div>
                    </div>
                  )}
                  paginator
                  rows={5}
                  style={{ fontSize: '0.85rem' }}
                >
                  <Column
                    header="Order ID"
                    body={(rowData: IOrder) => (
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {rowData._id.substring(0, 10)}...
                      </span>
                    )}
                  />
                  <Column
                    header="Date"
                    body={(rowData: IOrder) => (
                      <span>{formatDate(rowData.createdAt)}</span>
                    )}
                  />
                  <Column
                    header="Method"
                    body={(rowData: IOrder) => (
                      <Tag
                        severity="info"
                        value={rowData.paymentMethod.toUpperCase()}
                        style={{ fontSize: '0.7rem' }}
                      />
                    )}
                  />
                  <Column
                    header="Status"
                    body={(rowData: IOrder) => {
                      const method = (rowData.paymentMethod || 'cod').toLowerCase();
                      const delivery = rowData.deliveryStatus || 'Pending';
                      
                      let isPaid = false;
                      if (method === 'cod') {
                        isPaid = delivery === 'Delivered';
                      } else {
                        isPaid = true; // online, gift_card, etc.
                      }
                      
                      return (
                        <Tag
                          severity={isPaid ? 'success' : 'danger'}
                          value={isPaid ? 'Paid' : 'Unpaid'}
                          style={{ fontSize: '0.7rem' }}
                        />
                      );
                    }}
                  />
                  <Column
                    header="Amount"
                    body={(rowData: IOrder) => (
                      <span style={{ fontWeight: 700, color: '#111827' }}>
                        ₹{(rowData.totalAmount || 0).toFixed(2)}
                      </span>
                    )}
                  />
                </DataTable>
              </div>
            </div>
            
            {/* Close button container */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <Button
                label="Close Profile"
                icon="pi pi-times"
                severity="success"
                onClick={() => {
                  setCustomerModalVisible(false);
                  setSelectedCustomer(null);
                }}
                style={{ borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default CustomersManagement;
