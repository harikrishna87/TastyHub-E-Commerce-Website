import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';

interface Rating {
  rate: number;
  count: number;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: Rating;
  ingredients: string[];
  calories: number;
  ageRecommendation: string;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rate: number;
  count: number;
  ingredients: string[];
  calories: number;
  ageRecommendation: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
  rate?: string;
  count?: string;
  ingredients?: string;
  calories?: string;
  ageRecommendation?: string;
}

const ProductsPage: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    rate: 0,
    count: 0,
    ingredients: [''],
    calories: 0,
    ageRecommendation: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
      let fetchedProducts: Product[] = [];

      if (Array.isArray(response.data)) {
        fetchedProducts = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const resData = response.data as any;
        fetchedProducts = resData.products || resData.data || resData.result || resData.items || [];
      }
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.title.trim()) errors.title = 'Product title is required';
    if (!formData.description.trim()) errors.description = 'Product description is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Please enter a valid price greater than 0';
    if (!formData.category) errors.category = 'Please select a category';
    if (!formData.image.trim()) errors.image = 'Product image URL is required';
    if (formData.rate < 0 || formData.rate > 5) errors.rate = 'Rating must be between 0 and 5';
    if (formData.count < 0) errors.count = 'Rating count cannot be negative';
    if (formData.ingredients.every(i => i.trim() === '')) errors.ingredients = 'Add at least one ingredient';
    if (formData.calories < 0) errors.calories = 'Calories cannot be negative';
    if (!formData.ageRecommendation.trim()) errors.ageRecommendation = 'Age recommendation is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      rate: 0,
      count: 0,
      ingredients: [''],
      calories: 0,
      ageRecommendation: ''
    });
    setFormErrors({});
    setIsModalVisible(true);
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      rate: product.rating?.rate || 0,
      count: product.rating?.count || 0,
      ingredients: product.ingredients && product.ingredients.length > 0 ? [...product.ingredients] : [''],
      calories: product.calories || 0,
      ageRecommendation: product.ageRecommendation || ''
    });
    setFormErrors({});
    setIsModalVisible(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${backendUrl}/api/products/deleteproduct/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete product.'
      });
    }
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fix the errors in the form before saving.'
      });
      return;
    }

    const productData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: formData.price,
      category: formData.category,
      image: formData.image.trim(),
      rating: {
        rate: formData.rate,
        count: formData.count
      },
      ingredients: formData.ingredients.filter(i => i.trim() !== ''),
      calories: formData.calories,
      ageRecommendation: formData.ageRecommendation.trim()
    };

    try {
      if (editingProduct && editingProduct._id) {
        await axios.put(`${backendUrl}/api/products/updateproduct/${editingProduct._id}`, productData);
        setProducts(products.map(p => p._id === editingProduct._id ? { ...p, ...productData } : p));
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Product updated successfully'
        });
      } else {
        const response = await axios.post(`${backendUrl}/api/products/addproduct`, productData);
        setProducts([...products, response.data]);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Product added successfully'
        });
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save product.'
      });
    }
  };

  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredientField = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const removeIngredientField = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData({ ...formData, ingredients: formData.ingredients.filter((_, i) => i !== index) });
    }
  };

  // --- TABLE COLUMN TEMPLATES ---

  const imageTemplate = (row: Product) => (
    <img
      src={row.image}
      alt={row.title}
      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
      onError={(e) => { (e.target as any).src = 'https://primefaces.org/cdn/primereact/images/logo.png'; }}
    />
  );

  const priceTemplate = (row: Product) => (
    <strong style={{ color: '#22c55e' }}>₹{(row.price || 0).toFixed(2)}</strong>
  );

  const ratingTemplate = (row: Product) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
      <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b' }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <i
            key={idx}
            className={idx < Math.round(row.rating?.rate || 0) ? 'pi pi-star-fill' : 'pi pi-star'}
            style={{ fontSize: '0.8rem' }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({row.rating?.count || 0} reviews)</span>
    </div>
  );

  const categoryTemplate = (row: Product) => (
    <Tag value={row.category} severity="info" style={{ borderRadius: '6px' }} />
  );

  const actionsTemplate = (row: Product) => (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start', alignItems: 'center' }}>
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-plain p-button-sm"
        style={{ color: '#22c55e', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
        onClick={() => handleEditProductClick(row)}
        tooltip="Edit Product"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-plain p-button-sm"
        style={{ color: '#ef4444', padding: '4px', minWidth: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}
        onClick={() => handleDeleteProduct(row._id)}
        tooltip="Delete Product"
      />
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#22c55e' }} />
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Loading Products Catalog...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Toast ref={toast} />
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Products Management</h1>
          <p style={styles.sub}>Add, modify, and delete restaurant items</p>
        </div>
        
        <button onClick={handleAddProductClick} style={styles.addBtn}>
          <i className="pi pi-plus" />
          <span>Add New Product</span>
        </button>
      </div>

      <div style={styles.tablePanel}>
        <DataTable
          value={products}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          className="p-datatable-striped"
          responsiveLayout="scroll"
          tableStyle={{ minWidth: '60rem' }}
          emptyMessage={() => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
              <i className="pi pi-box" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No products available.</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Add new items to showcase in your restaurant menu.</div>
            </div>
          )}
        >
          <Column header="IMAGE" body={imageTemplate} style={{ width: '80px' }} />
          <Column field="title" header="NAME" sortable style={{ fontWeight: 600 }} />
          <Column field="price" header="PRICE" body={priceTemplate} sortable />
          <Column field="category" header="CATEGORY" body={categoryTemplate} sortable />
          <Column field="calories" header="CALORIES" body={(r)=><span>{r.calories} kcal</span>} />
          <Column header="RATING" body={ratingTemplate} />
          <Column header="ACTIONS" body={actionsTemplate} style={{ width: '110px' }} />
        </DataTable>
      </div>

      {/* Product Form Dialog */}
      <Dialog
        header={editingProduct ? 'Edit Restaurant Product' : 'Add New Restaurant Product'}
        visible={isModalVisible}
        style={{ width: '50vw' }}
        onHide={() => setIsModalVisible(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button label="Cancel" className="p-button-text p-button-secondary" onClick={() => setIsModalVisible(false)} />
            <Button label="Save Product" className="p-button-success" onClick={handleSaveProduct} />
          </div>
        }
      >
        <div style={styles.formGrid}>
          {/* Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Product Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              style={styles.input}
            />
            {formErrors.title && <span style={styles.errorText}>{formErrors.title}</span>}
          </div>

          {/* Price */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Price (₹) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleFormChange('price', Number(e.target.value))}
              style={styles.input}
            />
            {formErrors.price && <span style={styles.errorText}>{formErrors.price}</span>}
          </div>

          {/* Category */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <Dropdown
              value={formData.category}
              options={[
                { label: 'Appetizers', value: 'Appetizers' },
                { label: 'Main Course', value: 'Main Course' },
                { label: 'Desserts', value: 'Desserts' },
                { label: 'Beverages', value: 'Beverages' }
              ]}
              onChange={(e) => handleFormChange('category', e.value)}
              placeholder="Select Category"
              style={{ width: '100%' }}
            />
            {formErrors.category && <span style={styles.errorText}>{formErrors.category}</span>}
          </div>

          {/* Calories */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Calories (kcal)</label>
            <input
              type="number"
              value={formData.calories}
              onChange={(e) => handleFormChange('calories', Number(e.target.value))}
              style={styles.input}
            />
            {formErrors.calories && <span style={styles.errorText}>{formErrors.calories}</span>}
          </div>

          {/* Image URL */}
          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <label style={styles.label}>Product Image URL *</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => handleFormChange('image', e.target.value)}
              style={styles.input}
            />
            {formErrors.image && <span style={styles.errorText}>{formErrors.image}</span>}
          </div>

          {/* Description */}
          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <label style={styles.label}>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              style={styles.textarea}
              rows={3}
            />
            {formErrors.description && <span style={styles.errorText}>{formErrors.description}</span>}
          </div>

          {/* Rating Rate */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Initial Rating (0-5)</label>
            <input
              type="number"
              step="0.1"
              value={formData.rate}
              onChange={(e) => handleFormChange('rate', Number(e.target.value))}
              style={styles.input}
            />
            {formErrors.rate && <span style={styles.errorText}>{formErrors.rate}</span>}
          </div>

          {/* Rating Count */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Rating Reviews Count</label>
            <input
              type="number"
              value={formData.count}
              onChange={(e) => handleFormChange('count', Number(e.target.value))}
              style={styles.input}
            />
            {formErrors.count && <span style={styles.errorText}>{formErrors.count}</span>}
          </div>

          {/* Age Recommendation */}
          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <label style={styles.label}>Age Recommendation *</label>
            <input
              type="text"
              value={formData.ageRecommendation}
              onChange={(e) => handleFormChange('ageRecommendation', e.target.value)}
              style={styles.input}
              placeholder="e.g. All ages, 3+ years"
            />
            {formErrors.ageRecommendation && <span style={styles.errorText}>{formErrors.ageRecommendation}</span>}
          </div>

          {/* Ingredients list */}
          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={styles.label}>Ingredients *</label>
              <Button type="button" icon="pi pi-plus" className="p-button-text p-button-success p-button-sm" label="Add Ingredient" onClick={addIngredientField} />
            </div>
            {formData.ingredients.map((ing, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem' }}>
                <input
                  type="text"
                  value={ing}
                  onChange={(e) => updateIngredient(idx, e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Ingredient name"
                />
                <Button type="button" icon="pi pi-trash" className="p-button-danger p-button-text" onClick={() => removeIngredientField(idx)} disabled={formData.ingredients.length <= 1} />
              </div>
            ))}
            {formErrors.ingredients && <span style={styles.errorText}>{formErrors.ingredients}</span>}
          </div>
        </div>
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
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: '1rem',
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
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    border: 'none',
    padding: '0.65rem 1.25rem',
    borderRadius: '12px',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
    transition: 'all 0.2s ease',
  },
  tablePanel: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    padding: '0.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#475569',
  },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    outline: 'none',
  },
  select: {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  textarea: {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.1rem',
  },
};

export default ProductsPage;