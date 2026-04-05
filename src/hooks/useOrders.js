import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { ref, onValue, push, set, remove } from 'firebase/database';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    
    setLoading(true);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setOrders(ordersList);
      } else {
        setOrders([]);
      }
      setLoading(false);
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const placeOrder = async (orderData) => {
    try {
      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);
      const newId = newOrderRef.key;
      const newOrder = {
        ...orderData,
        id: newId
      };
      await set(newOrderRef, newOrder);
      return newOrder;
    } catch (err) {
      console.error('Place order error:', err);
      throw err;
    }
  };

  const deleteOrder = async (id) => {
    try {
      const orderRef = ref(db, `orders/${id}`);
      await remove(orderRef);
    } catch (err) {
      console.error('Delete order error:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    placeOrder,
    deleteOrder,
    refresh: () => {},
  };
}
