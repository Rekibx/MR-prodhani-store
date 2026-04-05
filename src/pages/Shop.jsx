import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import './Shop.css';

export default function Shop() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { products, loading, error } = useProducts();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = filter === 'All' || p.category === filter;
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, filter, debouncedSearch]);

  if (loading)
    return (
      <div className="shop-page">
        <h2 style={{ textAlign: 'center', margin: '4rem' }}>
          Loading products...
        </h2>
      </div>
    );
  if (error)
    return (
      <div className="shop-page">
        <h2 style={{ textAlign: 'center', margin: '4rem', color: 'red' }}>
          Error: {error}
        </h2>
      </div>
    );

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1 className="gradient-text">Our Products</h1>
        <p>Premium refurbished devices and accessories.</p>
      </div>

      <div className="shop-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="shop-filters">
        <button
          className={`btn btn-secondary ${filter === 'All' ? 'active' : ''}`}
          onClick={() => setFilter('All')}
        >
          All
        </button>
        <button
          className={`btn btn-secondary ${filter === 'smartphone' ? 'active' : ''}`}
          onClick={() => setFilter('smartphone')}
        >
          Smartphones
        </button>
        <button
          className={`btn btn-secondary ${filter === 'accessories' ? 'active' : ''}`}
          onClick={() => setFilter('accessories')}
        >
          Accessories
        </button>
      </div>
    </div>

    <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="empty-state">
            <h3>No products found for "{searchQuery}"</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
