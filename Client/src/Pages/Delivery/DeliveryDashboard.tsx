import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

// PrimeReact UI Components
import { InputSwitch } from 'primereact/inputswitch';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { formatDate } from '../../utils/dateFormatter';

const customStyles = `
  .delivery-layout-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    backgroundColor: #f8fafc;
    font-family: 'Inter', 'Outfit', sans-serif;
    overflow-x: hidden;
  }
  .delivery-sidebar {
    width: 260px;
    background-color: #ffffff;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
  }
  .delivery-logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
    padding-left: 0.5rem;
  }
  .delivery-logo-img {
    height: 36px;
    width: 36px;
    object-fit: contain;
  }
  .delivery-logo-text {
    font-size: 1.4rem;
    font-weight: 800;
    color: #15803d;
    letter-spacing: -0.5px;
  }
  .delivery-nav-section {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }
  .delivery-nav-link {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: 100% !important;
    gap: 1.25rem !important;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    text-decoration: none;
    color: #64748b;
    font-size: 0.92rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background-color: transparent;
    text-align: left;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .delivery-nav-link span {
    display: inline-block !important;
    line-height: 1.2 !important;
  }
  .delivery-nav-link:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }
  .delivery-nav-link.active {
    color: #15803d;
    background-color: #dcfce7;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.08);
    transform: translateY(-1px);
  }
  .delivery-nav-icon {
    font-size: 1.1rem;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    margin-right: 0.5rem !important;
    transition: color 0.25s ease;
  }
  .delivery-nav-link.active .delivery-nav-icon {
    color: #15803d;
  }
  .delivery-nav-link:not(.active) .delivery-nav-icon {
    color: #94a3b8;
  }
  .delivery-logout-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 1.25rem !important;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    border: none;
    background-color: transparent;
    color: #ef4444;
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
    width: 100% !important;
    text-align: left;
    margin-top: auto;
    transition: all 0.2s ease;
  }
  .delivery-logout-btn span {
    display: inline-block !important;
    line-height: 1.2 !important;
  }
  .delivery-logout-btn:hover {
    background-color: #fef2f2;
  }
  .delivery-main-side {
    margin-left: 260px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: calc(100% - 260px);
    min-width: 0;
    background-color: #f8fafc;
  }
  .delivery-header {
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 1.25rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    left: 260px;
    height: 75px;
    z-index: 90;
    box-shadow: 0 2px 8px rgba(0,0,0,0.01);
  }
  .delivery-greeting-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  .delivery-time-block {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-top: 0.2rem;
  }
  .delivery-clock-icon {
    font-size: 0.85rem;
    color: #15803d;
  }
  .delivery-time-text {
    font-size: 0.85rem;
    font-weight: 600;
    color: #15803d;
  }
  .delivery-divider {
    color: #cbd5e1;
    font-size: 0.85rem;
  }
  .delivery-date-text {
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
  }
  .delivery-header-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  .delivery-profile-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-left: 1px solid #e2e8f0;
    padding-left: 1.5rem;
  }
  .delivery-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #15803d;
  }
  .delivery-meta {
    display: flex;
    flex-direction: column;
  }
  .delivery-role {
    font-size: 0.85rem;
    font-weight: 700;
    color: #0f172a;
  }
  .delivery-email {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.05rem;
  }
  .delivery-content-body {
    padding: 2rem;
    padding-top: calc(75px + 2rem);
    flex: 1;
    overflow-y: auto;
  }
  .premium-metric-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .premium-metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
    border-color: rgba(21, 128, 61, 0.2);
  }
  .premium-metric-icon {
    font-size: 2.2rem;
    padding: 12px;
    border-radius: 12px;
  }
  .p-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
  }
  
  /* Custom sequential stepper styles */
  .workflow-stepper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1.25rem 0.5rem;
    margin-bottom: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
  }
  .workflow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
    z-index: 2;
  }
  .workflow-step-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #cbd5e1;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.95rem;
    border: 3px solid #ffffff;
    transition: all 0.3s ease;
  }
  .workflow-step.active .workflow-step-circle {
    background-color: #15803d;
    color: #ffffff;
    box-shadow: 0 0 0 4px rgba(21, 128, 61, 0.15);
  }
  .workflow-step.completed .workflow-step-circle {
    background-color: #22c55e;
    color: #ffffff;
  }
  .workflow-step-label {
    margin-top: 0.5rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748b;
    text-align: center;
  }
  .workflow-step.active .workflow-step-label {
    color: #15803d;
  }
  .workflow-step.completed .workflow-step-label {
    color: #22c55e;
  }
  .workflow-connector {
    position: absolute;
    top: 38px;
    left: 10%;
    right: 10%;
    height: 3px;
    background-color: #e2e8f0;
    z-index: 1;
  }
  .workflow-connector-progress {
    height: 100%;
    background-color: #22c55e;
    transition: width 0.3s ease;
  }
`;

