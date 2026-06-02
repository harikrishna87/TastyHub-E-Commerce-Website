import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

interface Executive {
  _id: string;
  name: string;
  email: string;
  deliveryStatus: 'Pending' | 'Approved' | 'Rejected';
  isAvailable: boolean;
  createdAt: string;
  isActive?: boolean;
  image?: string;
}

interface WithdrawalRequest {
  _id: string;
  deliveryExecutive: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  amount: number;
  paymentDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}

const DeliveryManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchExecutives = useCallback(async () => {
    if (!auth?.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        withCredentials: true
      };

      const response = await axios.get(`${backendUrl}/api/delivery/admin/executives`, config);
      if (response.data.success) {
        setExecutives(response.data.executives);
      } else {
        console.warn(response.data.message || 'Failed to fetch executives.');
      }
    } catch (err: any) {
      console.error('Error fetching executives:', err);
    } finally {
      setLoading(false);
    }
  }, [auth?.token, backendUrl]);

  const fetchWithdrawalRequests = useCallback(async () => {
    if (!auth?.token) return;

    try {
      setLoadingWithdrawals(true);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        withCredentials: true
      };

      const response = await axios.get(`${backendUrl}/api/delivery/admin/withdrawals`, config);
      if (response.data.success) {
        setWithdrawalRequests(response.data.requests || []);
      } else {
        console.warn(response.data.message || 'Failed to fetch withdrawal requests.');
      }
    } catch (err: any) {
      console.error('Error fetching withdrawal requests:', err);
    } finally {
      setLoadingWithdrawals(false);
    }
  }, [auth?.token, backendUrl]);

  useEffect(() => {
    fetchExecutives();
    fetchWithdrawalRequests();
  }, [fetchExecutives, fetchWithdrawalRequests]);

  const handleUpdateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    if (!auth?.token) return;

    try {
      setActionLoading(id);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await axios.patch(
        `${backendUrl}/api/delivery/admin/executives/${id}/status`,
        { status },
        config
      );

      if (response.data.success) {
        setExecutives(prev =>
          prev.map(exec => (exec._id === id ? { ...exec, deliveryStatus: status } : exec))
        );
      } else {
        alert(response.data.message || 'Failed to update status.');
      }
    } catch (err: any) {
      console.error('Status update failed:', err);
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateWithdrawalStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    if (!auth?.token) return;
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this withdrawal request?`)) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await axios.patch(
        `${backendUrl}/api/delivery/admin/withdrawals/${id}/status`,
        { status },
        config
      );

      if (response.data.success) {
        setWithdrawalRequests(prev =>
          prev.map(req => (req._id === id ? { ...req, status } : req))
        );
        fetchExecutives(); // Update executives listing in case balance changes
      } else {
        alert(response.data.message || 'Failed to update withdrawal request.');
      }
    } catch (err: any) {
      console.error('Withdrawal update failed:', err);
      alert(err.response?.data?.message || 'Failed to update withdrawal request.');
    }
  };

  // Toggle Delivery Executive active status
  const handleToggleDEStatus = async (exec: Executive) => {
    const isActive = exec.isActive !== false;
    const actionText = isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} this delivery executive?`)) {
      return;
    }
    try {
      setActionLoading(exec._id);
      const config = {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };
      const response = await axios.patch(
        `${backendUrl}/api/auth/users/${exec._id}/toggle-status`,
        {},
        config
      );
      if (response.data.success) {
        setExecutives(prev =>
          prev.map(item => (item._id === exec._id ? { ...item, isActive: !isActive } : item))
        );
      } else {
        alert(response.data.message || `Failed to ${actionText} delivery executive.`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${actionText} delivery executive.`);
    } finally {
      setActionLoading(null);
    }
  };

  const executiveTemplate = (row: Executive) => {
    const userImg = row.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img
          src={userImg}
          alt={row.name}
          referrerPolicy="no-referrer"
          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #22c55e' }}
          onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
        />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.name}</span>
      </div>
    );
  };

  const withdrawalExecutiveTemplate = (row: WithdrawalRequest) => {
    const userImg = row.deliveryExecutive?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img
          src={userImg}
          alt={row.deliveryExecutive?.name || 'Executive'}
          referrerPolicy="no-referrer"
          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #22c55e' }}
          onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
        />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.deliveryExecutive?.name}</span>
      </div>
    );
  };

  const statusTemplate = (row: Executive) => {
    let severity: "success" | "warning" | "info" | "danger" | null = 'info';
    if (row.deliveryStatus === 'Approved') severity = 'success';
    else if (row.deliveryStatus === 'Pending') severity = 'warning';
    else if (row.deliveryStatus === 'Rejected') severity = 'danger';
    
    const isActive = row.isActive !== false;
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Tag value={row.deliveryStatus} severity={severity} style={{ borderRadius: '6px' }} />
        <Tag value={isActive ? 'Active' : 'Deactivated'} severity={isActive ? 'success' : 'danger'} style={{ borderRadius: '6px' }} />
      </div>
    );
  };

  const availabilityTemplate = (row: Executive) => (
    row.deliveryStatus === 'Approved' ? (
      <Tag
        value={row.isAvailable ? 'Online / Free' : 'Busy / Offline'}
        severity={row.isAvailable ? 'success' : 'secondary'}
        style={{ borderRadius: '6px' }}
      />
    ) : (
      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Not Approved</span>
    )
  );

  const actionsTemplate = (row: Executive) => {
    const isPending = row.deliveryStatus === 'Pending';
    const isBusy = actionLoading === row._id;
    const isActive = row.isActive !== false;

    return (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {isPending ? (
          <>
            <Button
              icon="pi pi-check"
              className="p-button-text p-button-plain p-button-sm"
              style={{ color: '#22c55e', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
              tooltip="Approve Executive"
              onClick={() => handleUpdateStatus(row._id, 'Approved')}
              disabled={isBusy}
            />
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-plain p-button-sm"
              style={{ color: '#ef4444', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
              tooltip="Reject Executive"
              onClick={() => handleUpdateStatus(row._id, 'Rejected')}
              disabled={isBusy}
            />
          </>
        ) : (
          <>
            <Button
              icon={isActive ? "pi pi-lock" : "pi pi-lock-open"}
              className="p-button-text p-button-plain p-button-sm"
              style={{ color: isActive ? '#ef4444' : '#22c55e', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
              tooltip={isActive ? "Deactivate Executive" : "Activate Executive"}
              onClick={() => handleToggleDEStatus(row)}
              disabled={isBusy}
            />
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              {row.deliveryStatus}
            </span>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Delivery Partners...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Delivery Executives Management</h1>
        <p style={styles.sub}>Review job applications, approve delivery partners, and monitor availability</p>
      </div>

      <div style={styles.tablePanel}>
        <DataTable
          value={executives}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          className="p-datatable-striped"
          responsiveLayout="scroll"
          emptyMessage={() => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
              <i className="pi pi-truck" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No delivery executives registered yet.</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Pending or approved executive profiles will appear here.</div>
            </div>
          )}
        >
          <Column field="name" header="EXECUTIVE NAME" body={executiveTemplate} style={{ fontWeight: 600 }} sortable />
          <Column field="email" header="EMAIL ADDRESS" sortable />
          <Column field="deliveryStatus" header="APPLICATION STATUS" body={statusTemplate} sortable />
          <Column header="ONLINE STATUS" body={availabilityTemplate} />
          <Column field="createdAt" header="APPLIED ON" body={(r) => new Date(r.createdAt).toLocaleDateString()} sortable />
          <Column header="DECISIONS" body={actionsTemplate} style={{ width: '220px' }} />
        </DataTable>
      </div>

      <div style={{ ...styles.header, marginTop: '2rem' }}>
        <h1 style={styles.title}>Withdrawal Requests Settlement</h1>
        <p style={styles.sub}>Review partner payout requests and approve settlements</p>
      </div>

      <div style={styles.tablePanel}>
        <DataTable
          value={withdrawalRequests}
          paginator
          rows={10}
          loading={loadingWithdrawals}
          rowsPerPageOptions={[5, 10, 20]}
          className="p-datatable-striped"
          responsiveLayout="scroll"
          emptyMessage={() => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
              <i className="pi pi-money-bill" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No withdrawal requests submitted yet.</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Partner requests will appear here for payout clearance.</div>
            </div>
          )}
        >
          <Column field="deliveryExecutive.name" header="EXECUTIVE NAME" body={withdrawalExecutiveTemplate} style={{ fontWeight: 600 }} sortable />
          <Column field="deliveryExecutive.email" header="EMAIL ADDRESS" sortable />
          <Column field="amount" header="AMOUNT REQUESTED" body={(r) => <strong style={{ color: '#166534' }}>₹{r.amount.toFixed(2)}</strong>} sortable />
          <Column field="paymentDetails" header="PAYMENT / UPI DETAILS" />
          <Column field="requestDate" header="REQUESTED ON" body={(r) => new Date(r.requestDate).toLocaleDateString()} sortable />
          <Column field="status" header="STATUS" body={(r) => (
            <Tag 
              value={r.status} 
              severity={
                r.status === 'Pending' ? 'warning' :
                r.status === 'Approved' ? 'success' : 'danger'
              } 
              style={{ borderRadius: '6px' }} 
            />
          )} sortable />
          <Column header="ACTIONS" body={(r) => {
            const isPending = r.status === 'Pending';
            return isPending ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  icon="pi pi-check"
                  label="Approve"
                  className="p-button-success p-button-sm p-button-outlined"
                  style={{ borderRadius: '6px' }}
                  onClick={() => handleUpdateWithdrawalStatus(r._id, 'Approved')}
                />
                <Button
                  icon="pi pi-times"
                  label="Reject"
                  className="p-button-danger p-button-sm p-button-outlined"
                  style={{ borderRadius: '6px' }}
                  onClick={() => handleUpdateWithdrawalStatus(r._id, 'Rejected')}
                />
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Processed</span>
            );
          }} style={{ width: '220px' }} />
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

export default DeliveryManagement;
