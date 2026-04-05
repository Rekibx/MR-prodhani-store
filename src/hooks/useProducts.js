import { useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isFirebase = BASE_URL.includes('firebaseio');

const getEndpoint = (path, id = '') => {
  if (isFirebase) {
    return `${BASE_URL.replace(/\/$/, '')}${path}${id ? '/' + id : ''}.json`;
  }
  return `${BASE_URL.replace(/\/$/, '')}${path}${id ? '/' + id : ''}`;
};

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(getEndpoint('/products'));
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      if (!data) {
        setProducts([]);
      } else if (Array.isArray(data)) {
        setProducts(data.filter(Boolean));
      } else {
        const loadedProducts = [];
        for (const key in data) {
          loadedProducts.push({ id: data[key].id || key, ...data[key] });
        }
        setProducts(loadedProducts);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData) => {
    const res = await fetch(getEndpoint('/products'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to add product');
    
    let newProduct;
    if (isFirebase) {
       const firebaseRes = await res.json();
       const newId = firebaseRes.name;
       newProduct = { id: newId, ...productData };
       
       await fetch(getEndpoint('/products', newId), {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: newId })
       });
    } else {
       newProduct = await res.json();
    }
    
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id, productData) => {
    const res = await fetch(getEndpoint('/products', id), {
      method: isFirebase ? 'PATCH' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to update product');
    
    let updatedProduct;
    if (isFirebase) {
       updatedProduct = { id, ...productData };
    } else {
       updatedProduct = await res.json();
    }
    
    setProducts((prev) => prev.map((p) => (String(p.id) === String(id) ? updatedProduct : p)));
    return updatedProduct;
  };

  const deleteProduct = async (id) => {
    const res = await fetch(getEndpoint('/products', id), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: fetchProducts,
  };
}
