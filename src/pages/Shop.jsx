import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../constants';
import './Shop.css';

export default function Shop() {
  const [filter, setFilter] = useState(CATEGORIES.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { products, loading, error } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = filter === CATEGORIES.ALL || p.category === filter;
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, filter, debouncedSearch]);

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < filteredProducts.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading)
    return (
      <div className="shop-page">
        <div className="shop-header">
          <h1 className="gradient-text">Our Products</h1>
          <p>Premium refurbished devices and accessories.</p>
        </div>
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="product-card glass-card">
              <div className="skeleton" style={{ width: '100%', aspectRatio: '4/5', borderRadius: '8px', marginBottom: '1.5rem' }} />
              <div className="skeleton" style={{ height: '20px', width: '80%', borderRadius: '4px', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ height: '14px', width: '60%', borderRadius: '4px', marginBottom: '1.5rem' }} />
              <div className="skeleton" style={{ height: '24px', width: '40%', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <div className="shop-page">
        <div style={{ textAlign: 'center', margin: '4rem auto', maxWidth: '400px' }} className="glass-card">
          <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Connection Error</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
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
          className={`btn btn-secondary ${filter === CATEGORIES.ALL ? 'active' : ''}`}
          onClick={() => setFilter(CATEGORIES.ALL)}
        >
          All
        </button>
        <button
          className={`btn btn-secondary ${filter === CATEGORIES.SMARTPHONE ? 'active' : ''}`}
          onClick={() => setFilter(CATEGORIES.SMARTPHONE)}
        >
          Smartphones
        </button>
        <button
          className={`btn btn-secondary ${filter === CATEGORIES.ACCESSORIES ? 'active' : ''}`}
          onClick={() => setFilter(CATEGORIES.ACCESSORIES)}
        >
          Accessories
        </button>
      </div>
    </div>

    <div className="products-grid">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="empty-state">
            <h3>{debouncedSearch ? `No results for "${debouncedSearch}"` : 'No products available'}</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPage * itemsPerPage >= filteredProducts.length}>Next</button>
      </div>
    </div>
  );
}
