import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { ref, onValue, push, set, remove, update, get } from 'firebase/database';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let unsubscribe = null;
    let retryTimeout = null;
    let loadingTimeout = null;
    
    const setupListener = async () => {
      let timedOut = false;
      // Safety timeout to prevent infinite loading
      loadingTimeout = setTimeout(() => {
        timedOut = true;
        console.warn('⚠️ Orders fetch timed out');
        setError('Connection to orders timed out. Please check your network and refresh.');
        setLoading(false);
      }, 15000);

      try {
        console.log('🔄 Setting up orders listener (attempt', retryCount + 1, ')');
        const ordersRef = ref(db, 'orders');
        
        unsubscribe = onValue(ordersRef, (snapshot) => {
          if (timedOut) return; // ignore callbacks after timeout
          clearTimeout(loadingTimeout);
          try {
            const data = snapshot.val();
            console.log('📦 Orders data received:', data);
            
            if (data) {
              const ordersList = Object.keys(data).map(key => ({
                ...data[key],
                id: key
              }));
              setOrders(ordersList);
              setError(null);
              setRetryCount(0);
              console.log(`✅ ${ordersList.length} orders loaded`);
            } else {
              console.warn('⚠️ No orders data available');
              setOrders([]);
            }
            setLoading(false);
          } catch (parseError) {
            console.error('❌ Error parsing orders:', parseError);
            setError('Failed to parse order data');
            setLoading(false);
          }
        }, (firebaseError) => {
          clearTimeout(loadingTimeout);
          console.error('🔥 Firebase error:', firebaseError);
          setError(firebaseError.message || 'Failed to load orders');
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
        setError('Failed to connect to orders');
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        console.log('Unsubscribing from orders');
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

  const placeOrder = async (orderData) => {
    try {
      // Validate userId is present
      if (!orderData.userId) {
        throw new Error('User authentication required to place order');
      }

      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);
      const newId = newOrderRef.key;
      const newOrder = {
        ...orderData,
        id: newId
      };
      await set(newOrderRef, newOrder);
      return newOrder;
    } catch (_err) {
      console.error('Place order error:', _err);
      throw _err;
    }
  };

  const updateOrder = async (id, status) => {
    try {
      const orderRef = ref(db, `orders/${id}`);
      await update(orderRef, { status });
    } catch (_err) {
      console.error('Update order error:', _err);
      throw _err;
    }
  };

  const deleteOrder = async (id) => {
    try {
      const orderRef = ref(db, `orders/${id}`);
      await remove(orderRef);
    } catch (_err) {
      console.error('Delete order error:', _err);
      throw _err;
    }
  };

  const fetchOrderById = async (id) => {
    try {
      const orderRef = ref(db, `orders/${id}`);
      const snapshot = await get(orderRef);
      if (snapshot.exists()) {
        return { ...snapshot.val(), id: id };
      }
      return null;
    } catch (_err) {
      console.error('Fetch order error:', _err);
      throw _err;
    }
  };

  return {
    orders,
    loading,
    error,
    placeOrder,
    updateOrder,
    deleteOrder,
    fetchOrderById,
    refresh: () => {},
  };
}
