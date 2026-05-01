import { Link, useParams } from 'react-router-dom';
import { FiShoppingCart, FiCheck, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/Toast';
import { APP_TITLE } from '../constants';
import './ProductDetails.css';
import { useEffect } from 'react';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { products, loading } = useProducts();

  const product = products.find((p) => String(p.id) === String(id));

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | ${APP_TITLE}`;
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product);
    addToast(`${product.name} added to cart`, 'success');
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="product-details-container glass-card skeleton-container">
          <div className="skeleton skeleton-image" />
          <div className="skeleton-info">
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-price" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text short" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="product-details-container glass-card" style={{ textAlign: 'center', padding: '4rem', display: 'block' }}>
          <h2>Product Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>The product you are looking for doesn&apos;t exist or has been removed.</p>
          <Link to="/shop" className="btn btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  return (
    <div className="product-details-page">
      <Link to="/shop" className="back-link">
        <FiArrowLeft style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
        Back to Shop
      </Link>

      <div className="product-details-container glass-card">
        <div className="product-gallery">
          <img
            src={product.image || 'https://placehold.co/400x400/1a1a2e/ffffff?text=No+Image'}
            alt={product.name}
            className="main-image"
          />
        </div>

        <div className="product-info-panel">
          <div className="condition-badge">{product.condition} Condition</div>
          <h1 className="product-title">{product.name}</h1>

          <div className="price-section">
            <span className="current-price">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {savings > 0 && (
              <span className="save-badge">Save ₹{savings.toLocaleString()}</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="specs-list">
            <h3>Key Features</h3>
            <ul>
              {(product.specs || [])
                .filter(spec => spec && spec !== 'N/A')
                .map((spec, i) => (
                  <li key={i}>
                    <FiCheck className="text-primary" /> {spec}
                  </li>
                ))}
            </ul>
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              <FiShield size={24} className="text-primary" />
              <span>1 Year Warranty</span>
            </div>
            <div className="trust-badge">
              <FiCheck size={24} className="text-primary" />
              <span>90-Point Inspection</span>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn btn-primary btn-large add-to-cart-btn"
              onClick={handleAddToCart}
            >
              <FiShoppingCart size={20} /> Add to Cart
            </button>
            <Link to="/cart" className="btn btn-secondary btn-large">
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
