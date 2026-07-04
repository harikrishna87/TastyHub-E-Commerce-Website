import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { AuthContext } from '../../context/AuthContext';

interface SystemStatsData {
  health: {
    api: string;
    database: string;
    overall: string;
  };
  apiStats: {
    totalRequests: number;
    activeRequests: number;
    statusCodes: { [key: string]: number };
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    endpoints: {
      [key: string]: {
        total: number;
        errors: number;
        totalTime: number;
        avgTime: number;
        minTime: number;
        maxTime: number;
      };
    };
    recentRequests: Array<{
      id: string;
      method: string;
      path: string;
      statusCode: number;
      responseTime: number;
      timestamp: string;
      ip: string;
    }>;
  };
  databaseStats: {
    connectionState: number;
    latencyMs: number;
    dbName: string;
    stats: {
      collections: number;
      objects: number;
      dataSize: number;
      storageSize: number;
      indexSize: number;
      avgObjSize: number;
    } | null;
    collectionsCount: {
      users: number;
      products: number;
      orders: number;
      restaurants: number;
    };
  };
  systemStats: {
    processMemory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    uptimeSeconds: number;
    systemInfo: {
      platform: string;
      release: string;
      arch: string;
      cpus: number;
      freeMemory: number;
      totalMemory: number;
      nodeVersion: string;
    };
  };
}

const statusCodeChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0
  } as any,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#475569',
        usePointStyle: true,
        font: { family: 'Inter', size: 11 },
      },
    },
  },
  cutout: '70%',
};

const endpointChartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0
  } as any,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: { color: '#f1f5f9' },
      ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } },
    },
    y: {
      grid: { display: false },
      ticks: { color: '#475569', font: { family: 'Inter', size: 10 } },
    },
  },
};

