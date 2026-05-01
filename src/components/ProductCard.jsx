import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useToast } from './Toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    addToast(`${product.name} added to cart`, 'success');
  };

  return (
    <div className="product-card glass-card">
      <Link
        to={`/product/${product.id}`}
        className="product-image-link"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="product-image-container">
          <img
            src={product.image || 'https://placehold.co/300x300/1a1a2e/ffffff?text=No+Image'}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
          <span className="product-condition badge">{product.condition}</span>
        </div>
      </Link>
      <div className="product-info">
        <Link
          to={`/product/${product.id}`}
          className="product-name-link"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-specs">
          {(product.specs || [])
            .filter(spec => spec && spec !== 'N/A')
            .join(' • ')}
        </p>
        <div className="product-footer">
          <div className="price-group">
            <span className="product-price">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="product-original-price">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button
            className="btn-icon"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
          >
            <FiShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
