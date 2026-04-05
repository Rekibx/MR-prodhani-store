import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider } from './CartContext';
import { useCart } from '../hooks/useCart';

describe('Cart Context', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    expect(result.current.cartItems).toEqual([]);
    expect(result.current.cartCount).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addToCart({ id: 1, name: 'Phone', price: 100 });
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0]).toEqual({
      id: 1,
      name: 'Phone',
      price: 100,
      quantity: 1,
    });
    expect(result.current.cartCount).toBe(1);
  });

  it('increments quantity when duplicate item is added', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addToCart({ id: 1, name: 'Phone', price: 100 });
      result.current.addToCart({ id: 1, name: 'Phone', price: 100 });
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
    expect(result.current.cartCount).toBe(2);
  });
});
