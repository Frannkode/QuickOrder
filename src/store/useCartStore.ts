import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../../types';

interface CartState {
  items: { product: Product; quantity: number }[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => {
        set((state) => {
          const existing = state.items.find(item => item.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        });
      },
      updateQuantity: (id, delta) => {
        set((state) => ({
          items: state.items.map(item => {
            if (item.product.id === id) {
              const newQuantity = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQuantity };
            }
            return item;
          }).filter(item => item.quantity > 0)
        }));
      },
      removeFromCart: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== id)
        }));
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.quantity >= item.product.wholesaleThreshold
            ? item.product.priceWholesale
            : item.product.priceRetail;
          return total + (price * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'quickorder-cart-storage',
    }
  )
);
