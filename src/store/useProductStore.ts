import { create } from 'zustand';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Product } from '../../types';

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    fetchProducts: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

// Mapper to safely cast Firestore timestamps or missing fields to our TS types
const mapFirestoreDocToProduct = (docId: string, data: any): Product => {
    return {
        id: docId,
        name: data.name || 'Sin nombre',
        priceRetail: data.priceRetail || data.price || 0,
        priceWholesale: data.priceWholesale || 0,
        wholesaleThreshold: data.wholesaleThreshold || data.wholesaleMinQuantity || 1,
        imageUrl: data.imageUrl || (data.images && data.images.length > 0 ? data.images[0] : (data.image ? data.image : '')),
        category: data.category || 'Sin categoría',
        description: data.description || '',
        stock: data.stock || 0
    };
};

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    isLoading: false,
    error: null,

    fetchProducts: async () => {
        if (!db) {
            set({ error: 'Firebase Firestore no inicializado' });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const fetchedProducts: Product[] = [];
            querySnapshot.forEach((document) => {
                fetchedProducts.push(mapFirestoreDocToProduct(document.id, document.data()));
            });

            set({ products: fetchedProducts, isLoading: false });
        } catch (error: any) {
            console.error("Error fetching products:", error);
            set({ error: error.message, isLoading: false });
        }
    },

    addProduct: async (newProductData) => {
        if (!db) throw new Error('Firebase Firestore no inicializado');

        set({ isLoading: true, error: null });
        try {
            const docRef = await addDoc(collection(db, 'products'), {
                ...newProductData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            const newProduct = { ...newProductData, id: docRef.id } as Product;
            set((state) => ({
                products: [newProduct, ...state.products],
                isLoading: false
            }));

            return docRef.id;
        } catch (error: any) {
            console.error("Error adding product:", error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateProduct: async (id, updates) => {
        if (!db) throw new Error('Firebase Firestore no inicializado');

        set({ isLoading: true, error: null });
        try {
            const productRef = doc(db, 'products', id);
            await updateDoc(productRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });

            set((state) => ({
                products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
                isLoading: false
            }));
        } catch (error: any) {
            console.error("Error updating product:", error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteProduct: async (id) => {
        if (!db) throw new Error('Firebase Firestore no inicializado');

        set({ isLoading: true, error: null });
        try {
            await deleteDoc(doc(db, 'products', id));

            set((state) => ({
                products: state.products.filter(p => p.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            console.error("Error deleting product:", error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
