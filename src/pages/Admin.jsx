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
  FiUpload,
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

  const handleImageUpload = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product, specs: product.specs?.join(', ') || '' });
  };

  const handleEditSave = async () => {
    const updated = {
      ...editForm,
      price: Number(editForm.price),
      originalPrice: Number(editForm.originalPrice),
      specs: editForm.specs.split(',').map((s) => s.trim()),
    };
    await updateProduct(editingId, updated);
    setEditingId(null);
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
    if (!form.image) return 'Product photo is required.';
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
      setFormError('Failed to save product. Please try again.');
    }
  };

  if (loading || ordersLoading)
    return (
      <div className="admin-page">
        <h2>Loading admin data...</h2>
      </div>
    );
  if (error || ordersError)
    return (
      <div className="admin-page">
        <h2 className="error">{error || ordersError}</h2>
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

      <div
        className="admin-tabs"
        style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}
      >
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
            <span
              style={{
                marginLeft: '8px',
                background: 'white',
                color: 'black',
                borderRadius: '50%',
                padding: '2px 8px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }}
            >
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
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={addForm.price}
                  onChange={(e) =>
                    setAddForm({ ...addForm, price: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Original Price"
                  value={addForm.originalPrice}
                  onChange={(e) =>
                    setAddForm({ ...addForm, originalPrice: e.target.value })
                  }
                />
                <select
                  value={addForm.condition}
                  onChange={(e) =>
                    setAddForm({ ...addForm, condition: e.target.value })
                  }
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                </select>
                <select
                  value={addForm.category}
                  onChange={(e) =>
                    setAddForm({ ...addForm, category: e.target.value })
                  }
                >
                  <option value="smartphone">Smartphone</option>
                  <option value="accessories">Accessories</option>
                </select>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label
                    htmlFor="add-image-upload"
                    className="btn btn-secondary"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                  >
                    <FiUpload /> {addForm.image ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  <input
                    id="add-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) =>
                      handleImageUpload(e.target.files[0], (dataUrl) =>
                        setAddForm({ ...addForm, image: dataUrl })
                      )
                    }
                  />
                  {addForm.image && (
                    <img
                      src={addForm.image}
                      alt="Preview"
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '0.5rem' }}
                    />
                  )}
                </div>
                <input
                  placeholder="Specs (comma separated)"
                  className="full-width"
                  value={addForm.specs}
                  onChange={(e) =>
                    setAddForm({ ...addForm, specs: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  className="full-width"
                  value={addForm.description}
                  onChange={(e) =>
                    setAddForm({ ...addForm, description: e.target.value })
                  }
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={handleAddSave}>
                  <FiSave /> Save Product
                </button>
                <button className="btn btn-secondary" onClick={resetAddForm}>
                  Reset Form
                </button>
              </div>
            </div>
          )}

          <div className="admin-table-container glass-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Condition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    {editingId === product.id ? (
                      <>
                        <td>{product.id}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                            {editForm.image && (
                              <img
                                src={editForm.image}
                                alt="Preview"
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '0.35rem' }}
                              />
                            )}
                            <label
                              htmlFor={`edit-image-${editingId}`}
                              className="btn-icon text-primary"
                              style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              <FiUpload />
                            </label>
                            <input
                              id={`edit-image-${editingId}`}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) =>
                                handleImageUpload(e.target.files[0], (dataUrl) =>
                                  setEditForm((prev) => ({ ...prev, image: dataUrl }))
                                )
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <select
                            value={editForm.condition}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                condition: e.target.value,
                              }))
                            }
                          >
                            <option value="New">New</option>
                            <option value="Like New">Like New</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                          </select>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-icon text-primary"
                            onClick={handleEditSave}
                            aria-label="Save"
                          >
                            <FiSave />
                          </button>
                          <button
                            className="btn-icon text-secondary"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancel"
                          >
                            <FiX />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{product.id}</td>
                        <td>
                          <img
                            src={product.image || PLACEHOLDER_IMAGE}
                            alt={product.name}
                            className="admin-thumb"
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>₹{product.price}</td>
                        <td>
                          <span className="badge">{product.condition}</span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-icon"
                            onClick={() => handleEditClick(product)}
                            aria-label="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon text-danger"
                            onClick={() => deleteProduct(product.id)}
                            aria-label="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
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
                <th>Date</th>
                <th>Customer Name</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: '2rem' }}
                  >
                    No orders found!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>
                      {order.customer.name} ({order.customer.email})
                    </td>
                    <td style={{ fontWeight: 'bold' }}>₹{order.total}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: 'var(--secondary)' }}
                      >
                        Pending
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon text-danger"
                        onClick={() => deleteOrder(order.id)}
                        aria-label="Fulfill/Remove Order"
                      >
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
