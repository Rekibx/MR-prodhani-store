import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { ref, onValue, push, update, remove, set } from 'firebase/database';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    
    setLoading(true);
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Handle both Array (json-server) and Object (Firebase) styles
        const productsList = Object.keys(data).map(key => {
          const item = data[key];
          return {
            ...item,
            id: key // Use Firebase key as the ID
          };
        }).filter(Boolean);
        setProducts(productsList);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    } catch (err) {
      console.error('Add product error:', err);
      throw err;
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
    } catch (err) {
      console.error('Update product error:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const productRef = ref(db, `products/${id}`);
      await remove(productRef);
    } catch (err) {
      console.error('Delete product error:', err);
      throw err;
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
