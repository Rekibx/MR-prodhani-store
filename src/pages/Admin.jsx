import { useState } from 'react';
import { useFirebaseConnection } from '../hooks/useFirebaseConnection';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../components/Toast';
import { validateProductForm } from '../utils/validators';
import { sanitizeProductData } from '../utils/sanitize';
import { seedDatabase } from '../firebase/seedDatabase';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiPackage,
  FiLink,
} from 'react-icons/fi';
import { CATEGORIES, CONDITIONS } from '../constants';
import './Admin.css';

export default function Admin() {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } =
    useProducts();
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    updateOrder,
    deleteOrder,
  } = useOrders();
  // eslint-disable-next-line no-unused-vars
  const { connected, isTimedOut } = useFirebaseConnection();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('products');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState('');

  const [addForm, setAddForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    condition: CONDITIONS[0],
    category: CATEGORIES.SMARTPHONE,
    image: '',
    description: '',
    specs: '',
  });

  const PLACEHOLDER_IMAGE = 'https://placehold.co/300x300/1a1a2e/ffffff?text=No+Image';

  const handleEditClick = (product) => {
    setEditingId(product.id);
    const specsString = Array.isArray(product.specs) ? product.specs.join(', ') : (product.specs || '');
    setEditForm({ ...product, specs: specsString });
  };

  const handleEditSave = async () => {
    const validation = validateProductForm(editForm);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      setFormError(firstError);
      addToast(firstError, 'error');
      return;
    }

    try {
      setFormError('');
      const sanitized = sanitizeProductData(editForm);
      const updated = {
        ...sanitized,
        price: Number(sanitized.price),
        originalPrice: Number(editForm.originalPrice) || Number(sanitized.price),
        specs: typeof editForm.specs === 'string'
          ? editForm.specs.split(',').map((s) => s.trim()).filter(Boolean)
          : (editForm.specs || ['N/A']),
      };
      await updateProduct(editingId, updated);
      setEditingId(null);
      addToast('Product updated successfully.', 'success');
    } catch {
      setFormError('Failed to update product.');
      addToast('Failed to update product.', 'error');
    }
  };

  const resetAddForm = () => {
    setAddForm({
      name: '',
      price: '',
      originalPrice: '',
      condition: CONDITIONS[0],
      category: CATEGORIES.SMARTPHONE,
      image: '',
      description: '',
      specs: '',
    });
    setFormError('');
  };

  // eslint-disable-next-line no-unused-vars
  const validateForm = (form) => {
    const validation = validateProductForm(form);
    return validation.valid ? null : Object.values(validation.errors)[0];
  };

  const handleAddSave = async () => {
    const validation = validateProductForm(addForm);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      setFormError(firstError);
      addToast(firstError, 'error');
      return;
    }

    setFormError('');
    const sanitized = sanitizeProductData(addForm);
    const newProduct = {
      ...sanitized,
      price: Number(sanitized.price),
      originalPrice: Number(sanitized.price),
      specs: addForm.specs ? addForm.specs.split(',').map((s) => s.trim()).filter(Boolean) : ['N/A'],
    };
    
    try {
      await addProduct(newProduct);
      setIsAdding(false);
      resetAddForm();
      addToast('Product added successfully to inventory.', 'success');
    } catch (err) {
      console.error('Add product error:', err);
      setFormError('Failed to save product to Firebase. Please try again.');
      addToast('Database save failed.', 'error');
    }
  };


  if (loading || ordersLoading)
    return (
      <div className="admin-page">
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          {isTimedOut ? (
            <>
              <h2 className="error">Connectivity Issue</h2>
              <p>Firebase is taking longer than usual to respond. This might be due to a slow network or configuration issue.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => window.location.reload()} 
                >
                  Retry Connection
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={async () => {
                    try {
                      addToast('Attempting to seed database...', 'info');
                      const result = await seedDatabase();
                      if (result.success) {
                        addToast('Database seeded successfully!', 'success');
                        window.location.reload();
                      } else {
                        addToast('Seeding failed: ' + result.error, 'error');
                      }
                    } catch (err) {
                      addToast('Action failed', 'error');
                    }
                  }} 
                >
                  Force Seed Data
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="gradient-text">Syncing with Firebase...</h2>
              <p>Establishing secure connection to Realtime Database</p>
              <div className="loader" style={{ marginTop: '2rem' }}></div>
            </>
          )}
        </div>
      </div>
    );


  if (error || ordersError) {
    const isPermissionError = String(error).toLowerCase().includes('permission') || String(ordersError).toLowerCase().includes('permission');
    
    if (isPermissionError) {
      return (
        <div className="admin-page">
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <h2 className="error" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied</h2>
            <p>You do not have administrator privileges to view this dashboard.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
              Your account is a standard customer account.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-page">
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <h2 className="error">Database Connection Error</h2>
          <p>{error || ordersError}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="gradient-text">Admin Dashboard</h1>
        {activeTab === 'products' && (
          <button
            className="btn btn-primary"
            onClick={() => setIsAdding(!isAdding)}
          >
            <FiPlus /> {isAdding ? 'Cancel' : 'Add Product'}
          </button>
        )}
      </div>

      <div className="admin-tabs" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('products');
            setFormError('');
          }}
        >
          Manage Products
        </button>
        <button
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('orders');
            setFormError('');
          }}
          style={{ position: 'relative' }}
        >
          Manage Orders
          {orders.length > 0 && (
            <span style={{
              marginLeft: '8px',
              background: 'white',
              color: 'black',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}>
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'products' ? (
        <>
          {isAdding && (
            <div className="admin-card add-product-card glass-card">
              <h3>Add New Product</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                Tip: Upload your image to <a href="https://postimages.org" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>PostImages.org</a> and paste the <b>Direct Link</b> here.
              </p>
              {formError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                }}>{formError}</div>
              )}
              <div className="form-grid">
                <input
                  placeholder="Name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Original Price (₹)"
                  value={addForm.originalPrice}
                  onChange={(e) => setAddForm({ ...addForm, originalPrice: e.target.value })}
                />
                <select
                  value={addForm.condition}
                  onChange={(e) => setAddForm({ ...addForm, condition: e.target.value })}
                >
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                >
                  <option value={CATEGORIES.SMARTPHONE}>Smartphone</option>
                  <option value={CATEGORIES.ACCESSORIES}>Accessories</option>
                </select>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <FiLink style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input
                      placeholder="Paste Image URL here..."
                      style={{ paddingLeft: '2.5rem' }}
                      value={addForm.image}
                      onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                    />
                  </div>
                  {addForm.image && (
                    <div style={{ position: 'relative', width: 60, height: 60 }}>
                      <img src={addForm.image} alt="Preview" onError={(e) => e.target.src = PLACEHOLDER_IMAGE} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                    </div>
                  )}
                </div>

                <input
                  placeholder="Specs (comma separated)"
                  className="full-width"
                  value={addForm.specs}
                  onChange={(e) => setAddForm({ ...addForm, specs: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  className="full-width"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={handleAddSave}>
                  <FiSave /> Save Product
                </button>
                <button className="btn btn-secondary" onClick={resetAddForm}>Reset Form</button>
              </div>
            </div>
          )}

          <div className="admin-table-container glass-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Condition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No products in Firebase yet. Click "Add Product" to start.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      {editingId === product.id ? (
                        <>
                          <td data-label="Image">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                              <img src={editForm.image || PLACEHOLDER_IMAGE} alt="Preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '0.35rem' }} />
                              <input
                                placeholder="Edit URL"
                                style={{ fontSize: '0.7rem', padding: '0.2rem' }}
                                value={editForm.image}
                                onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                              />
                            </div>
                          </td>
                          <td data-label="Name"><input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></td>
                          <td data-label="Price"><input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} /></td>
                          <td data-label="Condition">
                            <select value={editForm.condition} onChange={(e) => setEditForm({...editForm, condition: e.target.value})}>
                              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td data-label="Actions" className="actions-cell">
                            <button className="btn-icon text-primary" onClick={handleEditSave}><FiSave /></button>
                            <button className="btn-icon text-secondary" onClick={() => setEditingId(null)}><FiX /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td data-label="Image"><img src={product.image || PLACEHOLDER_IMAGE} alt={product.name} className="admin-thumb" /></td>
                          <td data-label="Name">{product.name}</td>
                          <td data-label="Price">₹{product.price}</td>
                          <td data-label="Condition"><span className="badge">{product.condition}</span></td>
                          <td data-label="Actions" className="actions-cell">
                            <button className="btn-icon" onClick={() => handleEditClick(product)}><FiEdit2 /></button>
                            <button className="btn-icon text-danger" onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                                deleteProduct(product.id);
                              }
                            }}><FiTrash2 /></button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </>
      ) : (
        <div className="admin-table-container glass-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No orders found!</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Order ID" style={{ fontSize: '0.8rem', opacity: 0.7, wordBreak: 'break-all' }}>{order.id}</td>
                    <td data-label="Customer">
                      <div style={{ fontWeight: 'bold' }}>{order.customer.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{order.customer.phone}</div>
                      <small style={{ display: 'block', margin: '4px 0', opacity: 0.8 }}>{order.customer.email}</small>
                      <small style={{ display: 'block', fontSize: '0.75rem', maxWidth: '200px', lineHeight: 1.2 }}>
                        {order.customer.address},<br />
                        PIN: <strong>{order.customer.pincode}</strong>
                      </small>
                    </td>
                    <td data-label="Total" style={{ fontWeight: 'bold' }}>₹{order.total}</td>
                    <td data-label="Status">
                      <select
                        value={order.status || 'Pending'}
                        onChange={(e) => updateOrder(order.id, e.target.value)}
                        className="status-select"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: 'var(--primary)',
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td data-label="Action" className="actions-cell">
                      <button className="btn-icon text-danger" onClick={() => {
                        if (window.confirm('Archive this order? It will be removed from the active dashboard.')) {
                          deleteOrder(order.id);
                        }
                      }} title="Remove/Archive">
                        <FiPackage />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
