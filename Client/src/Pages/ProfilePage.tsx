import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Upload,
  Modal,
  Tag,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CrownOutlined,
  CameraOutlined,
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  SafetyOutlined,
  KeyOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  image?: string;
  shippingAddress?: ShippingAddress;
}

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [deleteForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);

      const token = authContext?.token || localStorage.getItem('token');

      if (!token) {
        messageApi.error('Authentication token not found. Please login again.');
        setFetchLoading(false);
        return;
      }

      const response = await fetch(`${backendUrl}/api/auth/getme`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfileData(data.user);
        setImageUrl(data.user.image || '');

        const hasShippingAddress =
          data.user.shippingAddress &&
          Object.values(data.user.shippingAddress).some((val) => val);

        setHasAddress(hasShippingAddress);

        form.setFieldsValue({
          fullName: data.user.shippingAddress?.fullName || '',
          phone: data.user.shippingAddress?.phone || '',
          addressLine1: data.user.shippingAddress?.addressLine1 || '',
          addressLine2: data.user.shippingAddress?.addressLine2 || '',
          city: data.user.shippingAddress?.city || '',
          state: data.user.shippingAddress?.state || '',
          postalCode: data.user.shippingAddress?.postalCode || '',
          country: data.user.shippingAddress?.country || '',
        });
      } else {
        messageApi.error(data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      messageApi.error('Failed to fetch profile. Please try logging in again.');
      console.error('Fetch profile error:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = authContext?.token || localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/auth/upload-image`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.image);
        setProfileData(data.user);
        messageApi.success('Image uploaded successfully');

        if (authContext?.user && authContext.token) {
          authContext.login(data.user, authContext.token);
        }
      } else {
        messageApi.error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      messageApi.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddressSubmit = async (values: any) => {
    try {
      setLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/auth/updateprofile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: values.fullName,
            phone: values.phone,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2,
            city: values.city,
            state: values.state,
            postalCode: values.postalCode,
            country: values.country,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(data.user);
        setHasAddress(true);
        setShowAddressModal(false);
        messageApi.success('Address updated successfully');

        if (authContext?.user && authContext.token) {
          authContext.login(data.user, authContext.token);
        }
      } else {
        messageApi.error(data.message || 'Failed to update address');
      }
    } catch (error) {
      messageApi.error('Failed to update address');
      console.error('Update address error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      setPasswordLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/auth/update-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        messageApi.success('Password changed successfully');
        setShowPasswordModal(false);
        passwordForm.resetFields();
      } else {
        messageApi.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      messageApi.error('Failed to change password');
      console.error('Change password error:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (values: any) => {
    try {
      setDeleteLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      if (!token) {
        messageApi.error('Authentication token not found. Please login again.');
        setDeleteLoading(false);
        return;
      }

      const response = await fetch(`${backendUrl}/api/auth/delete-account`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error occurred' }));
        messageApi.error(errorData.message || 'Failed to delete account');
        setDeleteLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        messageApi.success('Account deleted successfully');
        setShowDeleteModal(false);
        deleteForm.resetFields();

        if (authContext?.logout) {
          authContext.logout();
        }

        localStorage.removeItem('token');

        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        messageApi.error(data.message || 'Failed to delete account');
      }
    } catch (error: any) {
      messageApi.error('Failed to delete account. Please try again.');
      console.error('Delete account error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (fetchLoading) {
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
          Loading ProfilePage...
        </div>
      </div>
    );
  }

  const displayUser = profileData || authContext?.user;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: '#f5f5f5',
      }}
    >
      {contextHolder}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Card
          title={
            <span style={{ fontSize: '18px', fontWeight: '500' }}>
              <UserOutlined style={{ marginRight: '8px' }} />
              Personal Information
            </span>
          }
          style={{
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            border: '1px solid #b7eb8f',
            background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(82, 196, 26, 0.1)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(115, 209, 61, 0.08)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '10%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(149, 222, 100, 0.06)',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Row gutter={32} align="middle">
              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      size={180}
                      src={imageUrl || undefined}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: imageUrl ? 'transparent' : '#52c41a',
                        color: '#fff',
                        fontSize: '72px',
                        border: '6px solid #fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    />
                    <Upload
                      showUploadList={false}
                      beforeUpload={(file) => {
                        handleImageUpload(file);
                        return false;
                      }}
                      accept="image/*"
                    >
                      <Button
                        shape="circle"
                        icon={<CameraOutlined />}
                        loading={imageUploading}
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          backgroundColor: '#fff',
                          border: '2px solid #52c41a',
                          color: '#52c41a',
                          width: '48px',
                          height: '48px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      />
                    </Upload>
                  </div>
              </Col>
              <Col xs={24} md={16} style={{ paddingLeft: '32px' }}>
                <Row gutter={[16, 24]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Full Name
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Text style={{ fontSize: '16px', color: '#262626', fontWeight: '500' }}>
                          {displayUser?.name || 'User'}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        User ID
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag style={{ fontSize: '16px', fontWeight: '500', border: '1px dashed' }} color='cyan'>
                          {displayUser?._id ? `${displayUser._id.slice(0, 12).toUpperCase()}...` : 'N/A'}
                        </Tag>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Email Address
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Text style={{ fontSize: '16px', color: '#262626', fontWeight: '500' }}>
                          {displayUser?.email}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Email Status
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag
                          color="green"
                          icon={<MailOutlined />}
                          style={{
                            fontSize: '13px',
                            padding: '4px 12px',
                            fontWeight: '500',
                            border: '1px dashed'
                          }}
                        >
                          Verified
                        </Tag>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Account Type
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag
                          color={displayUser?.role === 'admin' ? 'gold' : 'green'}
                          icon={displayUser?.role === 'admin' ? <CrownOutlined /> : <UserOutlined />}
                          style={{
                            fontSize: '14px',
                            padding: '6px 16px',
                            textTransform: 'capitalize',
                            fontWeight: '500',
                            border: '1px dashed'
                          }}
                        >
                          {displayUser?.role}
                        </Tag>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Account Status
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag
                          color="blue"
                          icon={<SafetyOutlined />}
                          style={{
                            fontSize: '13px',
                            padding: '4px 12px',
                            fontWeight: '500',
                            border: '1px dashed'
                          }}
                        >
                          Active
                        </Tag>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Card>

        {displayUser?.role !== 'admin' && (
          <Card
            title={
              <span>
                <HomeOutlined /> Shipping Address
              </span>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #a8dadc',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #e0f2f7 0%, #ffffff 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
            extra={
              hasAddress && (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setShowAddressModal(true)}
                >
                  Edit
                </Button>
              )
            }
          >
            <div
              style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: 'rgba(24, 144, 255, 0.08)',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'rgba(168, 218, 220, 0.15)',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '60%',
                right: '15%',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(135, 208, 241, 0.1)',
                zIndex: 0,
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              {hasAddress ? (
                <div>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '12px' }}>
                        <Text strong style={{ color: '#666' }}>
                          Full Name
                        </Text>
                        <div>
                          <Text>
                            {profileData?.shippingAddress?.fullName}
                          </Text>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '12px' }}>
                        <Text strong style={{ color: '#666' }}>
                          Phone
                        </Text>
                        <div>
                          <Text>{profileData?.shippingAddress?.phone}</Text>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div style={{ marginBottom: '12px' }}>
                    <Text strong style={{ color: '#666' }}>
                      Address Line 1
                    </Text>
                    <div>
                      <Text>{profileData?.shippingAddress?.addressLine1}</Text>
                    </div>
                  </div>

                  {profileData?.shippingAddress?.addressLine2 && (
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong style={{ color: '#666' }}>
                        Address Line 2
                      </Text>
                      <div>
                        <Text>{profileData?.shippingAddress?.addressLine2}</Text>
                      </div>
                    </div>
                  )}

                  <Row gutter={16} style={{ marginBottom: '12px' }}>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong style={{ color: '#666' }}>
                          City
                        </Text>
                        <div>
                          <Text>{profileData?.shippingAddress?.city}</Text>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong style={{ color: '#666' }}>
                          State
                        </Text>
                        <div>
                          <Text>{profileData?.shippingAddress?.state}</Text>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong style={{ color: '#666' }}>
                          Postal Code
                        </Text>
                        <div>
                          <Text>{profileData?.shippingAddress?.postalCode}</Text>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong style={{ color: '#666' }}>
                          Country
                        </Text>
                        <div>
                          <Text>{profileData?.shippingAddress?.country}</Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px',
                    color: '#999',
                  }}
                >
                  <HomeOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
                  <div style={{ marginBottom: '16px' }}>
                    <Text>No shipping address added yet</Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowAddressModal(true)}
                  >
                    Add Shipping Address
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card
          title={
            <span style={{ color: '#1890ff' }}>
              <SafetyOutlined style={{ marginRight: '8px' }} />
              Security Settings
            </span>
          }
          style={{
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #91d5ff',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(24, 144, 255, 0.1)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(145, 213, 255, 0.12)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '30%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(105, 192, 255, 0.08)',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div>
              <Title level={5} style={{ marginBottom: '8px' }}>
                <KeyOutlined style={{ marginRight: '8px' }} />
                Change Password
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                Keep your account secure by regularly updating your password. Use a strong
                password that includes a mix of letters, numbers, and special characters.
              </Paragraph>
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        <Card
          title={
            <span style={{ color: '#ff4d4f' }}>
              <WarningOutlined style={{ marginRight: '8px' }} />
              Danger Zone
            </span>
          }
          style={{
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #ffccc7',
            background: 'linear-gradient(135deg, #fff1f0 0%, #ffffff 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255, 77, 79, 0.1)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255, 204, 199, 0.15)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '30%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 163, 158, 0.08)',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Title level={5} style={{ marginBottom: '8px', color: '#ff4d4f' }}>
              <DeleteOutlined style={{ marginRight: '8px' }} />
              Delete Account
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
              Once you delete your account, there is no going back. This action cannot be undone.
              All your data including profile information, shipping addresses, and order history will be permanently removed.
            </Paragraph>
            <Paragraph type="secondary" style={{ marginBottom: '0' }}>
              <Text strong style={{ color: '#ff4d4f' }}>
                Warning:
              </Text>{' '}
              This will permanently delete your account and all associated data.
            </Paragraph>
            <Button
              type="primary"
              danger
              size="large"
              icon={<DeleteOutlined />}
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: '8px 16px',
                marginTop: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Delete My Account
            </Button>
          </div>
        </Card>

        <Modal
          title="Shipping Address"
          open={showAddressModal}
          onOk={() => form.submit()}
          onCancel={() => setShowAddressModal(false)}
          confirmLoading={loading}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddressSubmit}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter full name',
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <UserOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="Full name"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter phone number',
                    },
                    {
                      pattern: /^[0-9+-\s()]+$/,
                      message: 'Please enter valid phone number',
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <PhoneOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="+1 (555) 000-0000"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Address Line 1"
              name="addressLine1"
              rules={[
                { required: true, message: 'Please enter address' },
              ]}
            >
              <Input
                prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
                placeholder="Street address"
                size="large"
              />
            </Form.Item>

            <Form.Item label="Address Line 2" name="addressLine2">
              <Input
                prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
                placeholder="Apartment, suite (optional)"
                size="large"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[
                    { required: true, message: 'Please enter city' },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="City"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[
                    { required: true, message: 'Please enter state' },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="State"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Postal Code"
                  name="postalCode"
                  rules={[
                    { required: true, message: 'Please enter postal code' },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="Postal Code"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[
                    { required: true, message: 'Please enter country' },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="Country"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal
          title={
            <span>
              <LockOutlined style={{ marginRight: '8px' }} />
              Change Password
            </span>
          }
          open={showPasswordModal}
          onOk={() => passwordForm.submit()}
          onCancel={() => {
            setShowPasswordModal(false);
            passwordForm.resetFields();
          }}
          confirmLoading={passwordLoading}
          width={500}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: 'Please enter your current password',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter current password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: 'Please enter new password',
                },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters',
                },
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter new password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                {
                  required: true,
                  message: 'Please confirm your new password',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The two passwords do not match')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined style={{ color: '#1890ff' }} />}
                placeholder="Confirm new password"
                size="large"
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <span style={{ color: '#ff4d4f' }}>
              <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
              Confirm Account Deletion
            </span>
          }
          open={showDeleteModal}
          onOk={() => deleteForm.submit()}
          onCancel={() => {
            setShowDeleteModal(false);
            deleteForm.resetFields();
          }}
          confirmLoading={deleteLoading}
          width={500}
          okText="Delete Account"
          okButtonProps={{
            danger: true,
            size: 'large',
          }}
          cancelButtonProps={{
            size: 'large',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <Paragraph style={{ marginBottom: '16px' }}>
              This action is <Text strong style={{ color: '#ff4d4f' }}>permanent and cannot be undone</Text>.
              All your data will be deleted immediately.
            </Paragraph>
            <Paragraph style={{ marginBottom: '0' }}>
              Please enter your password to confirm account deletion:
            </Paragraph>
          </div>
          <Form
            form={deleteForm}
            layout="vertical"
            onFinish={handleDeleteAccount}
          >
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please enter your password to confirm',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#ff4d4f' }} />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};
export type { ShippingAddress };
export default ProfilePage;