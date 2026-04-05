import { useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isFirebase = BASE_URL.includes('firebaseio');

const getEndpoint = (path, id = '') => {
  if (isFirebase) {
    return `${BASE_URL.replace(/\/$/, '')}${path}${id ? '/' + id : ''}.json`;
  }
  return `${BASE_URL.replace(/\/$/, '')}${path}${id ? '/' + id : ''}`;
};

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(getEndpoint('/orders'));
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      
      if (!data) {
        setOrders([]);
      } else if (Array.isArray(data)) {
        setOrders(data.filter(Boolean));
      } else {
        const loadedOrders = [];
        for (const key in data) {
          loadedOrders.push({ id: data[key].id || key, ...data[key] });
        }
        setOrders(loadedOrders);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const placeOrder = async (orderData) => {
    const res = await fetch(getEndpoint('/orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to place order');
    
    let newOrder;
    if (isFirebase) {
       const firebaseRes = await res.json();
       const newId = firebaseRes.name;
       newOrder = { id: newId, ...orderData };
       
       await fetch(getEndpoint('/orders', newId), {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: newId })
       });
    } else {
       newOrder = await res.json();
    }
    
    setOrders((prev) => [...prev, newOrder]);
    return newOrder;
  };

  const deleteOrder = async (id) => {
    const res = await fetch(getEndpoint('/orders', id), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete order');
    setOrders((prev) => prev.filter((o) => String(o.id) !== String(id)));
  };

  return {
    orders,
    loading,
    error,
    placeOrder,
    deleteOrder,
    refresh: fetchOrders,
  };
}
