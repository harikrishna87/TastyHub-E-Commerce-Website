import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Rating } from 'primereact/rating';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useSearchParams } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormatter';

interface Executive {
  _id: string;
  name: string;
  email: string;
  deliveryStatus: 'Pending' | 'Approved' | 'Rejected';
  isAvailable: boolean;
  createdAt: string;
  isActive?: boolean;
  image?: string;
  rating?: {
    rate: number;
    count: number;
  };
  dailyOrderCount?: number;
  performance?: 'High' | 'Medium' | 'Low';
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
  const toast = useRef<Toast>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profiles';
  const [partnerFilter, setPartnerFilter] = useState<string | null>(null);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [deliveryReviews, setDeliveryReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState<boolean>(false);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<WithdrawalRequest | null>(null);
  const [payoutDialogVisible, setPayoutDialogVisible] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<any>(null);

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

  const fetchDeliveryReviews = useCallback(async () => {
    if (!auth?.token) return;

    try {
      setLoadingReviews(true);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        withCredentials: true
      };

      const response = await axios.get(`${backendUrl}/api/reviews/delivery/admin/reviews`, config);
      if (response.data.success) {
        setDeliveryReviews(response.data.reviews || []);
      } else {
        console.warn(response.data.message || 'Failed to fetch reviews.');
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, [auth?.token, backendUrl]);

  useEffect(() => {
    fetchExecutives();
    fetchWithdrawalRequests();
    fetchDeliveryReviews();
  }, [fetchExecutives, fetchWithdrawalRequests, fetchDeliveryReviews]);

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
        toast.current?.show({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Executive application successfully ${status.toLowerCase()}!`
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Failed',
          detail: response.data.message || 'Failed to update status.'
        });
      }
    } catch (err: any) {
      console.error('Status update failed:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Failed to update status.'
      });
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
        toast.current?.show({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Withdrawal request successfully ${status.toLowerCase()}!`
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Failed',
          detail: response.data.message || 'Failed to update withdrawal request.'
        });
      }
    } catch (err: any) {
      console.error('Withdrawal update failed:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Failed to update withdrawal request.'
      });
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
        toast.current?.show({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Executive successfully ${isActive ? 'deactivated' : 'activated'}!`
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Failed',
          detail: response.data.message || `Failed to ${actionText} delivery executive.`
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || `Failed to ${actionText} delivery executive.`
      });
    } finally {
      setActionLoading(null);
    }
  };

  const ratingTemplate = (row: Executive) => {
    const rate = row.rating?.rate || 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Rating disabled cancel={false} value={Math.round(rate)} stars={5} style={{ color: '#f59e0b', fontSize: '12px' }} />
        <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}>
          {rate > 0 ? rate.toFixed(1) : '0.0'}
        </span>
      </div>
    );
  };

  const complaintCountTemplate = (row: Executive) => {
    const count = row.rating?.count || 0;
    if (count === 0) {
      return <span style={{ color: '#94a3b8', fontWeight: 500, paddingLeft: '8px' }}>0</span>;
    }
    return (
      <span
        style={{
          color: '#ef4444',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          textDecoration: 'underline',
          paddingLeft: '8px'
        }}
        title="Click to view complaints"
        onClick={() => {
          setPartnerFilter(row._id);
          setSearchParams({ tab: 'feedback' });
        }}
      >
        {count}
      </span>
    );
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
    
    return <Tag value={row.deliveryStatus} severity={severity} style={{ borderRadius: '6px' }} />;
  };

  const accountStatusTemplate = (row: Executive) => {
    const isActive = row.isActive !== false;
    return (
      <Tag value={isActive ? 'Active' : 'Deactivated'} severity={isActive ? 'success' : 'danger'} style={{ borderRadius: '6px' }} />
    );
  };

  const parsePaymentDetails = (details: string) => {
    if (!details) return null;
    return details.split(',').map((part, i) => {
      const parts = part.split(':');
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>{label}</span>
            <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>{value}</span>
          </div>
        );
      }
      return (
        <div key={i} style={{ padding: '0.65rem 0', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>
          {part.trim()}
        </div>
      );
    });
  };

  const getGroupedReviews = () => {
    // 1. Filter: rating < 3 (strictly below 3 stars)
    let filtered = deliveryReviews.filter(r => r.rating < 3);

    // 2. Filter by selected partner if set
    if (partnerFilter) {
      filtered = filtered.filter(r => r.deliveryExecutive?._id === partnerFilter);
    }

    // 3. Group by user._id
    const groups: { [key: string]: any[] } = {};
    filtered.forEach(r => {
      const userId = r.user?._id || 'unknown';
      if (!groups[userId]) {
        groups[userId] = [];
      }
      groups[userId].push(r);
    });

    // 4. Build displayedRows
    const displayedRows: any[] = [];
    Object.keys(groups).forEach(userId => {
      const userReviews = groups[userId];
      if (userReviews.length === 1) {
        // Flat row
        displayedRows.push({
          ...userReviews[0],
          isGroup: false
        });
      } else {
        // Group row
        const latest = userReviews[0]; // reviews are sorted by createdAt desc in backend
        displayedRows.push({
          _id: `group-${userId}`,
          isGroup: true,
          user: latest.user,
          feedbacks: userReviews,
          rating: Number((userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)),
          feedback: `Has submitted ${userReviews.length} complaints. Click to expand.`,
          isComplaint: true,
          createdAt: latest.createdAt,
          deliveryExecutive: { name: 'Multiple Partners' }
        });
      }
    });

    return displayedRows;
  };

  const rowExpansionTemplate = (data: any) => {
    return (
      <div style={{
        padding: '1.25rem 1.5rem 1.25rem 2.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
        position: 'relative'
      }}>
        <h4 style={{
          margin: '0 0 1.25rem 0',
          color: '#1e293b',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="pi pi-history" style={{ color: '#ef4444' }} />
          <span>Feedback History for {data.user?.name} ({data.feedbacks?.length} Complaints)</span>
        </h4>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.feedbacks?.map((r: any, idx: number) => {
            const isLast = idx === data.feedbacks.length - 1;
            return (
              <div key={idx} style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                
                {/* Curved Connector Line */}
                <div style={{
                  position: 'absolute',
                  left: '-15px',
                  top: '0px',
                  width: '15px',
                  height: '24px', // connects to the middle of the child row
                  borderLeft: '1.5px dashed #cbd5e1',
                  borderBottom: '1.5px dashed #cbd5e1',
                  borderBottomLeftRadius: '6px',
                  pointerEvents: 'none'
                }} />

                {/* Straight Vertical Line to continue to the next child */}
                {!isLast && (
                  <div style={{
                    position: 'absolute',
                    left: '-15px',
                    top: '24px',
                    bottom: '-12px', // bridges the gap to the next child item
                    width: '15px',
                    borderLeft: '1.5px dashed #cbd5e1',
                    pointerEvents: 'none'
                  }} />
                )}

                {/* Child Row Panel */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  {/* Delivery Partner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block', marginRight: '4px' }}>Partner:</span>
                    <img
                      src={r.deliveryExecutive?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                      alt="Partner"
                      style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #22c55e' }}
                      onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{r.deliveryExecutive?.name || 'N/A'}</span>
                  </div>

                  {/* Order Reference */}
                  <div style={{ minWidth: '110px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Order ID</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                      {r.order?._id ? `${r.order._id.substring(0, 8)}...` : 'N/A'}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div style={{ minWidth: '120px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Rating</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Rating disabled cancel={false} value={r.rating} stars={5} style={{ color: '#f59e0b', fontSize: '10px' }} />
                      <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#1e293b' }}>({r.rating})</span>
                    </div>
                  </div>

                  {/* Feedback Text comment */}
                  <div style={{ flex: '1 1 250px', minWidth: '220px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Feedback Description</span>
                    <span style={{ fontSize: '0.82rem', color: '#334155', fontStyle: 'italic', lineHeight: '1.4' }}>
                      "{r.feedback || 'No feedback details.'}"
                    </span>
                  </div>

                  {/* Submitted Date */}
                  <div style={{ minWidth: '120px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Submitted On</span>
                    <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const feedbackRowClassName = (data: any) => {
    return data.isGroup ? 'expandable-row' : 'non-expandable-row';
  };

  const availabilityTemplate = (row: Executive) => (
    row.deliveryStatus === 'Approved' ? (
      <Tag
        value={row.isAvailable ? 'Online' : 'Busy / Offline'}
        severity={row.isAvailable ? 'success' : 'secondary'}
        style={{ borderRadius: '6px' }}
      />
    ) : (
      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Not Approved</span>
    )
  );

  const performanceTemplate = (row: Executive) => {
    if (row.deliveryStatus !== 'Approved') {
      return <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>-</span>;
    }
    
    const count = row.dailyOrderCount || 0;
    const perf = row.performance || 'Low';
    
    let severity: "success" | "warning" | "danger" = 'danger';
    if (perf === 'High') severity = 'success';
    else if (perf === 'Medium') severity = 'warning';
    
    return (
      <Tag 
        value={`${perf} (${count})`} 
        severity={severity} 
        style={{ borderRadius: '6px', fontSize: '0.78rem', padding: '3px 8px', fontWeight: 700 }} 
      />
    );
  };

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
      <style>{`
        .non-expandable-row .p-row-toggler {
          display: none !important;
          pointer-events: none !important;
        }
      `}</style>
      <Toast ref={toast} />
      
      {activeTab === 'profiles' && (
        <>
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
              tableStyle={{ minWidth: '70rem' }}
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
              <Column field="isActive" header="ACCOUNT STATUS" body={accountStatusTemplate} sortable />
              <Column header="PARTNER RATING" body={ratingTemplate} sortable />
              <Column header="COMPLAINT COUNT" body={complaintCountTemplate} sortable field="rating.count" />
              <Column header="ONLINE STATUS" body={availabilityTemplate} />
              <Column field="performance" header="PERFORMANCE" body={performanceTemplate} sortable />
              <Column field="createdAt" header="APPLIED ON" body={(r) => formatDate(r.createdAt)} sortable />
              <Column header="DECISIONS" body={actionsTemplate} style={{ width: '220px' }} />
            </DataTable>
          </div>
        </>
      )}

      {activeTab === 'payouts' && (
        <>
          <div style={styles.header}>
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
              tableStyle={{ minWidth: '60rem' }}
              emptyMessage={() => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
                  <i className="pi pi-money-bill" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No withdrawal requests submitted yet.</div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Partner requests will appear here for payout clearance.</div>
                </div>
              )}
            >
              <Column field="deliveryExecutive.name" header="EXECUTIVE NAME" body={withdrawalExecutiveTemplate} style={{ fontWeight: 600, minWidth: '150px' }} sortable />
              <Column field="deliveryExecutive.email" header="EMAIL ADDRESS" sortable style={{ minWidth: '200px' }} />
              <Column field="amount" header="AMOUNT REQUESTED" body={(r) => <strong style={{ color: '#166534' }}>₹{r.amount.toFixed(2)}</strong>} sortable style={{ minWidth: '130px' }} />
              <Column 
                header="PAYMENT DETAILS" 
                style={{ minWidth: '140px' }}
                body={(r: WithdrawalRequest) => (
                  <Button 
                    label="View Details" 
                    icon="pi pi-info-circle" 
                    className="p-button-text p-button-link p-button-sm" 
                    style={{ background: 'transparent', border: 'none', color: '#15803d', fontWeight: 600, padding: 0, boxShadow: 'none' }} 
                    onClick={() => {
                      setSelectedPayout(r);
                      setPayoutDialogVisible(true);
                    }}
                  />
                )} 
              />
              <Column field="requestDate" header="REQUESTED ON" body={(r) => formatDate(r.requestDate)} sortable style={{ minWidth: '130px' }} />
              <Column field="status" header="STATUS" body={(r) => (
                <Tag 
                  value={r.status} 
                  severity={
                    r.status === 'Pending' ? 'warning' :
                    r.status === 'Approved' ? 'success' : 'danger'
                  } 
                  style={{ borderRadius: '6px' }} 
                />
              )} sortable style={{ minWidth: '100px' }} />
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
              }} style={{ minWidth: '200px' }} />
            </DataTable>
          </div>
        </>
      )}

      {activeTab === 'feedback' && (
        <>
          <div style={styles.header}>
            <h1 style={styles.title}>Delivery Feedback & Complaints Log</h1>
            <p style={styles.sub}>Monitor customer feedback, ratings, and flagged delivery complaints</p>
          </div>

          {partnerFilter && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              marginBottom: '1rem',
              color: '#1e40af',
              fontSize: '0.88rem',
              fontWeight: 500
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-filter" style={{ color: '#2563eb' }} />
                <span>Showing complaints for delivery partner: <strong>{executives.find(e => e._id === partnerFilter)?.name || 'Selected Partner'}</strong></span>
              </div>
              <Button
                label="Clear Filter"
                icon="pi pi-filter-slash"
                className="p-button-text p-button-sm"
                style={{ color: '#2563eb', padding: '2px 8px', fontWeight: 600, background: 'transparent', border: 'none', boxShadow: 'none' }}
                onClick={() => setPartnerFilter(null)}
              />
            </div>
          )}

          <div style={styles.tablePanel}>
            <DataTable
              value={getGroupedReviews()}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={rowExpansionTemplate}
              rowClassName={feedbackRowClassName}
              paginator
              rows={10}
              loading={loadingReviews}
              rowsPerPageOptions={[5, 10, 20]}
              className="p-datatable-striped"
              responsiveLayout="scroll"
              tableStyle={{ minWidth: '60rem' }}
              emptyMessage={() => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
                  <i className="pi pi-comments" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No partner feedback / negative complaints logged.</div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Only feedbacks with rating below 3 stars will display here.</div>
                </div>
              )}
            >
              <Column expander style={{ width: '3rem' }} />
              <Column header="CUSTOMER" body={(r) => {
                const userImg = r.user?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={userImg}
                      alt={r.user?.name || 'Customer'}
                      referrerPolicy="no-referrer"
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #3b82f6' }}
                      onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                    />
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.user?.name || 'N/A'}</span>
                  </div>
                );
              }} />
              <Column header="ORDER ID" body={(r) => {
                if (r.isGroup) {
                  return <span style={{ color: '#64748b', fontWeight: 600 }}>{r.feedbacks?.length} Orders</span>;
                }
                return r.order?._id ? `${r.order._id.substring(0, 8)}...` : 'N/A';
              }} />
              <Column header="RATING" body={(r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Rating disabled cancel={false} value={Math.round(r.rating)} stars={5} style={{ color: '#f59e0b', fontSize: '12px' }} />
                  <span style={{ fontWeight: 'bold', fontSize: '12px' }}>({r.rating})</span>
                </div>
              )} />
              <Column header="FEEDBACK TEXT" style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }} body={(r) => {
                if (r.isGroup) {
                  return <div style={{ fontWeight: 500, color: '#475569' }}>{r.feedback}</div>;
                }
                const partnerImg = r.deliveryExecutive?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ color: '#334155', fontStyle: 'italic' }}>"{r.feedback}"</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Partner:</span>
                      <img
                        src={partnerImg}
                        alt="Partner"
                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #22c55e' }}
                        onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                      />
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.deliveryExecutive?.name || 'N/A'}</span>
                    </div>
                  </div>
                );
              }} />
              <Column header="TYPE" body={() => (
                <Tag 
                  value="COMPLAINT" 
                  severity="danger" 
                  style={{ borderRadius: '6px' }} 
                />
              )} />
              <Column header="SUBMITTED ON" body={(r) => formatDate(r.createdAt)} />
            </DataTable>
          </div>
        </>
      )}
      {/* Payout Bank Details Modal */}
      <Dialog
        visible={payoutDialogVisible}
        onHide={() => {
          setPayoutDialogVisible(false);
          setSelectedPayout(null);
        }}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', width: '100%' }}>
            <i className="pi pi-credit-card" style={{ color: '#22c55e', fontSize: '1.25rem' }} />
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Payout Request & Bank Details</span>
          </div>
        }
        style={{ width: '450px', maxWidth: '95vw', borderRadius: '16px' }}
        modal
        dismissableMask
      >
        {selectedPayout && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Executive Profile Section - Flex row layout */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <img
                src={selectedPayout.deliveryExecutive?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                alt={selectedPayout.deliveryExecutive?.name || 'Executive'}
                referrerPolicy="no-referrer"
                style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #22c55e', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedPayout.deliveryExecutive?.name}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b', wordBreak: 'break-all' }}>
                  {selectedPayout.deliveryExecutive?.email}
                </span>
                
                {/* Payout details combined here */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
                    ₹{selectedPayout.amount.toFixed(2)}
                  </span>
                  <Tag 
                    value={selectedPayout.status} 
                    severity={
                      selectedPayout.status === 'Pending' ? 'warning' :
                      selectedPayout.status === 'Approved' ? 'success' : 'danger'
                    }
                    style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Bank details card */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Bank Account / UPI Details
              </h4>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.25rem 1rem' }}>
                {parsePaymentDetails(selectedPayout.paymentDetails)}
              </div>
            </div>

            {/* Date requested */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
              <span>Requested Date:</span>
              <span style={{ fontWeight: 600 }}>{formatDate(selectedPayout.requestDate)}</span>
            </div>

            {/* Actions for pending payouts in modal */}
            {selectedPayout.status === 'Pending' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <Button
                  label="Reject Payout"
                  icon="pi pi-times"
                  severity="danger"
                  outlined
                  onClick={() => {
                    handleUpdateWithdrawalStatus(selectedPayout._id, 'Rejected');
                    setPayoutDialogVisible(false);
                  }}
                  style={{ flex: 1, borderRadius: '8px' }}
                />
                <Button
                  label="Approve Payout"
                  icon="pi pi-check"
                  severity="success"
                  onClick={() => {
                    handleUpdateWithdrawalStatus(selectedPayout._id, 'Approved');
                    setPayoutDialogVisible(false);
                  }}
                  style={{ flex: 1, borderRadius: '8px', backgroundColor: '#22c55e', border: 'none', color: '#ffffff' }}
                />
              </div>
            )}
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
