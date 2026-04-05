import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="gradient-text">
            Premium Tech. Refurbished. redefined.
          </h1>
          <p>
            Discover top-tier smartphones and expert-approved accessories at
            unbeatable prices.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              Shop Now
            </Link>
            <Link to="#deals" className="btn btn-secondary">
              View Deals
            </Link>
          </div>
        </div>
        <div className="hero-image-placeholder">
          <div className="glass-card">
            <h2>iPhone 13 Pro Max</h2>
            <p className="price">$699</p>
            <span className="badge">Excellent Condition</span>
          </div>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <h3>Certified Quality</h3>
          <p>Every device goes through a 90-point inspection.</p>
        </div>
        <div className="feature-card">
          <h3>12-Month Warranty</h3>
          <p>Peace of mind with our comprehensive store warranty.</p>
        </div>
        <div className="feature-card">
          <h3>Fast Free Shipping</h3>
          <p>Get your hands on your new tech in just 2 days.</p>
        </div>
      </section>
    </div>
  );
}
