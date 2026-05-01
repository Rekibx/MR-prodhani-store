import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../components/Toast';
import { validateOrderId, validateEmail } from '../utils/validators';
import { sanitizeInput, sanitizeEmail } from '../utils/sanitize';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiAlertCircle, FiCopy } from 'react-icons/fi';
import './TrackOrder.css';

const STATUS_STEPS = [
  { id: 'Pending', label: 'Order Placed', icon: FiClock },
  { id: 'Processing', label: 'Processing', icon: FiPackage },
  { id: 'Shipped', label: 'In Transit', icon: FiTruck },
  { id: 'Delivered', label: 'Delivered', icon: FiCheckCircle },
];

// Rate limiting configuration: 5 searches per minute per user
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

// Rate limiting tracking (moved outside to persist across navigations)
const searchTimestamps = [];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchOrderById } = useOrders();
  const { addToast } = useToast();
  
  const checkRateLimit = () => {
    const now = Date.now();
    // Remove timestamps older than rate limit window
    const validTimestamps = searchTimestamps.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    searchTimestamps.length = 0;
    searchTimestamps.push(...validTimestamps);
    
    if (searchTimestamps.length >= RATE_LIMIT_MAX) {
      return false; // Rate limit exceeded
    }
    
    // Record this search
    searchTimestamps.push(now);
    return true;
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    
    // Check rate limiting
    if (!checkRateLimit()) {
      setError(`Too many searches. Please wait a minute before trying again. (Max ${RATE_LIMIT_MAX} searches per minute)`);
      addToast('Rate limit exceeded. Please wait before searching again.', 'error');
      return;
    }

    // Validate order ID
    const orderIdValidation = validateOrderId(orderId);
    if (!orderIdValidation.valid) {
      setError(orderIdValidation.error);
      addToast(orderIdValidation.error, 'error');
      return;
    }

    // Validate email if provided
    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        setError(emailValidation.error);
        addToast(emailValidation.error, 'error');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const sanitizedOrderId = sanitizeInput(orderId.trim(), 255);
      const data = await fetchOrderById(sanitizedOrderId);
      if (data) {
        if (email) {
          const sanitizedEmail = sanitizeEmail(email);
          if (data.customer?.email?.toLowerCase() !== sanitizedEmail.toLowerCase()) {
            setError('Order ID and Email mismatch. Please check your details.');
            addToast('Verification failed. Email mismatch.', 'error');
          } else {
            setOrder(data);
            addToast('Order status retrieved successfully.', 'success');
          }
        } else {
          setOrder(data);
          addToast('Order status retrieved successfully.', 'success');
        }
      } else {
        setError('No order found with this ID. Please check and try again.');
        addToast('Order not found.', 'info');
      }
    } catch (
      // eslint-disable-next-line no-unused-vars
      _err
    ) {
      setError('An error occurred while fetching your order.');
      addToast('Failed to connect to database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderId = () => {
    if (!orderId) {
      addToast('No order ID to copy.', 'error');
      return;
    }
    navigator.clipboard.writeText(orderId);
    addToast('Order ID copied to clipboard!', 'success');
  };

  const getStatusIndex = (status) => {
    return STATUS_STEPS.findIndex(step => step.id === status);
  };

  const formatOrderDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="track-page">
      <div className="track-header">
        <h1 className="gradient-text">Track Your Order</h1>
        <p>Enter your Order ID to see real-time updates on your delivery.</p>
      </div>

      <div className="track-search-container glass-card">
        <form onSubmit={handleTrack} className="track-form">
          <div className="input-group">
            <FiSearch className="input-icon" />
            <input
              type="text"
              placeholder="Order ID (e.g. -NoK...)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email (Optional verification)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>
      </div>

      {error && (
        <div className="track-error glass-card">
          <FiAlertCircle /> {error}
        </div>
      )}

      {order && (
        <div className="track-results animate-fade-in">
          <div className="order-summary-card glass-card">
            <div className="summary-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3>Order #{order.id}</h3>
                  <button 
                    className="btn-icon" 
                    title="Copy ID"
                    onClick={handleCopyOrderId}
                    style={{ fontSize: '0.9rem', opacity: 0.6 }}
                  >
                    <FiCopy />
                  </button>
                </div>
                <p className="order-date">Placed on {formatOrderDate(order.date)}</p>
              </div>
              <span className={`status-badge ${order.status?.toLowerCase() || 'pending'}`}>
                {order.status || 'Pending'}
              </span>
            </div>

            <div className="tracking-visual">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = getStatusIndex(order.status || 'Pending') >= index;
                const isActive = order.status === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-icon-wrapper">
                      <Icon className="step-icon" />
                    </div>
                    <span className="step-label">{step.label}</span>
                    {index < STATUS_STEPS.length - 1 && <div className="step-line"></div>}
                  </div>
                );
              })}
            </div>

            <div className="order-details-grid">
              <div className="details-section">
                <h4>Items</h4>
                <div className="track-items-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="track-item">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="track-total">
                    <span>Total Amount</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              </div>
              <div className="details-section">
                <h4>Shipping To</h4>
                <p>{order.customer.name}</p>
                <p>{order.customer.address}</p>
                <p>PIN: {order.customer.pincode}</p>
                <p>Phone: {order.customer.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
