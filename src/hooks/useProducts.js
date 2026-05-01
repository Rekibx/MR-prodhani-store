import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { ref, onValue, push, update, remove, set } from 'firebase/database';


export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let unsubscribe = null;
    let retryTimeout = null;
    let loadingTimeout = null;
    
    const setupListener = async () => {
      let timedOut = false;
      // Safety timeout warning for slow connections
      loadingTimeout = setTimeout(() => {
        timedOut = true;
        console.warn('⚠️ Products fetch taking longer than expected...');
        setError('Connection to products timed out. Please check your network.');
        setLoading(false);
      }, 15000);

      try {
        console.log('🔄 Setting up products listener (attempt', retryCount + 1, ')');
        const productsRef = ref(db, 'products');
        
        unsubscribe = onValue(productsRef, (snapshot) => {
          if (timedOut) return;
          clearTimeout(loadingTimeout);
          try {
            const data = snapshot.val();
            console.log('📦 Products data received:', data);
            
            if (data) {
              const productsList = Object.keys(data).map(key => {
                const item = data[key];
                return {
                  ...item,
                  id: key
                };
              }).filter(Boolean);
              
              setProducts(productsList);
              setError(null);
              setRetryCount(0);
              console.log(`✅ ${productsList.length} products loaded`);
            } else {
              console.warn('⚠️ No products data available');
              setProducts([]);
            }
            setLoading(false);
          } catch (parseError) {
            console.error('❌ Error parsing products:', parseError);
            setError('Failed to parse product data');
            setLoading(false);
          }
        }, (firebaseError) => {
          clearTimeout(loadingTimeout);
          console.error('🔥 Firebase error:', firebaseError);
          setError(firebaseError.message || 'Failed to load products');
          setLoading(false);
          
          // Retry with exponential backoff (skip if permission denied)
          if (retryCount < 3 && firebaseError.code !== 'PERMISSION_DENIED') {
            const delay = 1000 * Math.pow(2, retryCount);
            console.log(`⏳ Retrying in ${delay}ms...`);
            retryTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1);
              setLoading(true);
            }, delay);
          }
        });
      } catch (setupError) {
        clearTimeout(loadingTimeout);
        console.error('❌ Setup error:', setupError);
        setError('Failed to connect to products');
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        console.log('Unsubscribing from products');
        unsubscribe();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [retryCount]);

  const addProduct = async (productData) => {
    try {
      const productsRef = ref(db, 'products');
      const newProductRef = push(productsRef);
      const newId = newProductRef.key;
      
      const newProduct = {
        ...productData,
        id: newId
      };
      
      await set(newProductRef, newProduct);
      return newProduct;
    } catch (_err) {
      console.error('Add product error:', _err);
      throw _err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const productRef = ref(db, `products/${id}`);
      const updatedData = {
        ...productData,
        id: id // Ensure ID stays consistent
      };
      await update(productRef, updatedData);
      return updatedData;
    } catch (_err) {
      console.error('Update product error:', _err);
      throw _err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const productRef = ref(db, `products/${id}`);
      await remove(productRef);
    } catch (_err) {
      console.error('Delete product error:', _err);
      throw _err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: () => {} // Not strictly needed with onValue
  };
}
