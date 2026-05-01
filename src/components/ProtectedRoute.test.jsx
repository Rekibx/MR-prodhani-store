import { describe, it, expect } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute Component', () => {
  it('component definition exists', () => {
    expect(ProtectedRoute).toBeDefined();
    expect(typeof ProtectedRoute).toBe('function');
  });

  it('is a valid React component', () => {
    expect(ProtectedRoute).toBeTruthy();
  });
});
