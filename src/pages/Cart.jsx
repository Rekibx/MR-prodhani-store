import { FiTrash2, FiMinus, FiPlus, FiShield } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = 0; // Free shipping promo
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="cart-page">
      <h1 className="gradient-text">Your Cart</h1>

      {cartItems.length > 0 ? (
        <div className="cart-container">
          {/* LEFT SIDE: CART ITEMS */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item glass-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-condition">
                    {item.condition} Condition
                  </p>
                  <div className="cart-item-price">₹{item.price}</div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <FiMinus />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE: SUMMARY */}
          <div className="cart-summary glass-card">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="text-secondary">Free</span>
            </div>

            <div className="summary-row">
              <span>Estimated Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary btn-checkout"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>

            <div className="secure-checkout">
              <FiShield className="text-primary" /> Secure SSL Checkout
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-cart glass-card">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items yet.</p>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
