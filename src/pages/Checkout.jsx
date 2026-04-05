import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import './Cart.css'; // Reuse cart styles for consistency

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    setSubmitting(true);
    const orderData = {
      customer: formData,
      items: cartItems,
      total: total.toFixed(2),
      date: new Date().toISOString(),
      status: 'Pending',
    };

    try {
      await placeOrder(orderData);
      clearCart();
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="cart-page">
        <div className="empty-cart glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FiCheckCircle size={64} className="text-primary" style={{ marginBottom: '1rem' }} />
          <h2>Order Confirmed!</h2>
          <p>Thank you, {formData.name}. We've received your order.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>
            Back to Shop
          </Link>
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
            <button className="btn-icon" onClick={() => navigate('/cart')} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <FiArrowLeft /> Edit Cart
            </button>
            <h3>Shipping Information</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input required type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
              <input required type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
              <textarea required placeholder="Shipping Address" rows={4} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
              <button type="submit" disabled={submitting} className="btn btn-primary btn-large" style={{ marginTop: '1rem' }}>
                {submitting ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        <div className="cart-summary glass-card">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Items ({cartItems.length})</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Estimated Tax</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="summary-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
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
};
