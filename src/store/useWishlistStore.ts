import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../../types';

interface WishlistState {
    wishlistIds: string[];
    toggleWishlist: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            wishlistIds: [],
            toggleWishlist: (product) => {
                set((state) => {
                    if (state.wishlistIds.includes(product.id)) {
                        return { wishlistIds: state.wishlistIds.filter(id => id !== product.id) };
                    } else {
                        return { wishlistIds: [...state.wishlistIds, product.id] };
                    }
                });
            },
            isInWishlist: (productId) => {
                return get().wishlistIds.includes(productId);
            }
        }),
        {
            name: 'quickorder-wishlist-storage',
        }
    )
);