const DeliveryDashboard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'new-orders' | 'active-transits' | 'earnings' | 'profile'>('overview');

  // Logistics state
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  
  // Filtered views
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const toastRef = useRef<Toast>(null);

  const message = {
    success: (opts: { content: string, duration?: number }) => {
      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: opts.content,
        life: (opts.duration || 4) * 1000
      });
    },
    error: (opts: { content: string, duration?: number }) => {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: opts.content,
        life: (opts.duration || 4) * 1000
      });
    },
    warning: (opts: { content: string, duration?: number }) => {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: opts.content,
        life: (opts.duration || 4) * 1000
      });
    }
  };

  const [isOnline, setIsOnline] = useState<boolean>(false);

  // Cash collection prompt modal state
  const [codDialogVisible, setCodDialogVisible] = useState<boolean>(false);
  const [codOrderToDeliver, setCodOrderToDeliver] = useState<any>(null);
  const [codChecked, setCodChecked] = useState<boolean>(false);

  // Time & Greeting states
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Good Morning');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Retrieve details
  const deName = authContext?.user?.name || 'Logistics Executive';
  const deEmail = authContext?.user?.email || 'carrier@tastyhub.com';

  const [profileImage, setProfileImage] = useState<string>(
    authContext?.user?.image || 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png'
  );

  useEffect(() => {
    if (authContext?.user?.image) {
      setProfileImage(authContext.user.image);
    }
  }, [authContext?.user?.image]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = authContext?.token || localStorage.getItem('token');
      const res = await axios.post(
        `${backendUrl}/api/auth/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      if (res.data.success) {
        message.success({
          content: 'Profile image updated successfully! 📸',
          duration: 4
        });
        
        const updatedImage = res.data.user?.image || res.data.image;
        if (updatedImage) {
          setProfileImage(updatedImage);
          if (authContext?.user) {
            authContext.user.image = updatedImage;
            localStorage.setItem('user', JSON.stringify(authContext.user));
          }
        }
        await fetchDashboardData(true);
      }
    } catch (err: any) {
      message.error({
        content: err.response?.data?.message || 'Failed to upload profile image.',
        duration: 4
      });
    }
  };

  // Wallet & Withdrawal states
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState<boolean>(false);
  const [withdrawDialogVisible, setWithdrawDialogVisible] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [accountantName, setAccountantName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState<boolean>(false);

  // Tracking Dialog states
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [trackingVisible, setTrackingVisible] = useState<boolean>(false);

  const fetchWithdrawals = useCallback(async () => {
    const token = authContext?.token || localStorage.getItem('token');
    if (!token) return;
    try {
      setLoadingWithdrawals(true);
      const res = await axios.get(`${backendUrl}/api/delivery/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (res.data.success) {
        setWithdrawals(res.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal requests:', err);
    } finally {
      setLoadingWithdrawals(false);
    }
  }, [authContext?.token, backendUrl]);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    const token = authContext?.token || localStorage.getItem('token');
    if (!token) return;
    try {
      if (!isSilent) {
        setLoading(true);
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Get Duty Profile Availability & Wallet Balance
      try {
        const meRes = await axios.get(`${backendUrl}/api/auth/getme`, { headers, withCredentials: true });
        if (meRes.data.success) {
          setIsOnline(meRes.data.user.isAvailable || false);
          setProfileImage(meRes.data.user.image || 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png');
        }
      } catch (err) {
        console.error('Failed to sync profile status:', err);
      }

      // Fetch withdrawals to sync withdrawable calculations
      try {
        const res = await axios.get(`${backendUrl}/api/delivery/withdrawals`, { headers, withCredentials: true });
        if (res.data.success) {
          setWithdrawals(res.data.requests || []);
        }
      } catch (err) {
        console.error('Failed to fetch withdrawal requests:', err);
      }

      // Fetch Available Restaurant orders (Pending & Executive-less)
      try {
        const avRes = await axios.get(`${backendUrl}/api/delivery/orders/available`, { headers, withCredentials: true });
        if (avRes.data.success) {
          setAvailableOrders(avRes.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to fetch available orders:', err);
      }

      // Fetch All orders assigned to this executive (both active and completed)
      try {
        const acRes = await axios.get(`${backendUrl}/api/delivery/orders/my-accepted`, { headers, withCredentials: true });
        if (acRes.data.success) {
          const list = acRes.data.orders || [];
          setAllOrders(list);
          
          // Dynamically split in-flight transit vs historical delivered on client
          const active = list.filter((o: any) => o.deliveryStatus !== 'Delivered');
          const completed = list.filter((o: any) => o.deliveryStatus === 'Delivered');
          
          setActiveOrders(active);
          setCompletedOrders(completed);
        }
      } catch (err) {
        console.error('Failed to fetch accepted orders:', err);
      }
    } catch (err) {
      console.error('Failed to sync carrier terminal logistics:', err);
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, [authContext?.token, backendUrl]);

  useEffect(() => {
    if (activeTab === 'earnings') {
      fetchWithdrawals();
    }
  }, [activeTab, fetchWithdrawals]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    fetchDashboardData();

    // Clock ticker implementation
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateStr(formatDate(now));
      
      const hrs = now.getHours();
      if (hrs < 12) setGreeting('Good Morning');
      else if (hrs < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    const pollInterval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => {
      document.head.removeChild(styleElement);
      clearInterval(interval);
      clearInterval(pollInterval);
    };
  }, [fetchDashboardData]);

  const handleToggleOnline = async (checked: boolean) => {
    try {
      const token = authContext?.token || localStorage.getItem('token');
      const res = await axios.put(
        `${backendUrl}/api/auth/updateprofile`,
        { isAvailable: checked },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (res.data.success) {
        setIsOnline(checked);
        message.success({
          content: `Status updated! You are now ${checked ? 'ONLINE and ready for carrier duties 🟢' : 'OFFLINE 🔴'}`,
          duration: 4
        });
        fetchDashboardData(true);
      }
    } catch (err) {
      message.error({
        content: 'Failed to update carrier duty status.',
        duration: 4
      });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: true }));
      const token = authContext?.token || localStorage.getItem('token');
      const res = await axios.patch(
        `${backendUrl}/api/delivery/orders/${orderId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (res.data.success) {
        message.success({
          content: 'Order accepted! Navigating to kitchen dispatch immediately 🛵',
          duration: 4
        });
        
        // Optimistically/instantly update client state
        const acceptedOrder = res.data.order;
        if (acceptedOrder) {
          // Remove from available orders
          setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
          // Add to allOrders and activeOrders
          setAllOrders(prev => [acceptedOrder, ...prev.filter(o => o._id !== orderId)]);
          setActiveOrders(prev => [acceptedOrder, ...prev.filter(o => o._id !== orderId)]);
          // Sync tracking state
          setTrackingOrder(acceptedOrder);
        }
        
        await fetchDashboardData(true);
        setActiveTab('active-transits');
      }
    } catch (err: any) {
      message.error({
        content: err.response?.data?.message || 'Failed to accept order.',
        duration: 4
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: string, paymentMethod: string, totalAmount: number, customerName: string) => {
    // Determine next sequential state in order status workflow
    let nextStatus = '';
    if (currentStatus === 'Accepted') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Pickup';
    else if (currentStatus === 'Pickup') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery' || currentStatus === 'Shipped') nextStatus = 'Delivered';

    if (!nextStatus) return;

    // Cash on Delivery checks: require DE to explicitly confirm cash collected from customer
    if (nextStatus === 'Delivered' && paymentMethod === 'cod') {
      setCodOrderToDeliver({ orderId, totalAmount, customerName });
      setCodChecked(false);
      setCodDialogVisible(true);
      return;
    }

    // Direct transition for online payments or non-final states
    await executeStatusTransition(orderId, nextStatus);
  };

  const executeStatusTransition = async (orderId: string, status: string, confirmCodCollected?: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: true }));
      const token = authContext?.token || localStorage.getItem('token');
      
      const payload: any = { status };
      if (confirmCodCollected) {
        payload.confirmCodCollected = true;
      }

      const res = await axios.patch(
        `${backendUrl}/api/delivery/orders/${orderId}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (res.data.success) {
        message.success({
          content: `Status advanced to: ${status} successfully! 🎉`,
          duration: 4
        });
        
        // Optimistically/instantly update client state
        const updatedOrder = res.data.order;
        if (updatedOrder) {
          setAllOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
          
          if (status === 'Delivered') {
            setActiveOrders(prev => prev.filter(o => o._id !== orderId));
            setCompletedOrders(prev => [updatedOrder, ...prev.filter(o => o._id !== orderId)]);
          } else {
            setActiveOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
          }
          // Sync tracking state in real-time
          setTrackingOrder(updatedOrder);
        }
        
        await fetchDashboardData(true);
      }
    } catch (err: any) {
      message.error({
        content: err.response?.data?.message || 'Failed to update order status.',
        duration: 4
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
      setCodDialogVisible(false);
      setCodOrderToDeliver(null);
    }
  };

  const handleConfirmCodDelivery = () => {
    if (!codChecked) {
      message.warning({
        content: 'Please check the verification box confirming physical cash collection!',
        duration: 4
      });
      return;
    }
    if (codOrderToDeliver) {
      executeStatusTransition(codOrderToDeliver.orderId, 'Delivered', true);
    }
  };

  const handleRequestWithdrawalSubmit = async () => {
    const amountNum = Number(withdrawAmount);
    if (!withdrawAmount || amountNum < 100) {
      message.error({ content: 'Minimum withdrawal amount is ₹100.', duration: 4 });
      return;
    }
    if (amountNum > withdrawableBalance) {
      message.error({ content: `Withdrawal amount cannot exceed available balance of ₹${withdrawableBalance}.`, duration: 4 });
      return;
    }
    if (!accountantName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      message.error({ content: 'Please fill in all bank details (Accountant Name, Account Number, and IFSC Code).', duration: 4 });
      return;
    }

    const combinedDetails = `Accountant Name: ${accountantName.trim()}, A/C No: ${accountNumber.trim()}, IFSC Code: ${ifscCode.trim()}`;

    try {
      setSubmittingWithdrawal(true);
      const token = authContext?.token || localStorage.getItem('token');
      const res = await axios.post(
        `${backendUrl}/api/delivery/withdraw`,
        { amount: amountNum, paymentDetails: combinedDetails },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (res.data.success) {
        message.success({
          content: 'Withdrawal request submitted successfully! 💸',
          duration: 4
        });
        setWithdrawDialogVisible(false);
        setWithdrawAmount('');
        setAccountantName('');
        setAccountNumber('');
        setIfscCode('');
        await fetchDashboardData(true);
        await fetchWithdrawals();
      }
    } catch (err: any) {
      message.error({
        content: err.response?.data?.message || 'Failed to submit withdrawal request.',
        duration: 4
      });
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleLogout = async () => {
    if (authContext?.logout) {
      await authContext.logout();
    }
    navigate('/');
  };

  if (loading && allOrders.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', backgroundColor: '#f8fafc', color: '#15803d' }}>
        <i className="pi pi-spinner pi-spin" style={{ fontSize: '2.5rem', color: '#15803d' }} />
        <p style={{ marginTop: '16px', color: '#15803d', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>Syncing carrier terminal logistics...</p>
      </div>
    );
  }

  // Calculate today's earnings sum based on standard 30 rupees flat commission rate
  const totalCompletedDeliveries = completedOrders.length;
  const totalEarnings = totalCompletedDeliveries * 30;

  // Calculate withdrawable balance dynamically:
  // Lifetime Earnings minus the sum of withdrawal requests that are Pending or Approved
  const withdrawnOrPendingAmount = withdrawals
    .filter((w: any) => w.status === 'Pending' || w.status === 'Approved')
    .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

  const withdrawableBalance = Math.max(0, totalEarnings - withdrawnOrPendingAmount);

  // Calculate percentage of progress in sequential stepper matching current active order's state
  const getStepperWidth = (status: string) => {
    if (status === 'Accepted') return '0%';
    if (status === 'Preparing') return '25%';
    if (status === 'Pickup') return '50%';
    if (status === 'Out for Delivery' || status === 'Shipped') return '75%';
    if (status === 'Delivered') return '100%';
    return '0%';
  };

  return (
    <div className="delivery-layout-container">
      <Toast ref={toastRef} />
      {/* Sidebar navigation panel */}
      <aside className="delivery-sidebar">
        <div className="delivery-logo-section">
          <img src="/logo.png" alt="TastyHub Logo" className="delivery-logo-img" onError={(e)=>{(e.target as any).src='https://primefaces.org/cdn/primereact/images/logo.png'}} />
          <span className="delivery-logo-text">TastyHub</span>
        </div>

        <nav className="delivery-nav-section">
          <button 
            className={`delivery-nav-link ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('overview'); fetchDashboardData(true); }}
          >
            <i className="pi pi-home delivery-nav-icon" />
            <span>Overview</span>
          </button>
          
          <button 
            className={`delivery-nav-link ${activeTab === 'new-orders' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('new-orders'); fetchDashboardData(true); }}
          >
            <i className="pi pi-bell delivery-nav-icon" />
            <span>New Orders ({availableOrders.length})</span>
          </button>

          <button 
            className={`delivery-nav-link ${activeTab === 'active-transits' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('active-transits'); fetchDashboardData(true); }}
          >
            <i className="pi pi-map-marker delivery-nav-icon" />
            <span>Active Transits ({activeOrders.length})</span>
          </button>

          <button 
            className={`delivery-nav-link ${activeTab === 'earnings' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('earnings'); fetchDashboardData(true); }}
          >
            <i className="pi pi-wallet delivery-nav-icon" />
            <span>Payout History</span>
          </button>

          <button 
            className={`delivery-nav-link ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('profile'); fetchDashboardData(true); }}
          >
            <i className="pi pi-user delivery-nav-icon" />
            <span>Duty Profile</span>
          </button>
        </nav>

        <button onClick={handleLogout} className="delivery-logout-btn">
          <i className="pi pi-sign-out" />
          <span>End Duty</span>
        </button>
      </aside>

      {/* Main workspace container */}
      <div className="delivery-main-side">
        {/* Top header navigation */}
        <header className="delivery-header">
          <div>
            <h1 className="delivery-greeting-title">
              {greeting}, <span style={{ color: '#15803d', fontWeight: 'bold' }}>{deName}</span>!
            </h1>
            <div className="delivery-time-block">
              <i className="pi pi-clock delivery-clock-icon" />
              <span className="delivery-time-text">{timeStr}</span>
              <span className="delivery-divider">|</span>
              <span className="delivery-date-text">{dateStr}</span>
            </div>
          </div>

          <div className="delivery-header-right">
            {/* Real-time online quick status display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isOnline ? '#dcfce7' : '#fee2e2', padding: '6px 12px', borderRadius: '20px', border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}` }}>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: isOnline ? '#22c55e' : '#ef4444', display: 'inline-block' }}></span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isOnline ? '#15803d' : '#991b1b' }}>
                {isOnline ? 'DUTY ONLINE' : 'DUTY OFFLINE'}
              </span>
            </div>

            <div className="delivery-profile-card">
              <img 
                src={profileImage} 
                alt="Delivery Partner Profile" 
                className="delivery-avatar"
                onError={(e) => { (e.target as any).src = 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png'; }}
              />
              <div className="delivery-meta">
                <div className="delivery-role">Carrier Executive</div>
                <div className="delivery-email">{deEmail}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content body workspace switcher */}
        <main className="delivery-content-body">
          
          {/* TAB 1: OVERVIEW PAGE */}
          {activeTab === 'overview' && (
            <div>
              {/* Premium Gradient Banner */}
              <div style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', borderRadius: '20px', padding: '2rem', color: '#ffffff', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(21, 128, 61, 0.1)' }}>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Carrier Operations Desk</h2>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.85, fontSize: '0.95rem', fontWeight: 500 }}>
                  Manage client distributions, active transits, and track direct delivery earnings.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <Button 
                    label="List Available Orders" 
                    icon="pi pi-bell" 
                    className="p-button-outlined p-button-sm" 
                    style={{ color: '#ffffff', borderColor: '#ffffff', borderRadius: '8px' }}
                    onClick={() => { setActiveTab('new-orders'); fetchDashboardData(true); }} 
                  />
                  <Button 
                    label="View My Transits" 
                    icon="pi pi-map-marker" 
                    className="p-button-sm" 
                    style={{ backgroundColor: '#ffffff', color: '#15803d', border: 'none', borderRadius: '8px', fontWeight: 700 }}
                    onClick={() => { setActiveTab('active-transits'); fetchDashboardData(true); }} 
                  />
                </div>
              </div>

              {/* Metrics Panels */}
              <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="premium-metric-card">
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Transits</span>
                    <h3 style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 0 0' }}>{activeOrders.length}</h3>
                  </div>
                  <i className="pi pi-map-marker premium-metric-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }} />
                </div>

                <div className="premium-metric-card">
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Completed</span>
                    <h3 style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 0 0' }}>{totalCompletedDeliveries}</h3>
                  </div>
                  <i className="pi pi-check-circle premium-metric-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }} />
                </div>

                <div className="premium-metric-card">
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earned Balance</span>
                    <h3 style={{ color: '#15803d', fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 0 0' }}>₹{totalEarnings}</h3>
                  </div>
                  <i className="pi pi-wallet premium-metric-icon" style={{ backgroundColor: '#fef9c3', color: '#eab308' }} />
                </div>

                <div className="premium-metric-card">
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>flat commission</span>
                    <h3 style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 0 0' }}>₹30 / Del</h3>
                  </div>
                  <i className="pi pi-tag premium-metric-icon" style={{ backgroundColor: '#faf5ff', color: '#a855f7' }} />
                </div>
              </div>

              {/* Brief Quick Overview List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><i className="pi pi-list" style={{ color: '#15803d' }}></i><span>Current Transit Summary</span></div>} style={{ borderRadius: '16px' }}>
                  {activeOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
                      <i className="pi pi-box" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: '#cbd5e1' }} />
                      <p style={{ margin: 0 }}>No active transits currently. Check new orders or duty statuses!</p>
                    </div>
                  ) : (
                    <div>
                      {activeOrders.slice(0, 2).map((order) => (
                        <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{order.user?.name || 'Customer'}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>City: {order.shippingAddress?.city || 'Nellore'} | Bill: ₹{order.totalAmount}</span>
                          </div>
                          <Tag 
                            value={order.deliveryStatus} 
                            severity={order.deliveryStatus === 'Accepted' ? 'info' : 'warning'} 
                            style={{ borderRadius: '6px' }}
                          />
                        </div>
                      ))}
                      <Button 
                        label="Manage Full Transits" 
                        icon="pi pi-arrow-right" 
                        className="p-button-text p-button-sm p-button-success" 
                        style={{ marginTop: '1rem', padding: 0 }}
                        onClick={() => { setActiveTab('active-transits'); fetchDashboardData(true); }}
                      />
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: NEW ORDERS PAGE */}
          {activeTab === 'new-orders' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Available Kitchen Dispatches</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Claim food delivery distributions waiting in your service area.</p>
              </div>

              {!isOnline ? (
                <Card style={{ borderRadius: '16px', border: '1px dashed #ef4444', textAlign: 'center', padding: '3rem 1rem' }}>
                  <i className="pi pi-exclamation-triangle" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }} />
                  <h3 style={{ margin: 0, color: '#ef4444', fontWeight: 800 }}>Carrier Terminal Offline</h3>
                  <p style={{ maxWidth: '400px', margin: '8px auto 1.5rem auto', color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Your carrier profile is set as OFFLINE. Toggle your status switch to ONLINE under Duty Profile or top header to start listening to real-time restaurant orders.
                  </p>
                  <Button 
                    label="Go to Duty Profile" 
                    icon="pi pi-user" 
                    className="p-button-success"
                    style={{ borderRadius: '8px' }}
                    onClick={() => { setActiveTab('profile'); fetchDashboardData(true); }} 
                  />
                </Card>
              ) : availableOrders.length === 0 ? (
                <Card style={{ borderRadius: '16px', textAlign: 'center', padding: '4rem 1rem' }}>
                  <i className="pi pi-inbox" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <h3 style={{ margin: 0, color: '#475569', fontWeight: 700 }}>No Available Dispatches</h3>
                  <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    Kitchens are preparing gourmet delicacies. Active listings will render here instantly once dispatched!
                  </p>
                </Card>
              ) : (
                <Card style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <DataTable 
                    value={availableOrders} 
                    paginator 
                    rows={8} 
                    emptyMessage="No available dispatches at the moment."
                    responsiveLayout="scroll"
                    style={{ fontSize: '0.88rem' }}
                  >
                    <Column 
                      header="Order Reference" 
                      body={(o) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{o._id.substring(0, 10)}</span>} 
                    />
                    <Column 
                      header="Customer" 
                      body={(o) => <span>{o.user?.name || 'Customer'}</span>} 
                    />
                    <Column 
                      header="Items" 
                      body={(o) => (
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                          {o.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}
                        </span>
                      )} 
                    />
                    <Column 
                      header="Bill Value" 
                      body={(o) => <span style={{ fontWeight: 600 }}>₹{o.totalAmount.toFixed(2)}</span>} 
                    />
                    <Column 
                      header="Payment Mode" 
                      body={(o) => <Tag value={o.paymentMethod?.toUpperCase()} severity={o.paymentMethod === 'cod' ? 'danger' : 'success'} style={{ borderRadius: '4px' }} />} 
                    />
                    <Column 
                      header="Actions" 
                      body={(o) => (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button 
                            icon="pi pi-check" 
                            label="Accept"
                            loading={actionLoading[o._id]}
                            className="p-button-success p-button-sm"
                            style={{ borderRadius: '6px' }}
                            onClick={() => handleAcceptOrder(o._id)}
                          />
                          <Button 
                            icon="pi pi-eye" 
                            label="Details"
                            className="p-button-secondary p-button-sm"
                            style={{ borderRadius: '6px' }}
                            onClick={() => {
                              setTrackingOrder(o);
                              setTrackingVisible(true);
                            }}
                          />
                        </div>
                      )} 
                    />
                  </DataTable>
                </Card>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVE TRANSITS PAGE */}
          {activeTab === 'active-transits' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Active Carriers Transit ({activeOrders.length})</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Perform sequential logistics stages and complete dining deliveries.</p>
              </div>

              {activeOrders.length === 0 ? (
                <Card style={{ borderRadius: '16px', textAlign: 'center', padding: '4rem 1rem' }}>
                  <i className="pi pi-map" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <h3 style={{ margin: 0, color: '#475569', fontWeight: 700 }}>No Active Transits</h3>
                  <p style={{ margin: '8px 0 1.5rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                    You have not accepted any kitchen dispatch orders yet. View outstanding orders to accept them.
                  </p>
                  <Button 
                    label="View Available Orders" 
                    icon="pi pi-bell" 
                    className="p-button-success"
                    style={{ borderRadius: '8px' }}
                    onClick={() => { setActiveTab('new-orders'); fetchDashboardData(true); }} 
                  />
                </Card>
              ) : (
                <Card style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <DataTable 
                    value={activeOrders} 
                    paginator 
                    rows={8} 
                    emptyMessage="You have no active transits. View available kitchen dispatches to accept them."
                    responsiveLayout="scroll"
                    style={{ fontSize: '0.88rem' }}
                  >
                    <Column 
                      header="Order Reference" 
                      body={(o) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{o._id.substring(0, 10)}</span>} 
                    />
                    <Column 
                      header="Customer" 
                      body={(o) => <span>{o.user?.name || 'Customer'}</span>} 
                    />
                    <Column 
                      header="Items" 
                      body={(o) => (
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                          {o.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}
                        </span>
                      )} 
                    />
                    <Column 
                      header="Current Stage" 
                      body={(o) => (
                        <Tag 
                          value={o.deliveryStatus === 'Shipped' ? 'OUT FOR DELIVERY' : o.deliveryStatus?.toUpperCase()} 
                          severity={
                            o.deliveryStatus === 'Accepted' ? 'info' :
                            o.deliveryStatus === 'Preparing' ? 'warning' :
                            o.deliveryStatus === 'Pickup' ? 'secondary' : 'success'
                          } 
                          style={{ borderRadius: '4px', fontWeight: 800 }} 
                        />
                      )} 
                    />
                    <Column 
                      header="Payment Mode" 
                      body={(o) => <Tag value={o.paymentMethod?.toUpperCase()} severity={o.paymentMethod === 'cod' ? 'danger' : 'success'} style={{ borderRadius: '4px' }} />} 
                    />
                    <Column 
                      header="Action" 
                      body={(o) => (
                        <Button 
                          icon="pi pi-directions" 
                          label="Track & Update"
                          className="p-button-info p-button-sm"
                          style={{ borderRadius: '6px' }}
                          onClick={() => {
                            setTrackingOrder(o);
                            setTrackingVisible(true);
                          }}
                        />
                      )} 
                    />
                  </DataTable>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: PAYOUT HISTORY PAGE */}
          {/* TAB 4: PAYOUT HISTORY PAGE */}
          {activeTab === 'earnings' && (
            <div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Payout & Commission Records</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Check detailed billing settlements, wallet balances, and withdrawal histories.</p>
                </div>
                <Button 
                  label="Request Withdrawal" 
                  icon="pi pi-money-bill"
                  disabled={withdrawableBalance <= 0}
                  className="p-button-success"
                  style={{ borderRadius: '10px', fontWeight: 700 }}
                  onClick={() => {
                    setWithdrawAmount(withdrawableBalance);
                    setAccountantName('');
                    setAccountNumber('');
                    setIfscCode('');
                    setWithdrawDialogVisible(true);
                  }}
                />
              </div>

              {/* Earnings summary stats card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <i className="pi pi-check-circle" style={{ fontSize: '2rem', color: '#22c55e', background: '#f0fdf4', padding: '10px', borderRadius: '8px' }} />
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Lifetime Deliveries</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{totalCompletedDeliveries} completed</span>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <i className="pi pi-wallet" style={{ fontSize: '2rem', color: '#eab308', background: '#fef9c3', padding: '10px', borderRadius: '8px' }} />
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Lifetime Earnings</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>₹{totalEarnings}</span>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <i className="pi pi-money-bill" style={{ fontSize: '2rem', color: '#22c55e', background: '#f0fdf4', padding: '10px', borderRadius: '8px' }} />
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Available to Withdraw</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534' }}>₹{withdrawableBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Grid of Two Tables */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Left: Deliveries list */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Historical Deliveries</h3>
                  <Card style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <DataTable 
                      value={completedOrders} 
                      paginator 
                      rows={5} 
                      emptyMessage="No completed transits available yet."
                      responsiveLayout="scroll"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <Column 
                        header="Reference" 
                        body={(o) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{o._id.substring(0, 8)}</span>} 
                      />
                      <Column 
                        header="Delivered Date" 
                        body={(o) => <span>{formatDate(o.updatedAt || o.createdAt)}</span>} 
                      />
                      <Column 
                        header="Bill" 
                        body={(o) => <span style={{ fontWeight: 600 }}>₹{o.totalAmount.toFixed(2)}</span>} 
                      />
                      <Column 
                        header="Payout" 
                        body={() => <span style={{ color: '#15803d', fontWeight: 700 }}>+ ₹30.00</span>} 
                      />
                    </DataTable>
                  </Card>
                </div>

                {/* Right: Withdrawals list */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Withdrawal Requests</h3>
                  <Card style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <DataTable 
                      value={withdrawals} 
                      paginator 
                      rows={5} 
                      loading={loadingWithdrawals}
                      emptyMessage="No withdrawal requests submitted yet."
                      responsiveLayout="scroll"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <Column 
                        header="Date" 
                        body={(w) => <span>{formatDate(w.requestDate)}</span>} 
                      />
                      <Column 
                        header="Payment Details" 
                        body={(w) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{w.paymentDetails}</span>} 
                      />
                      <Column 
                        header="Status" 
                        body={(w) => (
                          <Tag 
                            value={w.status?.toUpperCase()} 
                            severity={
                              w.status === 'Pending' ? 'warning' :
                              w.status === 'Approved' ? 'success' : 'danger'
                            } 
                            style={{ borderRadius: '4px' }} 
                          />
                        )} 
                      />
                      <Column 
                        header="Amount" 
                        body={(w) => <span style={{ fontWeight: 700 }}>₹{w.amount.toFixed(2)}</span>} 
                      />
                    </DataTable>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DUTY PROFILE PAGE */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Executive Duty Profile</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Control your logistics availability and carrier dashboard preferences.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* General profile information card */}
                <Card style={{ borderRadius: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem 0' }}>
                    <img 
                      src={profileImage} 
                      alt="Delivery Partner avatar" 
                      style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #15803d', marginBottom: '1rem' }}
                      onError={(e) => { (e.target as any).src = 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png'; }}
                    />
                    <input 
                      type="file" 
                      id="avatarUpload" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      style={{ display: 'none' }} 
                    />
                    <label htmlFor="avatarUpload" className="p-button p-button-sm p-button-outlined p-button-success" style={{ cursor: 'pointer', borderRadius: '8px', marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <i className="pi pi-camera" style={{ fontSize: '0.9rem' }}></i>
                      <span>Upload Profile Photo</span>
                    </label>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{deName}</h3>
                    <Tag value="APPROVED PARTNER" severity="success" style={{ borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px' }} />
                    
                    <Divider style={{ margin: '20px 0', width: '100%' }} />

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Account Email:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{deEmail}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Authorized Role:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>Delivery Executive</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Carrier Scheme:</span>
                        <span style={{ fontWeight: 600, color: '#15803d' }}>₹30 Commissions Flat</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Duty Switch Availability Controller */}
                <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><i className="pi pi-cog" style={{ color: '#15803d' }}></i><span>Duty Operations Control</span></div>} style={{ borderRadius: '16px' }}>
                  <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', display: 'block' }}>LOGISTICS ONLINE SWITCH</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', display: 'block', maxWidth: '240px' }}>
                          Toggle this switch to signal restaurants that you are online and ready to accept gourmet dining orders.
                        </span>
                      </div>
                      <InputSwitch 
                        checked={isOnline} 
                        onChange={(e) => handleToggleOnline(e.value || false)} 
                      />
                    </div>

                    <Divider style={{ margin: '15px 0' }} />

                    <div style={{ background: isOnline ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isOnline ? '#dcfce7' : '#fee2e2'}`, padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontWeight: 700, color: isOnline ? '#15803d' : '#ef4444', fontSize: '0.85rem', display: 'block' }}>
                        {isOnline 
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i className="pi pi-circle-fill" style={{ color: '#22c55e', fontSize: '0.65rem' }}></i><span>Carrier Status: ONLINE</span></span> 
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i className="pi pi-circle-fill" style={{ color: '#ef4444', fontSize: '0.65rem' }}></i><span>Carrier Status: OFFLINE</span></span>
                        }
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#475569', display: 'block', marginTop: '4px', lineHeight: 1.4 }}>
                        {isOnline 
                          ? 'You are actively indexed by local restaurant operations. Dispatched kitchen bags will notify instantly under the New Orders page.' 
                          : 'You are invisible to dispatch queues. Switch to online to begin earning flat commissions.'
                        }
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Cash on Delivery prompt Modal Dialog */}
      <Dialog 
        header={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><i className="pi pi-money-bill" style={{ color: '#15803d' }}></i><span>Cash Collection Verification</span></div>} 
        visible={codDialogVisible} 
        style={{ width: '450px', borderRadius: '16px' }} 
        modal 
        onHide={() => setCodDialogVisible(false)}
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <i className="pi pi-info-circle" style={{ fontSize: '1.5rem', color: '#d97706', marginTop: '2px' }} />
            <div>
              <span style={{ fontWeight: 800, color: '#92400e', fontSize: '0.9rem', display: 'block' }}>CASH ON DELIVERY ORDER</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#b45309', lineHeight: 1.4 }}>
                This is a Cash on Delivery (COD) order. You are responsible for collecting the physical billing sum from the customer before completing delivery.
              </p>
            </div>
          </div>

          {codOrderToDeliver && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Recipient Customer:</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{codOrderToDeliver.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Collectible Cash Sum:</span>
                <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.05rem' }}>₹{codOrderToDeliver.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', margin: '1rem 0' }}>
            <input 
              type="checkbox" 
              id="confirmCod" 
              checked={codChecked} 
              onChange={(e) => setCodChecked(e.target.checked)} 
              style={{ cursor: 'pointer', transform: 'scale(1.2)', verticalAlign: 'middle' }}
            />
            <label htmlFor="confirmCod" style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer', fontWeight: 600, userSelect: 'none', lineHeight: 1.4 }}>
              I explicitly verify that I have collected physical cash worth <span style={{ color: '#ef4444', fontWeight: 800 }}>₹{codOrderToDeliver?.totalAmount.toFixed(2)}</span> from the customer.
            </label>
          </div>
        </div>

        <div className="p-dialog-footer">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            className="p-button-outlined p-button-secondary" 
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            onClick={() => setCodDialogVisible(false)} 
          />
          <Button 
            label="Yes, Cash Collected & Delivered" 
            icon="pi pi-check" 
            className="p-button-success" 
            style={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}
            onClick={handleConfirmCodDelivery} 
          />
        </div>
      </Dialog>

      {/* Payout Withdrawal Request Dialog */}
      <Dialog 
        header={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><i className="pi pi-money-bill" style={{ color: '#22c55e' }}></i><span>Request Payout Withdrawal</span></div>} 
        visible={withdrawDialogVisible} 
        style={{ width: '450px', borderRadius: '16px' }} 
        modal 
        onHide={() => setWithdrawDialogVisible(false)}
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <i className="pi pi-info-circle" style={{ fontSize: '1.5rem', color: '#16a34a', marginTop: '2px' }} />
            <div>
              <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem', display: 'block' }}>Wallet Withdrawal Rules</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#15803d', lineHeight: 1.4 }}>
                You can withdraw your earnings instantly. Requests will be processed by operations administration within 24 hours. Minimum withdrawal limit is <strong>₹100.00</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Withdrawal Amount (₹) *</label>
              <input 
                type="number" 
                value={withdrawAmount} 
                onChange={(e) => setWithdrawAmount(e.target.value === '' ? '' : Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
              />
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Maximum Available: <strong>₹{withdrawableBalance.toFixed(2)}</strong>
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Accountant Name *</label>
              <input 
                type="text" 
                placeholder="Enter accountant/account holder name"
                value={accountantName} 
                onChange={(e) => setAccountantName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Account Number *</label>
              <input 
                type="text" 
                placeholder="Enter bank account number"
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>IFSC Code *</label>
              <input 
                type="text" 
                placeholder="Enter bank IFSC code"
                value={ifscCode} 
                onChange={(e) => setIfscCode(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>
          </div>
        </div>

        <div className="p-dialog-footer">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            className="p-button-outlined p-button-secondary" 
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            onClick={() => setWithdrawDialogVisible(false)} 
          />
          <Button 
            label="Submit Request" 
            icon="pi pi-check" 
            loading={submittingWithdrawal}
            className="p-button-success" 
            style={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}
            onClick={handleRequestWithdrawalSubmit} 
          />
        </div>
      </Dialog>

      {/* Dynamic Order Tracking Modal Dialog */}
      <Dialog 
        header={`Logistics Tracking - Order Ref #${trackingOrder?._id?.substring(0, 10)}`}
        visible={trackingVisible} 
        style={{ width: '90%', maxWidth: '680px' }} 
        onHide={() => {
          setTrackingVisible(false);
          setTrackingOrder(null);
        }}
        modal
        resizable={false}
        draggable={false}
        breakpoints={{ '960px': '75vw', '641px': '95vw' }}
      >
        {trackingOrder && (
          <div style={{ padding: '0.5rem 0' }}>
            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 2rem 0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: '#e2e8f0', zIndex: 1 }}>
                <div style={{ height: '100%', backgroundColor: '#22c55e', width: getStepperWidth(trackingOrder.deliveryStatus), transition: 'width 0.3s ease' }} />
              </div>
              {['Accepted', 'Preparing', 'Pickup', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                const steps = ['Accepted', 'Preparing', 'Pickup', 'Out for Delivery', 'Delivered'];
                const currentIdx = steps.indexOf(trackingOrder.deliveryStatus === 'Shipped' ? 'Out for Delivery' : trackingOrder.deliveryStatus);
                const isCompleted = idx < currentIdx;
                const isActive = idx === currentIdx;
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#22c55e' : isActive ? '#15803d' : '#ffffff',
                      color: isCompleted || isActive ? '#ffffff' : '#64748b',
                      border: isCompleted || isActive ? 'none' : '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {isCompleted ? <i className="pi pi-check" style={{ fontSize: '0.75rem' }} /> : (idx + 1)}
                    </div>
                    <span style={{ marginTop: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: isActive ? '#15803d' : isCompleted ? '#22c55e' : '#64748b', textAlign: 'center' }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <Divider />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', margin: '1.5rem 0' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Recipient Details</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.5 }}>
                  <strong>{trackingOrder.shippingAddress?.fullName || trackingOrder.user?.name}</strong><br />
                  {trackingOrder.shippingAddress?.addressLine1}, {trackingOrder.shippingAddress?.city}, {trackingOrder.shippingAddress?.postalCode}<br />
                  📞 Phone: <span style={{ fontWeight: 700, color: '#15803d' }}>{trackingOrder.shippingAddress?.phone || 'N/A'}</span>
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Items & Billing</h4>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                  {trackingOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: idx < trackingOrder.items.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                      <span style={{ fontWeight: 600, color: '#475569' }}>{item.name}</span>
                      <span style={{ color: '#64748b', fontWeight: 700 }}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                  <span>Total Bill Amount:</span>
                  <span style={{ color: '#15803d' }}>₹{trackingOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Stepper button inside Modal */}
            {trackingOrder.deliveryStatus !== 'Delivered' && (
              <div style={{ marginTop: '1.5rem' }}>
                {/* If the order is NOT accepted yet, show Accept button */}
                {availableOrders.some(av => av._id === trackingOrder._id) ? (
                  <Button 
                    label="Accept & Dispatch order" 
                    icon="pi pi-check" 
                    loading={actionLoading[trackingOrder._id]}
                    className="p-button-success" 
                    style={{ width: '100%', borderRadius: '10px', height: '44px', fontWeight: 700 }}
                    onClick={async () => {
                      await handleAcceptOrder(trackingOrder._id);
                      setTrackingVisible(false);
                      setTrackingOrder(null);
                    }}
                  />
                ) : (
                  <Button 
                    label={
                      trackingOrder.deliveryStatus === 'Accepted' ? 'Start Preparing Meal' :
                      trackingOrder.deliveryStatus === 'Preparing' ? 'Mark Picked Up' :
                      trackingOrder.deliveryStatus === 'Pickup' ? 'Start Transit to Destination' :
                      'Confirm Order Delivered'
                    }
                    icon={
                      trackingOrder.deliveryStatus === 'Accepted' ? 'pi pi-spinner pi-spin' :
                      trackingOrder.deliveryStatus === 'Preparing' ? 'pi pi-check' :
                      trackingOrder.deliveryStatus === 'Pickup' ? 'pi pi-directions' :
                      'pi pi-home'
                    }
                    loading={actionLoading[trackingOrder._id]}
                    className={
                      trackingOrder.deliveryStatus === 'Out for Delivery' || trackingOrder.deliveryStatus === 'Shipped'
                        ? 'p-button-success' 
                        : 'p-button-info'
                    }
                    style={{ width: '100%', borderRadius: '10px', height: '44px', fontWeight: 700 }}
                    onClick={async () => {
                      await handleUpdateStatus(
                        trackingOrder._id, 
                        trackingOrder.deliveryStatus, 
                        trackingOrder.paymentMethod || 'cod', 
                        trackingOrder.totalAmount, 
                        trackingOrder.user?.name || 'Customer'
                      );
                      const updated = allOrders.find(o => o._id === trackingOrder._id) || trackingOrder;
                      setTrackingOrder(updated);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default DeliveryDashboard;
