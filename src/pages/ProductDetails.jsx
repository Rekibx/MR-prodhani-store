import { Link, useParams } from 'react-router-dom';
import { FiShoppingCart, FiCheck, FiShield } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div className="product-details-page glass-card">
        <h2 style={{ textAlign: 'center', margin: '4rem' }}>Loading...</h2>
      </div>
    );
  }

  const product = products.find((p) => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="product-details-container glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Product Not Found</h2>
          <p>The product you are looking for doesn't exist or has been removed.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <Link to="/shop" className="back-link">
        ← Back to Shop
      </Link>

      <div className="product-details-container glass-card">
        <div className="product-gallery">
          <img src={product.image} alt={product.name} className="main-image" />
        </div>

        <div className="product-info-panel">
          <div className="condition-badge">{product.condition} Condition</div>
          <h1 className="product-title">{product.name}</h1>

          <div className="price-section">
            <span className="current-price">₹{product.price}</span>
            <span className="original-price">₹{product.originalPrice}</span>
            <span className="save-badge">
              Save ₹{product.originalPrice - product.price}
            </span>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="specs-list">
            <h3>Key Features</h3>
            <ul>
              {product.specs.map((spec, i) => (
                <li key={i}>
                  <FiCheck className="text-secondary" /> {spec}
                </li>
              ))}
            </ul>
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              <FiShield size={24} className="text-primary" />
              <span>1 Year Warranty</span>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn btn-primary btn-large add-to-cart-btn"
              onClick={() => addToCart(product)}
            >
              <FiShoppingCart size={20} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
