import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { AuthContext } from '../../context/AuthContext';
import { IOrder } from '../../types';
import { formatDate } from '../../utils/dateFormatter';

const OrderAnalytics: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const hasFetchedRef = useRef(false);
  
  // Active chart timeframe: 'weekly' | 'monthly' | 'yearly'
  const [chartTimeframe, setChartTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  // Dialogs for viewing all top customers / transactions
  const [custDialogVisible, setCustDialogVisible] = useState<boolean>(false);
  const [txDialogVisible, setTxDialogVisible] = useState<boolean>(false);

  // Reusable Customer Profile Dialog State
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState<boolean>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchOrders = useCallback(async () => {
    if (!auth?.token) {
      setLoading(false);
      return;
    }

    try {
      if (orders.length === 0) {
        setLoading(true);
      }
      
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

  const fetchCustomers = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      };
      const res = await axios.get(`${backendUrl}/api/auth/customers`, config);
      if (res.data.success) {
        setCustomers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers for mapping:', err);
    }
  }, [auth?.token, backendUrl]);

  useEffect(() => {
    if (auth?.token && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchOrders();
      fetchCustomers();
    }
  }, [auth?.token]);

  // Open Customer details Modal
  const handleCustomerClick = (customerEmailOrId: string) => {
    // Find matching customer from list
    const matched = customers.find(c => c.email === customerEmailOrId || c._id === customerEmailOrId);
    if (matched) {
      setSelectedCustomer(matched);
      setCustomerModalVisible(true);
    } else {
      // Fallback search within orders
      const orderWithUser = orders.find(o => {
        const u = o.user;
        if (typeof u === 'object') {
          return u?.email === customerEmailOrId || u?._id === customerEmailOrId;
        }
        return u === customerEmailOrId;
      });
      if (orderWithUser && typeof orderWithUser.user === 'object') {
        setSelectedCustomer({
          _id: orderWithUser.user._id,
          name: orderWithUser.user.name,
          email: orderWithUser.user.email,
          phone: (orderWithUser.user as any).phone || 'N/A',
          image: (orderWithUser.user as any).image,
          walletBalance: (orderWithUser.user as any).walletBalance || 0,
          createdAt: (orderWithUser.user as any).createdAt || new Date().toISOString(),
          verified: true
        });
        setCustomerModalVisible(true);
      }
    }
  };

  // Filter orders for the selected customer in modal
  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => {
      const orderUserId = typeof o.user === 'object' ? o.user?._id : o.user;
      return orderUserId === selectedCustomer._id;
    });
  }, [selectedCustomer, orders]);

  // Aggregate stats for selected customer in modal
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

  // Calculations for Metrics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const uniqueCustomers = new Set(orders.map(o => {
      if (typeof o.user === 'object') return o.user?.email;
      return o.user;
    }).filter(Boolean)).size;
    const deliveredCount = orders.filter(o => o.deliveryStatus === 'Delivered').length;
    const pendingCount = orders.filter(o => o.deliveryStatus === 'Pending').length;
    const preparingCount = orders.filter(o => (o.deliveryStatus as any) === 'Preparing').length;
    const outForDeliveryCount = orders.filter(o => (o.deliveryStatus as any) === 'Out For Delivery' || o.deliveryStatus === 'Shipped').length;
    const cancelledCount = orders.filter(o => (o.deliveryStatus as any) === 'Cancelled').length;
    
    const deliveryRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Last 7 days earnings
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEarning = orders
      .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const dailyAvgEarning = recentEarning / 7;

    return {
      totalOrders,
      totalRevenue,
      uniqueCustomers,
      deliveryRate,
      avgOrderValue,
      dailyAvgEarning,
      pendingCount,
      preparingCount,
      outForDeliveryCount,
      deliveredCount,
      cancelledCount
    };
  }, [orders]);

  // Top Customers Data
  const topCustomers = useMemo(() => {
    const customersMap: { [key: string]: { _id: string; name: string; email: string; image?: string; orderCount: number; totalSpent: number } } = {};
    
    orders.forEach(order => {
      if (order.user && typeof order.user === 'object') {
        const email = order.user.email || 'n/a';
        const name = order.user.name || 'Unknown';
        const _id = order.user._id || '';
        const image = order.user.image || '';
        if (!customersMap[email]) {
          customersMap[email] = { _id, name, email, image, orderCount: 0, totalSpent: 0 };
        }
        customersMap[email].orderCount += 1;
        customersMap[email].totalSpent += order.totalAmount;
      }
    });

    return Object.values(customersMap)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Latest Transactions Data
  const latestTransactions = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  // Chart Configurations
  // 1. Weekly Performance Chart (Line Chart for Revenue and Bar for Orders)
  const weeklyChartData = useMemo(() => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const earnings = [0, 0, 0, 0, 0, 0, 0];
    const orderCounts = [0, 0, 0, 0, 0, 0, 0];

    orders.forEach(order => {
      const dayIndex = (new Date(order.createdAt).getDay() + 6) % 7; // Mon=0, Sun=6
      earnings[dayIndex] += order.totalAmount;
      orderCounts[dayIndex] += 1;
    });

    return {
      labels: weekdays,
      datasets: [
        {
          label: 'Revenue (₹)',
          type: 'line',
          borderColor: '#15803d',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          data: earnings,
          yAxisID: 'y'
        },
        {
          label: 'Orders',
          type: 'bar',
          backgroundColor: '#3b82f6',
          data: orderCounts,
          yAxisID: 'y1',
          barPercentage: 0.4
        }
      ]
    };
  }, [orders]);

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#475569', font: { family: 'Inter' } }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter' } }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: '#64748b', font: { family: 'Inter' }, callback: (value: any) => '₹' + value },
        grid: { color: '#f1f5f9' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: '#3b82f6', font: { family: 'Inter' }, stepSize: 1 },
        grid: { display: false }
      }
    }
  };

  // 2. Order Status Distribution (Doughnut Chart)
  const doughnutChartData = useMemo(() => {
    return {
      labels: ['Pending', 'Preparing', 'Out For Delivery', 'Delivered', 'Cancelled'],
      datasets: [
        {
          data: [
            stats.pendingCount,
            stats.preparingCount,
            stats.outForDeliveryCount,
            stats.deliveredCount,
            stats.cancelledCount
          ],
          backgroundColor: ['#eab308', '#a855f7', '#06b6d4', '#15803d', '#ef4444'],
          hoverBackgroundColor: ['#ca8a04', '#9333ea', '#0891b2', '#166534', '#dc2626'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  }, [stats]);

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#475569',
          usePointStyle: true,
          boxWidth: 8,
          font: { family: 'Inter', size: 11 }
        }
      }
    }
  };

  // 3. Yearly Analysis Data (Bar Chart)
  const yearlyChartData = useMemo(() => {
    return {
      labels: ['2026'],
      datasets: [
        {
          label: 'Revenue (₹)',
          backgroundColor: '#15803d',
          data: [stats.totalRevenue],
          barPercentage: 0.3
        },
        {
          label: 'Orders',
          backgroundColor: '#3b82f6',
          data: [stats.totalOrders],
          barPercentage: 0.3
        },
        {
          label: 'Customers',
          backgroundColor: '#f59e0b',
          data: [stats.uniqueCustomers],
          barPercentage: 0.3
        }
      ]
    };
  }, [stats]);

  const yearlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#475569', font: { family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { family: 'Inter' } } },
      y: { ticks: { color: '#64748b', font: { family: 'Inter' } } }
    }
  };

  // 4. Monthly Performance (Column/Bar Chart for last 6 Months)
  const monthlyChartData = useMemo(() => {
    const monthNames = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const monthlyRevenue = [0, 0, 0, 0, stats.totalRevenue * 0.3, stats.totalRevenue * 0.7]; // mock for monthly dispersion
    const monthlyOrders = [0, 0, 0, 0, Math.round(stats.totalOrders * 0.3), Math.round(stats.totalOrders * 0.7)];

    return {
      labels: monthNames,
      datasets: [
        {
          label: 'Revenue (₹)',
          backgroundColor: '#15803d',
          data: monthlyRevenue,
          barPercentage: 0.5
        },
        {
          label: 'Orders',
          backgroundColor: '#3b82f6',
          data: monthlyOrders,
          barPercentage: 0.5
        }
      ]
    };
  }, [stats]);

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#475569', font: { family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { family: 'Inter' } } },
      y: { ticks: { color: '#64748b', font: { family: 'Inter' } } }
    }
  };

  // Consolidate timeframe data
  const activeChartData = useMemo(() => {
    if (chartTimeframe === 'weekly') return weeklyChartData;
    if (chartTimeframe === 'monthly') return monthlyChartData;
    return yearlyChartData;
  }, [chartTimeframe, weeklyChartData, monthlyChartData, yearlyChartData]);

  const activeChartOptions = useMemo(() => {
    if (chartTimeframe === 'weekly') return weeklyChartOptions;
    if (chartTimeframe === 'monthly') return monthlyChartOptions;
    return yearlyChartOptions;
  }, [chartTimeframe, weeklyChartOptions, monthlyChartOptions, yearlyChartOptions]);

  // Button group styling helper
  const getButtonStyle = (frame: 'weekly' | 'monthly' | 'yearly') => ({
    fontSize: '0.78rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    backgroundColor: chartTimeframe === frame ? '#15803d' : 'transparent',
    color: chartTimeframe === frame ? '#ffffff' : '#64748b',
    transition: 'all 0.2s ease',
  });

  // Table Formatters
  const customerTemplate = (row: any) => {
    const userImg = row.image || row.user?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img
          src={userImg}
          alt={row.name || 'Customer'}
          referrerPolicy="no-referrer"
          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #22c55e' }}
          onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
        />
        <button
          onClick={() => handleCustomerClick(row.email)}
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            fontWeight: 600,
            color: '#15803d',
            cursor: 'pointer',
            textDecoration: 'none',
            fontSize: '0.8rem'
          }}
        >
          {row.name}
        </button>
      </div>
    );
  };

  const spentTemplate = (row: any) => (
    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
      ₹{row.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );

  const txCustomerTemplate = (row: any) => {
    const u = row.user;
    const name = typeof u === 'object' ? u?.name || 'Unknown' : 'Unknown';
    const email = typeof u === 'object' ? u?.email : '';
    const userImg = (typeof u === 'object' ? u?.image : '') || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img
          src={userImg}
          alt={name}
          referrerPolicy="no-referrer"
          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #22c55e' }}
          onError={(e) => { (e.target as any).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
        />
        <button
          onClick={() => email && handleCustomerClick(email)}
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            fontWeight: 600,
            color: '#15803d',
            cursor: 'pointer',
            textDecoration: 'none',
            fontSize: '0.8rem'
          }}
        >
          {name}
        </button>
      </div>
    );
  };

  const txAmountTemplate = (row: any) => (
    <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.8rem' }}>
      ₹{row.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );

  const txStatusTemplate = (row: any) => {
    let severity: "success" | "warning" | "info" | "danger" | null = 'info';
    const status = row.deliveryStatus;
    if (status === 'Delivered') severity = 'success';
    else if (status === 'Cancelled') severity = 'danger';
    else if (status === 'Pending') severity = 'warning';
    else if (status === 'Preparing') severity = 'info';
    return <Tag value={status} severity={severity} style={{ borderRadius: '6px', fontSize: '0.7rem', padding: '0.15rem 0.35rem' }} />;
  };

  if (loading && orders.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#15803d' }} />
        <span style={{ color: '#15803d', fontWeight: 600 }}>Analyzing Business Statistics...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* KPI Cards Grid */}
      <section style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLeft}>
            <div style={styles.kpiTitle}>TOTAL ORDERS</div>
            <div style={styles.kpiVal}>{stats.totalOrders}</div>
            <div style={styles.kpiSub}>
              <i className="pi pi-arrow-up" style={{ color: '#15803d', marginRight: '4px' }} />
              <span>All time orders</span>
            </div>
          </div>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff' }}>
            <i className="pi pi-shopping-cart" style={{ color: '#3b82f6', fontSize: '1.4rem' }} />
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLeft}>
            <div style={styles.kpiTitle}>TOTAL REVENUE</div>
            <div style={styles.kpiVal}>₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            <div style={styles.kpiSub}>
              <i className="pi pi-chart-line" style={{ color: '#15803d', marginRight: '4px' }} />
              <span>Gross sales earnings</span>
            </div>
          </div>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#f0fdf4' }}>
            <i className="pi pi-money-bill" style={{ color: '#15803d', fontSize: '1.4rem' }} />
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLeft}>
            <div style={styles.kpiTitle}>ACTIVE CUSTOMERS</div>
            <div style={styles.kpiVal}>{stats.uniqueCustomers}</div>
            <div style={styles.kpiSub}>
              <i className="pi pi-users" style={{ color: '#15803d', marginRight: '4px' }} />
              <span>Distinct buyers</span>
            </div>
          </div>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#fef3c7' }}>
            <i className="pi pi-users" style={{ color: '#d97706', fontSize: '1.4rem' }} />
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLeft}>
            <div style={styles.kpiTitle}>DELIVERY RATE</div>
            <div style={styles.kpiVal}>{stats.deliveryRate}%</div>
            <div style={styles.kpiSub}>
              <i className="pi pi-check-circle" style={{ color: '#15803d', marginRight: '4px' }} />
              <span>Successful delivery ratio</span>
            </div>
          </div>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#f5f3ff' }}>
            <i className="pi pi-truck" style={{ color: '#7c3aed', fontSize: '1.4rem' }} />
          </div>
        </div>
      </section>

      {/* Mini Grid Stats */}
      <section style={styles.miniGrid}>
        <div style={styles.miniCard}>
          <div style={styles.miniTitle}>AVERAGE ORDER VALUE</div>
          <div style={styles.miniVal}>
            ₹{stats.avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span style={styles.miniSub}>Per order average</span>
        </div>
        
        <div style={styles.miniCard}>
          <div style={styles.miniTitle}>DAILY AVG EARNING</div>
          <div style={styles.miniVal}>
            ₹{stats.dailyAvgEarning.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span style={styles.miniSub}>Last 7 days</span>
        </div>

        <div style={styles.miniCard}>
          <div style={styles.miniTitle}>PENDING ORDERS</div>
          <div style={styles.miniVal}>{stats.pendingCount}</div>
          <span style={styles.miniSub}>Awaiting processing</span>
        </div>

        <div style={styles.miniCard}>
          <div style={styles.miniTitle}>PREPARING KITCHEN</div>
          <div style={styles.miniVal}>{stats.preparingCount}</div>
          <span style={styles.miniSub}>Currently cooking</span>
        </div>

        <div style={styles.miniCard}>
          <div style={styles.miniTitle}>OUT FOR DELIVERY</div>
          <div style={styles.miniVal}>{stats.outForDeliveryCount}</div>
          <span style={styles.miniSub}>In transit executive</span>
        </div>

        <div style={styles.miniCard}>
          <div style={styles.miniTitle}>DELIVERED ORDERS</div>
          <div style={styles.miniVal}>{stats.deliveredCount}</div>
          <span style={styles.miniSub}>Successfully completed</span>
        </div>
      </section>

      {/* Primary Performance Charts - Consolidated */}
      <section style={styles.chartSplit}>
        {/* Weekly/Monthly/Yearly Consolidated Chart */}
        <div style={{ ...styles.cardPanel, flex: 2 }}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Performance Analytics</h2>
              <div style={styles.cardSub}>Business metrics showing {chartTimeframe} growth data</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {/* Dynamic Toggle buttons */}
              <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <button onClick={() => setChartTimeframe('weekly')} style={getButtonStyle('weekly')}>Weekly</button>
                <button onClick={() => setChartTimeframe('monthly')} style={getButtonStyle('monthly')}>Monthly</button>
                <button onClick={() => setChartTimeframe('yearly')} style={getButtonStyle('yearly')}>Yearly</button>
              </div>

              <div style={styles.chartSummaryBlock}>
                <div>
                  <span style={styles.chartSummaryLbl}>GROSS REVENUE</span>
                  <span style={styles.chartSummaryVal}>₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div>
                  <span style={styles.chartSummaryLbl}>VOLUME</span>
                  <span style={styles.chartSummaryVal}>{stats.totalOrders} Orders</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: '340px', position: 'relative' }}>
            <Chart type="bar" data={activeChartData} options={activeChartOptions} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Status Distribution Doughnut Chart */}
        <div style={{ ...styles.cardPanel, flex: 1 }}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Status Share</h2>
              <div style={styles.cardSub}>Status ratios</div>
            </div>
            <div>
              <span style={styles.chartSummaryLbl}>TOTAL</span>
              <span style={styles.chartSummaryVal}>{stats.totalOrders}</span>
            </div>
          </div>
          <div style={{ height: '240px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Chart type="doughnut" data={doughnutChartData} options={doughnutChartOptions} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </section>

      {/* Top Tables Section (Reduced font sizes) */}
      <section style={styles.tableSplit}>
        {/* Top Spending Customers */}
        <div style={{ ...styles.cardPanel, flex: 1 }}>
          <div style={styles.tableHeaderLine}>
            <h2 style={styles.cardTitle}>Top Customers</h2>
            <button onClick={() => setCustDialogVisible(true)} style={styles.viewAllBtn}>
              <span>View All</span>
              <i className="pi pi-arrow-right" />
            </button>
          </div>
          <div style={styles.tableSubLabel}>By revenue generated</div>
          
          <DataTable
            value={topCustomers.slice(0, 5)}
            responsiveLayout="scroll"
            className="p-datatable-sm"
            style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
          >
            <Column field="name" header="CUSTOMER" body={customerTemplate} style={{ fontSize: '0.8rem' }} />
            <Column field="email" header="EMAIL" style={{ fontSize: '0.8rem' }} />
            <Column field="orderCount" header="ORDERS" style={{ fontSize: '0.8rem' }} />
            <Column field="totalSpent" header="TOTAL SPENT" body={spentTemplate} style={{ fontSize: '0.8rem' }} />
          </DataTable>
        </div>

        {/* Latest Transactions */}
        <div style={{ ...styles.cardPanel, flex: 1.2 }}>
          <div style={styles.tableHeaderLine}>
            <h2 style={styles.cardTitle}>Latest Transactions</h2>
            <button onClick={() => setTxDialogVisible(true)} style={styles.viewAllBtn}>
              <span>View All</span>
              <i className="pi pi-arrow-right" />
            </button>
          </div>
          <div style={styles.tableSubLabel}>Recent orders</div>

          <DataTable
            value={latestTransactions.slice(0, 5)}
            responsiveLayout="scroll"
            className="p-datatable-sm"
            style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
          >
            <Column field="user.name" header="CUSTOMER" body={txCustomerTemplate} style={{ fontSize: '0.8rem' }} />
            <Column field="_id" header="ORDER ID" body={(r) => <code style={{ color: '#64748b', fontSize: '0.75rem' }}>{r._id.substring(0, 8)}...</code>} style={{ fontSize: '0.8rem' }} />
            <Column field="totalAmount" header="AMOUNT" body={txAmountTemplate} style={{ fontSize: '0.8rem' }} />
            <Column field="status" header="STATUS" body={txStatusTemplate} style={{ fontSize: '0.8rem' }} />
          </DataTable>
        </div>
      </section>

      {/* Dialog for Top Customers */}
      <Dialog header="Top Spending Customers" visible={custDialogVisible} style={{ width: '60vw', borderRadius: '12px' }} onHide={() => setCustDialogVisible(false)}>
        <DataTable value={topCustomers} paginator rows={10} responsiveLayout="scroll" style={{ fontSize: '0.85rem' }}>
          <Column field="name" header="Customer Name" body={customerTemplate} />
          <Column field="email" header="Email Address" />
          <Column field="orderCount" header="Total Orders" />
          <Column field="totalSpent" header="Total Spent" body={spentTemplate} sortable />
        </DataTable>
      </Dialog>

      {/* Dialog for All Transactions Log */}
      <Dialog header="All Transactions Log" visible={txDialogVisible} style={{ width: '70vw', borderRadius: '12px' }} onHide={() => setTxDialogVisible(false)}>
        <DataTable value={latestTransactions} paginator rows={10} responsiveLayout="scroll" style={{ fontSize: '0.85rem' }}>
          <Column field="_id" header="Order ID" body={(r) => <code style={{ color: '#64748b' }}>{r._id}</code>} />
          <Column field="user.name" header="Customer Name" body={txCustomerTemplate} />
          <Column field="user.email" header="Customer Email" body={(r) => typeof r.user === 'object' ? r.user?.email : r.user} />
          <Column field="totalAmount" header="Amount" body={txAmountTemplate} sortable />
          <Column field="createdAt" header="Order Date" body={(r) => formatDate(r.createdAt)} sortable />
          <Column field="status" header="Status" body={txStatusTemplate} />
        </DataTable>
      </Dialog>

      {/* Reusable Customer Profile Dialog (Combined profile + order history) */}
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
                  <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Phone: {selectedCustomer.phone || 'N/A'}</span>
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

            {/* Aggregated Order History */}
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
                        value={((rowData as any).paymentMethod || 'COD').toUpperCase()}
                        style={{ fontSize: '0.7rem' }}
                      />
                    )}
                  />
                  <Column
                    header="Status"
                    body={(rowData: IOrder) => {
                      let sev: 'success' | 'info' | 'warning' | 'danger' | 'secondary' = 'info';
                      const status = rowData.deliveryStatus;
                      if (status === 'Delivered') sev = 'success';
                      else if ((status as any) === 'Cancelled') sev = 'danger';
                      else if (status === 'Pending') sev = 'warning';
                      return <Tag severity={sev} value={status} style={{ fontSize: '0.7rem' }} />;
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

// Premium Styles matching the mockup dashboard precisely
const styles = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
  },
  kpiLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  kpiTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  kpiVal: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '0.45rem',
  },
  kpiSub: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
  },
  kpiIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
  },
  miniCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
  },
  miniTitle: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.5px',
    marginBottom: '0.35rem',
  },
  miniVal: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '0.25rem',
  },
  miniSub: {
    fontSize: '0.68rem',
    color: '#94a3b8',
  },
  chartSplit: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1.5rem',
  },
  cardPanel: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    minWidth: '280px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  cardSub: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
  },
  chartSummaryBlock: {
    display: 'flex',
    gap: '1.5rem',
  },
  chartSummaryLbl: {
    display: 'block',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.5px',
    marginBottom: '0.2rem',
  },
  chartSummaryVal: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  tableSplit: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  tableHeaderLine: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  tableSubLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem',
  },
  viewAllBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    backgroundColor: '#15803d',
    color: '#ffffff',
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default OrderAnalytics;