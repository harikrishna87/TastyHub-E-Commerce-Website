import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { formatDate } from '../../utils/dateFormatter';

const InquiriesManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [replies, setReplies] = useState<{ [key: string]: string }>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const fetchInquiries = async () => {
    if (!auth?.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
        withCredentials: true,
      };
      const res = await axios.get(`${backendUrl}/api/inquiries`, config);
      if (res.data.success) {
        setInquiries(res.data.inquiries || []);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [auth?.token]);

  const handleSendReply = async (id: string) => {
    const msg = replies[id];
    if (!msg || msg.trim() === '') return;

    setReplyingId(id);
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth?.token}` },
        withCredentials: true,
      };
      const res = await axios.post(
        `${backendUrl}/api/inquiries/${id}/reply`,
        { replyMessage: msg },
        config
      );

      if (res.data.success) {
        (window as any).showToast?.('success', 'Success', 'Response email successfully sent to customer!');
        fetchInquiries();
        setReplies(prev => ({ ...prev, [id]: '' }));
      }
    } catch (err) {
      console.error('Failed to reply to inquiry:', err);
      (window as any).showToast?.('error', 'Error', 'Failed to send reply. Please try again.');
    } finally {
      setReplyingId(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInquiries = inquiries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inquiries.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>Customer Enquiries</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Review table bookings, catering requests, and send responses directly to customer emails.
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem', borderRadius: '16px' }}>
          <i className="pi pi-envelope" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
          <h4 style={{ margin: 0, color: '#475569' }}>No inquiries received yet</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Submitted contact forms will appear here.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {currentInquiries.map((inq) => {
            const isReplied = inq.status === 'Replied';
            return (
              <Card 
                key={inq._id} 
                style={{ 
                  borderRadius: '16px', 
                  border: isReplied ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 700 }}>{inq.fullname}</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.85rem', marginTop: '6px' }}>
                      <span><i className="pi pi-envelope" style={{ marginRight: '4px' }} />{inq.email}</span>
                      <span><i className="pi pi-phone" style={{ marginRight: '4px' }} />{inq.phone}</span>
                      <span><i className="pi pi-calendar" style={{ marginRight: '4px' }} />Submitted: {formatDate(inq.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Tag value={inq.orderType} severity="info" style={{ borderRadius: '8px', padding: '4px 8px' }} />
                    <Tag 
                      value={inq.status} 
                      severity={isReplied ? 'success' : 'warning'} 
                      style={{ borderRadius: '8px', padding: '4px 8px' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>Preferred Dish / Menu Selection</strong>
                    <span style={{ color: '#334155' }}>{inq.preferredDish}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>Dietary Choice</strong>
                    <span style={{ color: '#334155', textTransform: 'capitalize' }}>{inq.dietaryRestrictions || 'None'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>Estimated Group Size</strong>
                    <span style={{ color: '#334155' }}>{inq.guestCount} Guests</span>
                  </div>
                  <div>
                    <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>Requested Event Date</strong>
                    <span style={{ color: '#334155' }}>{inq.eventDate || 'Not specified'}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ color: '#475569', display: 'block', fontSize: '0.9rem', marginBottom: '6px' }}>Enquiry Details:</strong>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    {inq.message}
                  </p>
                </div>

                {isReplied ? (
                  <div style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '1rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#166534', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                      Admin Response:
                    </strong>
                    <p style={{ margin: 0, color: '#15803d', fontSize: '0.92rem' }}>
                      {inq.adminReply}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <InputText
                      value={replies[inq._id] || ''}
                      onChange={(e) => setReplies(prev => ({ ...prev, [inq._id]: e.target.value }))}
                      placeholder="Type your response to the customer here..."
                      style={{ flex: 1, borderRadius: '10px', height: '44px', border: '1.5px solid #cbd5e1' }}
                    />
                    <Button 
                      label={replyingId === inq._id ? 'Sending...' : 'Send Reply'} 
                      icon="pi pi-send" 
                      loading={replyingId === inq._id}
                      onClick={() => handleSendReply(inq._id)}
                      className="p-button-success" 
                      style={{ borderRadius: '10px', height: '44px', padding: '0 20px' }} 
                    />
                  </div>
                )}
              </Card>
            );
          })}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '2rem' }}>
              <Button 
                icon="pi pi-chevron-left" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="p-button-outlined p-button-success" 
                style={{ borderRadius: '8px', width: '36px', height: '36px' }}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <Button 
                  key={pageNum}
                  label={pageNum.toString()} 
                  onClick={() => setCurrentPage(pageNum)} 
                  className={currentPage === pageNum ? "p-button-success" : "p-button-outlined p-button-success"}
                  style={{ borderRadius: '8px', width: '36px', height: '36px', fontWeight: 'bold' }}
                />
              ))}
              <Button 
                icon="pi pi-chevron-right" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="p-button-outlined p-button-success" 
                style={{ borderRadius: '8px', width: '36px', height: '36px' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InquiriesManagement;
