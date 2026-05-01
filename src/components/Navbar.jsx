import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
export default function Navbar() {
  const { cartCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          MR Prodhani Store
        </Link>
        <div 
          className="mobile-menu-overlay"
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            opacity: isMobileMenuOpen ? 1 : 0,
            visibility: isMobileMenuOpen ? 'visible' : 'hidden',
            transition: 'all 0.3s ease',
            zIndex: 98
          }}
        />
        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/shop" className="nav-link" onClick={closeMenu}>
            Shop
          </Link>
          <Link to="/track" className="nav-link" onClick={closeMenu}>
            Track Order
          </Link>
          {isAuthenticated ? (
            <Link to="/admin" className="nav-link" onClick={closeMenu}>
              Admin
            </Link>
          ) : (
            <Link to="/login" className="nav-link" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>
        <div className="navbar-actions">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'inherit',
                fontSize: 'inherit',
                padding: '0.5rem',
              }}
              aria-label="Logout"
            >
              <FiLogOut size={18} /> <span className="logout-text">Logout</span>
            </button>
          )}
          <Link
            to="/cart"
            className="cart-btn"
            style={{ position: 'relative' }}
          >
            <FiShoppingCart size={24} />
            {cartCount > 0 && (
              <span
                className="cart-badge"
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
