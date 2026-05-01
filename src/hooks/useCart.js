import { useContext } from 'react';
import CartContext from '../context/CartContextObject';

export function useCart() {
  return useContext(CartContext);
}
