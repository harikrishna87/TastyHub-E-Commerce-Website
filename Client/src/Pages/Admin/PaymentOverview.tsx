import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { IOrder } from '../../types';

const PaymentOverview: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchOrders = useCallback(async () => {
    if (!auth?.token) {
      setError('Not authenticated.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
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
        setError(response.data.message || 'Failed to fetch orders.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  }, [auth?.token, backendUrl]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // --- TEMPLATE FORMATTERS ---

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

  const statusTemplate = (row: IOrder) => {
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
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <i className="pi pi-exclamation-triangle" style={{ fontSize: '3rem', marginBottom: '1rem' }} />
        <h3>Access Denied or Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  const sortedPayments = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Payment Overview</h1>
        <p style={styles.sub}>Review and verify successful customer transactions</p>
      </div>

      <div style={styles.tablePanel}>
        <DataTable
          value={sortedPayments}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          className="p-datatable-striped"
          responsiveLayout="scroll"
          emptyMessage={() => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
              <i className="pi pi-credit-card" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No payments found.</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Successful customer transaction histories will record here.</div>
            </div>
          )}
        >
          <Column field="user.name" header="CUSTOMER" body={customerTemplate} style={{ width: '25%' }} />
          <Column field="_id" header="ORDER ID" body={orderIdTemplate} style={{ width: '15%' }} />
          <Column field="paymentMethod" header="PAYMENT METHOD" body={paymentMethodTemplate} style={{ width: '15%' }} />
          <Column field="totalAmount" header="AMOUNT" body={amountTemplate} style={{ width: '15%' }} />
          <Column header="STATUS" body={statusTemplate} style={{ width: '15%' }} />
          <Column field="createdAt" header="TRANSACTION DATE" body={dateTemplate} style={{ width: '15%' }} />
        </DataTable>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
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
  tablePanel: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  },
};

export default PaymentOverview;