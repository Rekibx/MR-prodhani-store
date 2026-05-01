import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { runFirebaseDiagnostics } from './firebase/diagnostics';
import { useFirebaseConnection } from './hooks/useFirebaseConnection';
import { seedDatabase, checkDataIntegrity } from './firebase/seedDatabase';
import { setupGlobalErrorHandling } from './utils/errorReporter';
import './App.css';

function App() {
  const location = useLocation();
  const { connected } = useFirebaseConnection();

  // Run Firebase diagnostics and seed database on app load
  useEffect(() => {
    console.log('🚀 App initialized');
    
    // Setup global error tracking
    setupGlobalErrorHandling();
    
    const initializeApp = async () => {
      try {
        console.log('🔄 Initializing Firebase services...');
        
        // Run diagnostics with a shorter timeout to prevent blocking
        const diagPromise = runFirebaseDiagnostics();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Diagnostics timed out')), 8000)
        );

        const _diagResult = await Promise.race([diagPromise, timeoutPromise]).catch(err => {
          console.warn('⚠️ Firebase diagnostics timed out or failed:', err.message);
          return { allPassed: false };
        });
        
        // Check if database needs seeding
        const integrityPromise = checkDataIntegrity();
        const integrityResult = await Promise.race([
          integrityPromise, 
          new Promise((_, reject) => setTimeout(() => reject(new Error('Integrity check timed out')), 8000))
        ]).catch(err => {
          console.warn('⚠️ Data integrity check timed out:', err.message);
          // If it times out, we'll try to check if it's empty during actual fetching
          return { hasProducts: true, isUnknown: true }; 
        });

        if (integrityResult && !integrityResult.hasProducts && !integrityResult.isUnknown) {
          console.log('📝 Database confirmed empty, seeding with sample data...');
          await seedDatabase();
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    initializeApp();
  }, []);

  // Show connection status
  useEffect(() => {
    if (connected) {
      console.log('✅ Connected to Firebase');
    } else {
      console.warn('⚠️ Not connected to Firebase');
    }
  }, [connected]);

  useEffect(() => {
    const titleMap = {
      '/': 'Home | MR Prodhani Store',
      '/shop': 'Shop | MR Prodhani Store',
      '/cart': 'Your Cart | MR Prodhani Store',
      '/checkout': 'Checkout | MR Prodhani Store',
      '/track': 'Track Order | MR Prodhani Store',
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
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route path="/track" element={<TrackOrder />} />
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
