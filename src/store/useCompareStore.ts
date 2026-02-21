import { create } from 'zustand';
import { Product } from '../../types';

interface CompareState {
    compareList: Product[];
    toggleCompare: (product: Product) => boolean; // Returns true if it was added/removed successfully
    isInCompare: (productId: string) => boolean;
    removeFromCompare: (productId: string) => void;
    clearCompare: () => void;
    isCompareModalOpen: boolean;
    setCompareModalOpen: (isOpen: boolean) => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
    compareList: [],
    toggleCompare: (product) => {
        const list = get().compareList;
        const exists = list.some(item => item.id === product.id);

        if (exists) {
            set({ compareList: list.filter(item => item.id !== product.id) });
            return true;
        } else {
            if (list.length >= 3) {
                return false; // Can't add more than 3
            }
            set({ compareList: [...list, product] });
            return true;
        }
    },
    isInCompare: (productId) => {
        return get().compareList.some(item => item.id === productId);
    },
    removeFromCompare: (productId) => {
        set((state) => ({
            compareList: state.compareList.filter(item => item.id !== productId)
        }));
    },
    clearCompare: () => set({ compareList: [] }),
    isCompareModalOpen: false,
    setCompareModalOpen: (isOpen) => set({ isCompareModalOpen: isOpen })
}));
