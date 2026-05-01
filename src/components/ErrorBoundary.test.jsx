import { describe, it, expect } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary Component', () => {
  it('component definition exists', () => {
    expect(ErrorBoundary).toBeDefined();
    expect(typeof ErrorBoundary).toBe('function');
  });

  it('is a valid React component', () => {
    expect(ErrorBoundary).toBeTruthy();
  });

  it('has required lifecycle methods', () => {
    expect(ErrorBoundary.getDerivedStateFromError).toBeDefined();
    expect(ErrorBoundary.prototype.componentDidCatch).toBeDefined();
  });
});
