import { create } from 'zustand';
import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    getFirestore,
    addDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export type OrderStatus = 'pending_payment' | 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
}

export interface AdminOrder {
    id: string;
    shortId: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    notes?: string;
    createdAt: string;
}

interface OrderState {
    orders: AdminOrder[];
    isLoading: boolean;
    error: string | null;
    fetchOrders: () => Promise<void>;
    updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
    updateOrderNotes: (id: string, notes: string) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;
}

const mapFirestoreOrderToAdminOrder = (docId: string, data: any): AdminOrder => {
    let createdAt = new Date().toISOString();
    if (data.createdAt) {
        if (data.createdAt instanceof Timestamp) {
            createdAt = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
            createdAt = data.createdAt;
        }
    }
    return {
        id: docId,
        shortId: data.shortId || docId.slice(0, 6).toUpperCase(),
        customerName: data.customer?.name || data.customerName || 'Cliente',
        customerPhone: data.customer?.phone || data.customerPhone || '',
        customerAddress: data.customer?.address || data.customerAddress,
        items: data.items || [],
        total: data.total || 0,
        status: data.status || 'received',
        notes: data.notes || '',
        createdAt,
    };
};

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    isLoading: false,
    error: null,

    fetchOrders: async () => {
        if (!db) { set({ error: 'Firestore no inicializado' }); return; }
        set({ isLoading: true, error: null });
        try {
            const db = getFirestore();
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const orders: AdminOrder[] = [];
            snap.forEach(d => orders.push(mapFirestoreOrderToAdminOrder(d.id, d.data())));
            set({ orders, isLoading: false });
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    updateOrderStatus: async (id, status) => {
        const db = getFirestore();
        const ref = doc(db, 'orders', id);
        await updateDoc(ref, { status });
        set(state => ({
            orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
        }));
    },

    updateOrderNotes: async (id, notes) => {
        const db = getFirestore();
        const ref = doc(db, 'orders', id);
        await updateDoc(ref, { notes });
        set(state => ({
            orders: state.orders.map(o => o.id === id ? { ...o, notes } : o)
        }));
    },

    deleteOrder: async (id) => {
        const db = getFirestore();
        await deleteDoc(doc(db, 'orders', id));
        set(state => ({ orders: state.orders.filter(o => o.id !== id) }));
    },
}));
