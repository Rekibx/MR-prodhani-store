import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiPackage,
  FiLink,
} from 'react-icons/fi';
import './Admin.css';

export default function Admin() {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } =
    useProducts();
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    deleteOrder,
  } = useOrders();

  const [activeTab, setActiveTab] = useState('products');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState('');

  const [addForm, setAddForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    condition: 'New',
    category: 'smartphone',
    image: '',
    description: '',
    specs: '',
  });

  const PLACEHOLDER_IMAGE = 'https://placehold.co/300x300/1a1a2e/ffffff?text=No+Image';

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product, specs: product.specs?.join(', ') || '' });
  };

  const handleEditSave = async () => {
    try {
      const updated = {
        ...editForm,
        price: Number(editForm.price),
        originalPrice: Number(editForm.originalPrice),
        specs: editForm.specs.split(',').map((s) => s.trim()),
      };
      await updateProduct(editingId, updated);
      setEditingId(null);
    } catch (err) {
      setFormError('Failed to update product.');
    }
  };

  const resetAddForm = () => {
    setAddForm({
      name: '',
      price: '',
      originalPrice: '',
      condition: 'New',
      category: 'smartphone',
      image: '',
      description: '',
      specs: '',
    });
    setFormError('');
  };

  const validateForm = (form) => {
    if (!form.name.trim()) return 'Product name is required.';
    if (!form.price || Number(form.price) <= 0) return 'Valid price is required.';
    if (!form.image.trim()) return 'Check if image URL is pasted correctly.';
    return null;
  };

  const handleAddSave = async () => {
    const errorMsg = validateForm(addForm);
    if (errorMsg) {
      setFormError(errorMsg);
      return;
    }

    setFormError('');
    const newProduct = {
      ...addForm,
      price: Number(addForm.price),
      originalPrice: Number(addForm.originalPrice) || Number(addForm.price),
      specs: addForm.specs ? addForm.specs.split(',').map((s) => s.trim()) : ['N/A'],
    };
    
    try {
      await addProduct(newProduct);
      setIsAdding(false);
      resetAddForm();
    } catch (err) {
      setFormError('Failed to save product to Firebase. Please try again.');
    }
  };

  if (loading || ordersLoading)
    return (
      <div className="admin-page">
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2 className="gradient-text">Syncing with Firebase...</h2>
          <p>Connecting to Realtime Database</p>
          <div className="loader" style={{ marginTop: '2rem' }}></div>
        </div>
      </div>
    );

  if (error || ordersError)
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
          onClick={() => setActiveTab('products')}
        >
          Manage Products
        </button>
        <button
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
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
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                </select>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                >
                  <option value="smartphone">Smartphone</option>
                  <option value="accessories">Accessories</option>
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
                          <td>
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
                          <td><input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></td>
                          <td><input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} /></td>
                          <td>
                            <select value={editForm.condition} onChange={(e) => setEditForm({...editForm, condition: e.target.value})}>
                              <option value="New">New</option>
                              <option value="Like New">Like New</option>
                              <option value="Excellent">Excellent</option>
                              <option value="Good">Good</option>
                            </select>
                          </td>
                          <td className="actions-cell">
                            <button className="btn-icon text-primary" onClick={handleEditSave}><FiSave /></button>
                            <button className="btn-icon text-secondary" onClick={() => setEditingId(null)}><FiX /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td><img src={product.image || PLACEHOLDER_IMAGE} alt={product.name} className="admin-thumb" /></td>
                          <td>{product.name}</td>
                          <td>₹{product.price}</td>
                          <td><span className="badge">{product.condition}</span></td>
                          <td className="actions-cell">
                            <button className="btn-icon" onClick={() => handleEditClick(product)}><FiEdit2 /></button>
                            <button className="btn-icon text-danger" onClick={() => deleteProduct(product.id)}><FiTrash2 /></button>
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
                    <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>{order.id}</td>
                    <td>{order.customer.name} <br/> <small>{order.customer.email}</small></td>
                    <td style={{ fontWeight: 'bold' }}>₹{order.total}</td>
                    <td><span className="badge" style={{ backgroundColor: 'var(--secondary)' }}>Pending</span></td>
                    <td className="actions-cell">
                      <button className="btn-icon text-danger" onClick={() => deleteOrder(order.id)} title="Remove/Archive">
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
