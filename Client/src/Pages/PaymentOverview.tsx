import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Alert,
  Typography,
  Space,
  message,
  Spin,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  CalendarOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder } from '../types';

const { Title, Text } = Typography;

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
        Loading payment data...
      </div>
    </div>
  );
};

const PaymentOverview: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

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
      
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
      
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      };
      
      const [response] = await Promise.all([
        axios.get(`${backendUrl}/api/orders`, config),
        minLoadingTime
      ]);
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch orders.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders.';
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
    fetchOrders();
  }, [fetchOrders]);

  const paymentAnalytics = useMemo(() => {
    if (orders.length === 0) {
      return {
        totalPaymentReceived: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        highestPayment: 0,
        monthlyPayments: [],
        paymentRanges: []
      };
    }

    const totalPaymentReceived = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalPaymentReceived / totalOrders : 0;
    const highestPayment = Math.max(...orders.map(order => order.totalAmount));

    const monthlyData: { [key: string]: number } = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[month] = (monthlyData[month] || 0) + order.totalAmount;
    });

    const monthlyPayments = Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6);

    const ranges = [
      { range: '₹0 - ₹500', min: 0, max: 500 },
      { range: '₹501 - ₹1000', min: 501, max: 1000 },
      { range: '₹1001 - ₹2000', min: 1001, max: 2000 },
      { range: '₹2000+', min: 2001, max: Infinity }
    ];

    const paymentRanges = ranges.map(range => ({
      ...range,
      count: orders.filter(order => 
        order.totalAmount >= range.min && order.totalAmount <= range.max
      ).length
    })).filter(range => range.count > 0);

    return {
      totalPaymentReceived,
      totalOrders,
      averageOrderValue,
      highestPayment,
      monthlyPayments,
      paymentRanges
    };
  }, [orders]);

  const createPaymentRangePieChart = () => {
    if (paymentAnalytics.paymentRanges.length === 0) return null;
    
    const total = paymentAnalytics.paymentRanges.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    const radius = 100;
    const centerX = 100;
    const centerY = 100;
    const svgSize = 200;
    
    const rangeColors = ['#52c41a', '#1890ff', '#faad14', '#f5222d'];
    
    return (
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{ maxWidth: '200px', maxHeight: '200px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <circle 
          cx={centerX} 
          cy={centerY} 
          r="40" 
          fill="white" 
          stroke="#f0f0f0" 
          strokeWidth="2" 
        />
        {paymentAnalytics.paymentRanges.map((item, index) => {
          const percentage = (item.count / total) * 100;
          const angle = (item.count / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
          const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          const labelAngle = (startAngle + endAngle) / 2;
          const labelRadius = radius * 0.65;
          const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
          const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);
          
          currentAngle += angle;
          
          return (
            <g key={item.range}>
              <path
                d={pathData}
                fill={rangeColors[index % rangeColors.length]}
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
              />
              {percentage > 5 && (
                <text
                  x={labelX}
                  y={labelY + 1}
                  textAnchor="middle"
                  fontSize="12px"
                  fill="white"
                  fontWeight="bold"
                >
                  {percentage.toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 1400, margin: '0 auto' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 1400, margin: '0 auto' }}>
        {contextHolder}
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Alert
            message="Access Denied or Error!"
            description={
              <div>
                <p>{error}</p>
                <p>Please ensure you are logged in as an administrator.</p>
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

  const sortedPaymentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const rangeColors = ['#52c41a', '#1890ff', '#faad14', '#f5222d'];

  const columns = [
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Order ID</span>,
      dataIndex: '_id',
      key: 'orderId',
      render: (id: string) => <Tag color="blue">{id}</Tag>,
      width: 120,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Customer</span>,
      key: 'customer',
      render: (record: IOrder) => (
        <div>
          <div style={{ fontWeight: 500, color: '#262626' }}>{record.user?.name || 'N/A'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.user?.email || 'N/A'}
          </Text>
        </div>
      ),
      width: 200,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Amount</span>,
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
      ),
      width: 120,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Status</span>,
      key: 'status',
      render: () => (
        <Tag color="success" icon={<CheckCircleOutlined />} style={{border: '1px dashed'}}>
          Paid
        </Tag>
      ),
      width: 130,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Date</span>,
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#52c41a' }} />
          <span>{new Date(date).toLocaleDateString('en-IN')}</span>
        </Space>
      ),
      width: 140,
    },
  ];

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
          Payment Overview Dashboard
        </Title>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card 
                style={{ 
                  borderRadius: '12px',
                  border: '2px dashed #b7eb8f',
                  boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
                  background: 'white',
                  height: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
              >
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Revenue</span>}
                  value={paymentAnalytics.totalPaymentReceived}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ 
                    color: '#52c41a', 
                    fontSize: '25px', 
                    fontWeight: 700 
                  }}
                />
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                  <DollarOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
                  <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    All time earnings
                  </Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card 
                style={{ 
                  borderRadius: '12px',
                  border: '2px dashed #b7eb8f',
                  boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
                  background: 'white',
                  height: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
              >
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Transactions</span>}
                  value={paymentAnalytics.totalOrders}
                  valueStyle={{ 
                    color: '#52c41a', 
                    fontSize: '25px', 
                    fontWeight: 700 
                  }}
                />
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                  <CreditCardOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
                  <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    Successful payments
                  </Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card 
                style={{ 
                  borderRadius: '12px',
                  border: '2px dashed #b7eb8f',
                  boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
                  background: 'white',
                  height: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
              >
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Average Payment</span>}
                  value={paymentAnalytics.averageOrderValue}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ 
                    color: '#52c41a', 
                    fontSize: '25px', 
                    fontWeight: 700 
                  }}
                />
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
                  <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    Per transaction value
                  </Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card 
                style={{ 
                  borderRadius: '12px',
                  border: '2px dashed #b7eb8f',
                  boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
                  background: 'white',
                  height: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
              >
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Highest Payment</span>}
                  value={paymentAnalytics.highestPayment}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ 
                    color: '#52c41a', 
                    fontSize: '25px', 
                    fontWeight: 700 
                  }}
                />
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                  <TrophyOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
                  <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    Maximum single payment
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: '12px',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
              background: 'white',
              minHeight: '296px'
            }}
          >
            <Title level={4} style={{ marginBottom: '20px', color: '#52c41a'}}>
              <PieChartOutlined /> Payment Range Distribution
            </Title>
            
            {paymentAnalytics.paymentRanges.length > 0 ? (
              <>
                <div className="mobile-payments" style={{ display: 'block' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{ 
                      width: '100%', 
                      maxWidth: '280px',
                      aspectRatio: '1',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {createPaymentRangePieChart()}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px'
                  }}>
                    {paymentAnalytics.paymentRanges.map((item, index) => (
                      <div 
                        key={`range-${item.range}`}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: '#f9f9f9',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '1px solid #e6f7ff',
                          minHeight: '40px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e6f7ff';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f9f9f9';
                          e.currentTarget.style.transform = 'translateX(0px)';
                        }}
                      >
                        <div 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: rangeColors[index % rangeColors.length],
                            borderRadius: '50%',
                            marginRight: '12px',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            flexShrink: 0
                          }} 
                        />
                        <Text strong style={{ color: '#262626', fontSize: '14px', flex: 1 }}>
                          {item.range}
                        </Text>
                        <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'bold' }}>
                          {item.count}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="desktop-payments" style={{ display: 'none' }}>
                  <Row gutter={[24, 24]}>
                    <Col span={10}>
                      <div style={{ 
                        height: '200px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }}>
                        {createPaymentRangePieChart()}
                      </div>
                    </Col>
                    <Col span={14}>
                      <div style={{ 
                        padding: '10px 0', 
                        height: '200px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center'
                      }}>
                        {paymentAnalytics.paymentRanges.map((item, index) => (
                          <div 
                            key={`range-${item.range}`}
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              padding: '6px 12px',
                              marginBottom: '4px',
                              borderRadius: '6px',
                              background: '#f9f9f9',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              border: '1px solid #e6f7ff'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e6f7ff';
                              e.currentTarget.style.transform = 'translateX(5px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f9f9f9';
                              e.currentTarget.style.transform = 'translateX(0px)';
                            }}
                          >
                            <div 
                              style={{ 
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: rangeColors[index % rangeColors.length],
                                borderRadius: '50%',
                                marginRight: '12px',
                                border: '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                flexShrink: 0
                              }} 
                            />
                            <Text strong style={{ color: '#262626', fontSize: '14px', flex: 1 }}>
                              {item.range}
                            </Text>
                            <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'bold' }}>
                              {item.count}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </div>
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#8c8c8c',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <PieChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Text>No payment data available</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: '20px',
            fontWeight: 600,
            color: '#52c41a'
          }}>
            <CreditCardOutlined style={{ marginRight: 12, fontSize: '24px', color: '#52c41a' }} />
            Recent Payments
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
            border: '1px dashed #d9f7be'
          }}>
            <InfoCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#52c41a', margin: 0 }}>No payments recorded yet</Title>
            <Text style={{ color: '#8c8c8c' }}>Payments will appear here once customers start making purchases</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={sortedPaymentOrders}
            rowKey="_id"
            size="large"
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payments`,
            }}
          />
        )}
      </Card>

      <style>{`
        @media (max-width: 991px) {
          .desktop-payments {
            display: none !important;
          }
          .mobile-payments {
            display: block !important;
          }
        }
        
        @media (min-width: 992px) {
          .mobile-payments {
            display: none !important;
          }
          .desktop-payments {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentOverview;