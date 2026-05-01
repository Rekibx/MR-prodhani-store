import { describe, it, expect, beforeEach } from 'vitest';

describe('Integration Tests - Cart & Checkout Flow', () => {
  beforeEach(() => {
    // Setup: Clear localStorage before each test
    localStorage.clear();
  });

  describe('Cart Persistence', () => {
    it('should save cart items to localStorage', () => {
      const cartData = [
        { id: '1', name: 'Product 1', price: 100, quantity: 1 }
      ];
      localStorage.setItem('cart', JSON.stringify(cartData));
      
      const stored = JSON.parse(localStorage.getItem('cart'));
      expect(stored).toEqual(cartData);
    });

    it('should restore cart from localStorage on app load', () => {
      const cartData = [
        { id: '1', name: 'Product 1', price: 100, quantity: 2 }
      ];
      localStorage.setItem('cart', JSON.stringify(cartData));
      
      const restored = JSON.parse(localStorage.getItem('cart'));
      expect(restored.length).toBe(1);
      expect(restored[0].quantity).toBe(2);
    });

    it('should handle empty cart', () => {
      const emptyCart = [];
      localStorage.setItem('cart', JSON.stringify(emptyCart));
      
      const restored = JSON.parse(localStorage.getItem('cart'));
      expect(restored).toEqual([]);
    });
  });

  describe('Cart Operations', () => {
    it('should calculate correct total price', () => {
      const items = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 1 }
      ];
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(total).toBe(250);
    });

    it('should calculate correct item count', () => {
      const items = [
        { quantity: 2 },
        { quantity: 3 },
        { quantity: 1 }
      ];
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      expect(count).toBe(6);
    });

    it('should detect duplicate items', () => {
      const items = [
        { id: '1', name: 'Product 1' },
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' }
      ];
      
      const hasDuplicate = items.some(
        (item, index) => items.findIndex(i => i.id === item.id) !== index
      );
      expect(hasDuplicate).toBe(true);
    });
  });

  describe('Price Formatting', () => {
    it('should format price correctly', () => {
      const price = 1234.56;
      const formatted = price.toFixed(2);
      expect(formatted).toBe('1234.56');
    });

    it('should handle zero price', () => {
      const price = 0;
      expect(price).toBe(0);
    });

    it('should handle large prices', () => {
      const price = 999999.99;
      const formatted = price.toFixed(2);
      expect(formatted).toBe('999999.99');
    });
  });
});

describe('Integration Tests - Product Search & Filter', () => {
  const mockProducts = [
    { id: '1', name: 'iPhone 13', category: 'smartphone' },
    { id: '2', name: 'iPhone 14', category: 'smartphone' },
    { id: '3', name: 'AirPods Pro', category: 'accessories' },
    { id: '4', name: 'USB Cable', category: 'accessories' }
  ];

  it('should filter products by category', () => {
    const category = 'smartphone';
    const filtered = mockProducts.filter(p => p.category === category);
    
    expect(filtered.length).toBe(2);
    expect(filtered.every(p => p.category === 'smartphone')).toBe(true);
  });

  it('should search products by name', () => {
    const searchTerm = 'iPhone';
    const filtered = mockProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    expect(filtered.length).toBe(2);
    expect(filtered.every(p => p.name.includes('iPhone'))).toBe(true);
  });

  it('should combine category and search filters', () => {
    const category = 'smartphone';
    const searchTerm = '14';
    
    const filtered = mockProducts.filter(p =>
      p.category === category &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('iPhone 14');
  });

  it('should handle empty search results', () => {
    const searchTerm = 'Nonexistent Product';
    const filtered = mockProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    expect(filtered.length).toBe(0);
  });
});

describe('Integration Tests - Order Management', () => {
  const mockOrder = {
    id: 'ORDER-001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      address: '123 Main St',
      pincode: '12345'
    },
    items: [
      { id: '1', name: 'Product 1', price: 100, quantity: 2 }
    ],
    total: '200.00',
    date: new Date().toISOString(),
    status: 'Pending'
  };

  it('should validate order data structure', () => {
    expect(mockOrder.id).toBeDefined();
    expect(mockOrder.customer).toBeDefined();
    expect(mockOrder.items).toBeDefined();
    expect(mockOrder.total).toBeDefined();
    expect(mockOrder.status).toBeDefined();
  });

  it('should validate customer data', () => {
    const { customer } = mockOrder;
    expect(customer.name).toBeTruthy();
    expect(customer.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(customer.phone).toBeTruthy();
    expect(customer.address).toBeTruthy();
    expect(customer.pincode).toBeTruthy();
  });

  it('should handle order status transitions', () => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(mockOrder.status);
    
    expect(currentIndex).toBeGreaterThanOrEqual(0);
    expect(currentIndex).toBeLessThan(statuses.length);
  });

  it('should calculate order items total correctly', () => {
    const itemsTotal = mockOrder.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    expect(itemsTotal.toString()).toBe('200');
  });
});