const SystemStats: React.FC = () => {
  const auth = useContext(AuthContext);
  const [stats, setStats] = useState<SystemStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(10); // Default to 10s auto-refresh
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchStats = useCallback(async (showSilence: boolean = false) => {
    if (!auth?.token) {
      setLoading(false);
      return;
    }

    if (!showSilence) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      };

      const response = await axios.get(`${backendUrl}/api/admin/system-stats`, config);
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch system stats.');
      }
    } catch (err: any) {
      console.error('Error fetching system statistics:', err);
      setError(err.response?.data?.message || 'Server error connection failed.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [auth?.token, backendUrl]);

  // Set up polling interval
  useEffect(() => {
    fetchStats(false);
  }, [fetchStats]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchStats(true);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  // Format Helper: Bytes to human readable
  const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format Helper: Seconds to human readable uptime
  const formatUptime = (seconds: number): string => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? `${d}d ` : '';
    const hDisplay = h > 0 ? `${h}h ` : '';
    const mDisplay = m > 0 ? `${m}m ` : '';
    const sDisplay = `${s}s`;
    return dDisplay + hDisplay + mDisplay + sDisplay;
  };

  // Chart Configurations
  const statusCodeChartData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] };
    const sc = stats.apiStats.statusCodes;
    const labels = ['2xx Success', '3xx Redirection', '4xx Client Error', '5xx Server Error'];
    const data = [
      sc['2xx'] || 0,
      sc['3xx'] || 0,
      sc['4xx'] || 0,
      sc['5xx'] || 0,
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#22c55e', '#3b82f6', '#f97316', '#ef4444'],
          hoverBackgroundColor: ['#16a34a', '#2563eb', '#ea580c', '#dc2626'],
          borderWidth: 1,
        },
      ],
    };
  }, [stats]);

  // Endpoint Latency breakdown
  const endpointChartData = useMemo(() => {
    if (!stats || !stats.apiStats.endpoints) return { labels: [], datasets: [] };
    const endps = stats.apiStats.endpoints;
    const sortedEndpoints = Object.entries(endps)
      .sort((a, b) => b[1].avgTime - a[1].avgTime)
      .slice(0, 7); // Show top 7 slowest endpoints

    const labels = sortedEndpoints.map(([name]) => name);
    const avgTimes = sortedEndpoints.map(([, data]) => parseFloat(data.avgTime.toFixed(1)));

    return {
      labels,
      datasets: [
        {
          label: 'Avg Response Time (ms)',
          backgroundColor: '#15803d',
          borderColor: '#15803d',
          data: avgTimes,
          borderRadius: 6,
          barPercentage: 0.6,
        },
      ],
    };
  }, [stats]);

  // Columns templates
  const methodTemplate = (row: any) => {
    const method = row.method.toUpperCase();
    let bg = '#e2e8f0';
    let fg = '#475569';
    if (method === 'GET') { bg = '#dcfce7'; fg = '#15803d'; }
    else if (method === 'POST') { bg = '#dbeafe'; fg = '#1d4ed8'; }
    else if (method === 'PUT') { bg = '#fef3c7'; fg = '#b45309'; }
    else if (method === 'DELETE') { bg = '#fee2e2'; fg = '#b91c1c'; }
    else if (method === 'PATCH') { bg = '#f3e8ff'; fg = '#6b21a8'; }

    return (
      <span style={{
        backgroundColor: bg,
        color: fg,
        fontWeight: 700,
        fontSize: '0.72rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        display: 'inline-block'
      }}>
        {method}
      </span>
    );
  };

  const statusTemplate = (row: any) => {
    const status = row.statusCode;
    let severity: "success" | "warning" | "danger" | "info" | null = 'info';
    if (status >= 200 && status < 300) severity = 'success';
    else if (status >= 300 && status < 400) severity = 'info';
    else if (status >= 400 && status < 500) severity = 'warning';
    else if (status >= 500) severity = 'danger';

    return <Tag value={status.toString()} severity={severity} style={{ borderRadius: '6px', fontSize: '0.72rem', padding: '0.15rem 0.4rem' }} />;
  };

  const latencyTemplate = (row: any) => {
    const lat = row.responseTime;
    let color = '#22c55e';
    if (lat > 500) color = '#ef4444';
    else if (lat > 150) color = '#f97316';

    return (
      <span style={{ fontWeight: 700, color, fontSize: '0.8rem' }}>
        {lat.toFixed(1)} ms
      </span>
    );
  };

  const timeTemplate = (row: any) => {
    return (
      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
        {new Date(row.timestamp).toLocaleTimeString()}
      </span>
    );
  };

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#15803d' }} />
        <span style={{ color: '#15803d', fontWeight: 600 }}>Gathering System Statistics...</span>
      </div>
    );
  }

  const databaseReadyStateText = (state: number): string => {
    switch (state) {
      case 0: return 'Disconnected';
      case 1: return 'Connected';
      case 2: return 'Connecting';
      case 3: return 'Disconnecting';
      default: return 'Unknown';
    }
  };

  const apiHealth = stats?.health.api || 'unknown';
  const dbHealth = stats?.health.database || 'unknown';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <style>{`
        @keyframes pulse-green {
          0% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes pulse-red {
          0% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .status-dot-green {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #22c55e;
          animation: pulse-green 1.8s infinite;
        }
        .status-dot-red {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #ef4444;
          animation: pulse-red 1.8s infinite;
        }
        .stat-card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .stat-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* Header bar controls */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Performance Stats</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Real-time health status, api telemetry, and database resource statistics</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isRefreshing && (
            <span style={{ fontSize: '0.75rem', color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '0.75rem' }}></i> Syncing...
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', paddingLeft: '0.25rem' }}>Auto Refresh:</span>
            {[
              { label: 'Off', val: 0 },
              { label: '5s', val: 5 },
              { label: '10s', val: 10 },
              { label: '30s', val: 30 }
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setRefreshInterval(opt.val)}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: refreshInterval === opt.val ? '#15803d' : 'transparent',
                  color: refreshInterval === opt.val ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="pi pi-exclamation-triangle" style={{ fontSize: '1.2rem' }}></i>
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* Health Status Panels */}
      {stats && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* API Health */}
          <div className="stat-card-hover" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>API Status</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>Backend API</h3>
              <span style={{ fontSize: '0.8rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                {apiHealth === 'healthy' ? 'Operational' : 'Degraded'}
              </span>
            </div>
            <div className={apiHealth === 'healthy' ? 'status-dot-green' : 'status-dot-red'} style={{ width: '12px', height: '12px' }} />
          </div>

          {/* Database Health */}
          <div className="stat-card-hover" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Database status</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>MongoDB Atlas</h3>
              <span style={{ fontSize: '0.8rem', color: dbHealth === 'healthy' ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                Latency: {stats.databaseStats.latencyMs.toFixed(1)} ms
              </span>
            </div>
            <div className={dbHealth === 'healthy' ? 'status-dot-green' : 'status-dot-red'} style={{ width: '12px', height: '12px' }} />
          </div>

          {/* Uptime Health */}
          <div className="stat-card-hover" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Server Uptime</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>
                {formatUptime(stats.systemStats.uptimeSeconds)}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Node {stats.systemStats.systemInfo.nodeVersion}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#15803d' }}>
              <i className="pi pi-clock" style={{ fontSize: '1.2rem' }}></i>
            </div>
          </div>
        </section>
      )}

      {/* Core APM KPIs */}
      {stats && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {/* Total API requests */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total HTTP Requests</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>{stats.apiStats.totalRequests}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Since process started</span>
          </div>

          {/* Active Connections */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Requests</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>{stats.apiStats.activeRequests}</div>
            <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>Concurrent connections</span>
          </div>

          {/* Average Latency */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Response Time</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', margin: '0.3rem 0' }}>
              {stats.apiStats.avgResponseTime.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 600 }}>ms</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>API middleware latency</span>
          </div>

          {/* Heap Memory usage */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Node Heap Usage</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>
              {formatBytes(stats.systemStats.processMemory.heapUsed, 1)}
            </div>
            <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '0.45rem', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                backgroundColor: '#15803d',
                width: `${(stats.systemStats.processMemory.heapUsed / stats.systemStats.processMemory.heapTotal) * 100}%`
              }} />
            </div>
          </div>
        </section>
      )}

      {/* Visual Analytics Charts */}
      {stats && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {/* Status code donut */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '360px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>Request Status Distribution</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Classification of HTTP response codes</span>
            </div>
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
              <Chart type="doughnut" data={statusCodeChartData} options={statusCodeChartOptions} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Endpoint Latency breakdown */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '360px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>Slowest Endpoint Analysis</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Top slow routes ranked by average latency</span>
            </div>
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
              {Object.keys(stats.apiStats.endpoints).length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No endpoint requests logged yet
                </div>
              ) : (
                <Chart type="bar" data={endpointChartData} options={endpointChartOptions} style={{ height: '100%', width: '100%' }} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recent Requests Logs Table */}
      {stats && (
        <section style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>Live API Telemetry Logs</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Recent 10 HTTP requests intercepted by middleware</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, backgroundColor: '#f0fdf4', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
              {stats.apiStats.recentRequests.length} active logs
            </span>
          </div>

          <DataTable
            value={stats.apiStats.recentRequests}
            className="p-datatable-sm"
            style={{ fontSize: '0.85rem' }}
            emptyMessage="No requests tracked by application yet."
          >
            <Column field="timestamp" header="Time" body={timeTemplate} style={{ width: '12%' }} />
            <Column field="method" header="Method" body={methodTemplate} style={{ width: '10%' }} />
            <Column field="path" header="Path/Endpoint" style={{ width: '38%', fontWeight: 500 }} />
            <Column field="statusCode" header="Status" body={statusTemplate} style={{ width: '10%' }} />
            <Column field="responseTime" header="Latency" body={latencyTemplate} style={{ width: '12%', textAlign: 'right' }} />
            <Column field="ip" header="Client IP" style={{ width: '18%', color: '#64748b' }} />
          </DataTable>
        </section>
      )}

      {/* System Architecture Metadata */}
      {stats && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* MongoDB Metadata */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <i className="pi pi-database" style={{ marginRight: '0.4rem', color: '#15803d' }}></i> MongoDB Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Connection State</span>
                <span style={{ fontWeight: 600, color: stats.databaseStats.connectionState === 1 ? '#22c55e' : '#ef4444' }}>
                  {databaseReadyStateText(stats.databaseStats.connectionState)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Database Name</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{stats.databaseStats.dbName}</span>
              </div>

              {stats.databaseStats.stats && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Total Collections</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{stats.databaseStats.stats.collections} collections</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Allocated Storage Size</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{formatBytes(stats.databaseStats.stats.storageSize)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Index Size</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{formatBytes(stats.databaseStats.stats.indexSize)}</span>
                  </div>
                </>
              )}

              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', margin: '0 0 0.5rem 0' }}>Collection Document Counts</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Users</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>{stats.databaseStats.collectionsCount.users}</span>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Products</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>{stats.databaseStats.collectionsCount.products}</span>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Orders</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>{stats.databaseStats.collectionsCount.orders}</span>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Restaurants</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>{stats.databaseStats.collectionsCount.restaurants}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Node OS Metadata */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <i className="pi pi-server" style={{ marginRight: '0.4rem', color: '#15803d' }}></i> Host Environment
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Node.js Version</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{stats.systemStats.systemInfo.nodeVersion}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>OS Platform</span>
                <span style={{ fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>
                  {stats.systemStats.systemInfo.platform} ({stats.systemStats.systemInfo.arch})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>CPUs Count</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{stats.systemStats.systemInfo.cpus} cores</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Host Memory</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {formatBytes(stats.systemStats.systemInfo.totalMemory - stats.systemStats.systemInfo.freeMemory)} / {formatBytes(stats.systemStats.systemInfo.totalMemory)}
                </span>
              </div>

              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', margin: '0 0 0.5rem 0' }}>Process Memory Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>RSS</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{formatBytes(stats.systemStats.processMemory.rss)}</span>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>External</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{formatBytes(stats.systemStats.processMemory.external)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SystemStats;
