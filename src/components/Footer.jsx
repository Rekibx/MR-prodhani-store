import { Link } from 'react-router-dom';
import { FiInstagram, FiPhone, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>MR Prodhani Store</h3>
          <p>
            Premium refurbished smartphones and high-quality accessories. Your
            trusted tech partner.
          </p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/shop">Shop</a>
            </li>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
            <li>
              <Link to="/track">Track Order</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>
            <FiMail /> support@mrprodhanistore.com
          </p>
          <p>
            <FiPhone /> +91 9365647914
          </p>
          <div className="social-links">
            <a
              href="https://www.instagram.com/m.r._prodhani_store?igsh=dTZwam9nczU5M3Zw"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Instagram"
            >
              <FiInstagram /> Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} MR Prodhani Store. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
