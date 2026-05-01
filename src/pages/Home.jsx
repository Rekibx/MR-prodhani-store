import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="premium-text">
            Flawless Design.<br />Pure Performance.
          </h1>
          <p>
            Experience extraordinary technology curated for the absolute best. Uncompromising quality and timeless execution.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              Explore Collection
            </Link>
          </div>
        </div>
        <Link to="/shop" className="hero-image-container">
          <div className="hero-product-glare"></div>
          <img
            src="/hero-iphone-transparent.png"
            alt="iPhone 16 Pro Max Minimalist"
            className="hero-floating-image"
            style={{
              filter: "drop-shadow(0 20px 40px rgba(161, 161, 166, 0.2))",
              transform: "scale(1.1)"
            }}
          />
        </Link>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">✓</div>
          <h3>Certified Quality</h3>
          <p>Every device goes through a 90-point inspection.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡</div>
          <h3>12-Month Warranty</h3>
          <p>Peace of mind with our comprehensive store warranty.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>Fast Free Shipping</h3>
          <p>Get your hands on your new tech in just 2 days.</p>
        </div>
      </section>
    </div>
  );
}
