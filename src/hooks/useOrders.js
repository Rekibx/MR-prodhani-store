import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:5000/orders';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
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
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to place order');
    const newOrder = await res.json();
    setOrders((prev) => [...prev, newOrder]);
    return newOrder;
  };

  const deleteOrder = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete order');
    setOrders((prev) => prev.filter((o) => o.id !== id));
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
