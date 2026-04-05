import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from './ProductCard';

// Mock the cart hook
const mockAddToCart = vi.fn();
vi.mock('../hooks/useCart', () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}));

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 99,
  image: 'test-image.jpg',
  specs: ['Spec 1', 'Spec 2'],
};

// Wrapper for router context (ProductCard has a Link)
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('ProductCard Component', () => {
  it('renders product details correctly', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹99')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test-image.jpg');
  });

  it('calls addToCart when the button is clicked', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });
});
