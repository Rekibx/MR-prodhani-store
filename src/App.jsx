import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();

  useEffect(() => {
    const titleMap = {
      '/': 'Home | MR Prodhani Store',
      '/shop': 'Shop | MR Prodhani Store',
      '/cart': 'Your Cart | MR Prodhani Store',
      '/checkout': 'Checkout | MR Prodhani Store',
      '/login': 'Login | MR Prodhani Store',
      '/admin': 'Admin | MR Prodhani Store',
    };
    document.title = titleMap[location.pathname] || 'MR Prodhani Store';
  }, [location]);

  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
