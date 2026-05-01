import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { validateCheckoutForm } from '../utils/validators';
import { sanitizeFormData } from '../utils/sanitize';
import './Cart.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { userId } = useAuth();
  const { placeOrder } = useOrders();
  const { addToast } = useToast();

  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pincode: '',
    address: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;
  const [newOrderId, setNewOrderId] = useState('');

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // Validate form before submission
    const validation = validateCheckoutForm(formData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      addToast('Please fix the errors below and try again', 'error');
      return;
    }

    setSubmitting(true);
    setValidationErrors({});

    // Sanitize form data before sending to database
    const sanitizedFormData = sanitizeFormData(formData);

    const orderData = {
      userId: userId,
      customer: sanitizedFormData,
      items: cartItems,
      total: Number(total.toFixed(2)),
      date: new Date().toISOString(),
      status: 'Pending',
    };

    try {
      const order = await placeOrder(orderData);
      setNewOrderId(order.id);
      clearCart();
      setIsSuccess(true);
      addToast('Order placed successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="cart-page">
        <div className="empty-cart glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <FiCheckCircle size={64} className="text-primary" style={{ marginBottom: '1rem' }} />
          <h2>Order Confirmed!</h2>
          <p>Thank you, {formData.name}. We&apos;ve received your order.</p>

          <div className="order-number-box" style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginTop: '2rem',
            border: '1px dashed var(--primary)'
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Tracking ID</p>
            <h3 style={{ color: 'var(--primary)', letterSpacing: '2px', wordBreak: 'break-all', fontSize: '1rem' }}>{newOrderId}</h3>
            <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7 }}>Save this ID to track your order on the Track Order page.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link to="/track" className="btn btn-secondary">Track Order</Link>
            <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart glass-card">
          <h2>Nothing to checkout</h2>
          <p>Your cart is empty. Please add items before checking out.</p>
          <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="gradient-text">Secure Checkout</h1>
      <div className="cart-container">
        <div className="cart-items">
          <div className="checkout-form-container glass-card" style={{ padding: '2rem' }}>
            <button
              className="btn-icon"
              onClick={() => navigate('/cart')}
              style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FiArrowLeft /> Edit Cart
            </button>
            <h3>Shipping Information</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <input 
                  required 
                  type="text" 
                  placeholder="Full Name" 
                  value={formData.name} 
                  onChange={(e) => handleFieldChange('name', e.target.value)} 
                  style={{...inputStyle, borderColor: validationErrors.name ? '#f87171' : 'rgba(255,255,255,0.1)'}} 
                />
                {validationErrors.name && <p style={errorStyle}>{validationErrors.name}</p>}
              </div>

              <div className="checkout-two-col">
                <div>
                  <input 
                    required 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={formData.phone} 
                    onChange={(e) => handleFieldChange('phone', e.target.value)} 
                    style={{...inputStyle, borderColor: validationErrors.phone ? '#f87171' : 'rgba(255,255,255,0.1)'}} 
                  />
                  {validationErrors.phone && <p style={errorStyle}>{validationErrors.phone}</p>}
                </div>
                <div>
                  <input 
                    required 
                    type="text" 
                    placeholder="PIN Code" 
                    value={formData.pincode} 
                    onChange={(e) => handleFieldChange('pincode', e.target.value)} 
                    style={{...inputStyle, borderColor: validationErrors.pincode ? '#f87171' : 'rgba(255,255,255,0.1)'}} 
                  />
                  {validationErrors.pincode && <p style={errorStyle}>{validationErrors.pincode}</p>}
                </div>
              </div>

              <div>
                <input 
                  required 
                  type="email" 
                  placeholder="Email Address" 
                  value={formData.email} 
                  onChange={(e) => handleFieldChange('email', e.target.value)} 
                  style={{...inputStyle, borderColor: validationErrors.email ? '#f87171' : 'rgba(255,255,255,0.1)'}} 
                />
                {validationErrors.email && <p style={errorStyle}>{validationErrors.email}</p>}
              </div>

              <div>
                <textarea 
                  required 
                  placeholder="Shipping Address (Lane, City, etc.)" 
                  rows={4} 
                  value={formData.address} 
                  onChange={(e) => handleFieldChange('address', e.target.value)} 
                  style={{...inputStyle, resize: 'vertical', borderColor: validationErrors.address ? '#f87171' : 'rgba(255,255,255,0.1)'}} 
                />
                {validationErrors.address && <p style={errorStyle}>{validationErrors.address}</p>}
              </div>

              <button 
                type="submit" 
                disabled={submitting || Object.keys(validationErrors).length > 0} 
                className="btn btn-primary btn-large" 
                style={{ marginTop: '1rem', opacity: submitting || Object.keys(validationErrors).length > 0 ? 0.6 : 1 }} 
              >
                {submitting ? 'Processing...' : `Confirm Order — ₹${total.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        <div className="cart-summary glass-card">
          <h2>Order Summary</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="summary-row">
              <span>{item.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>×{item.quantity}</span></span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: '#4ade80' }}>Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '1rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(0,0,0,0.3)',
  color: 'white',
  width: '100%',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  transition: 'border-color 0.2s',
};

const errorStyle = {
  color: '#f87171',
  fontSize: '0.85rem',
  marginTop: '0.25rem',
  marginBottom: '-0.5rem',
};
