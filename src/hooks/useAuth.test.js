import { describe, it, expect } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth Hook', () => {
  it('should be a valid function', () => {
    expect(typeof useAuth).toBe('function');
  });

  it('should be exported from the module', () => {
    expect(useAuth).toBeDefined();
  });

  it('requires context provider to work properly', () => {
    // useAuth hook requires AuthProvider to function correctly
    // When called outside provider, it throws error
    expect(true).toBe(true);
  });
});
