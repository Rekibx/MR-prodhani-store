import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300));
    expect(result.current).toBe('test');
  });

  it('is a valid function hook', () => {
    expect(typeof useDebounce).toBe('function');
  });

  it('accepts delay parameter', () => {
    const { result: result1 } = renderHook(() => useDebounce('test', 300));
    const { result: result2 } = renderHook(() => useDebounce('test', 500));
    
    expect(result1.current).toBe('test');
    expect(result2.current).toBe('test');
  });

  it('works with empty string', () => {
    const { result } = renderHook(() => useDebounce('', 300));
    expect(result.current).toBe('');
  });

  it('handles different data types', () => {
    // String
    const { result: strResult } = renderHook(() => useDebounce('text', 300));
    expect(typeof strResult.current).toBe('string');

    // Number should be stringified or handled appropriately
    const { result: numResult } = renderHook(() => useDebounce(123, 300));
    expect(numResult.current).toBeDefined();
  });
});
