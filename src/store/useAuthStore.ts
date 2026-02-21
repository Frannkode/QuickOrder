import { create } from 'zustand';
import { User, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { STORE_CONFIG } from '../../constants';

interface AuthState {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
    checkAdminStatus: (uid: string) => Promise<boolean>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    initializeAuthListener: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAdmin: false,
    isLoading: true,
    error: null,

    checkAdminStatus: async (uid: string) => {
        try {
            const db = getFirestore();
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const currentUser = auth?.currentUser;

            console.log("Checking admin status for UID:", uid, "Email:", currentUser?.email);

            // Check if email is in whitelist
            if (currentUser?.email && STORE_CONFIG.adminEmails.includes(currentUser.email)) {
                console.log("Admin access granted via whitelist");
                return true;
            }

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const isAdmin = userData.role === 'admin';
                console.log("Admin access status from Firestore:", isAdmin);
                return isAdmin;
            }

            console.warn("No user document found for UID:", uid);
            return false;
        } catch (error) {
            console.error("Error checking admin status:", error);
            return false;
        }
    },

    loginWithGoogle: async () => {
        if (!auth) {
            set({ error: 'Firebase Auth is not initialized' });
            return;
        }
        set({ isLoading: true, error: null });
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // State is updated by the listener
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        if (!auth) return;
        set({ isLoading: true });
        try {
            await signOut(auth);
            set({ user: null, isAdmin: false, isLoading: false, error: null });
            localStorage.removeItem('isAdminLogged');
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    initializeAuthListener: () => {
        if (!auth) {
            set({ isLoading: false });
            return;
        }

        // Subscribe to auth state changes
        onAuthStateChanged(auth, async (currentUser) => {
            set({ isLoading: true });
            if (currentUser) {
                const isAdminUser = await get().checkAdminStatus(currentUser.uid);

                // Sync with local storage for protected routes that might check synchronously
                if (isAdminUser) {
                    localStorage.setItem('isAdminLogged', 'true');
                } else {
                    localStorage.removeItem('isAdminLogged');
                }

                set({ user: currentUser, isAdmin: isAdminUser, isLoading: false });
            } else {
                localStorage.removeItem('isAdminLogged');
                set({ user: null, isAdmin: false, isLoading: false });
            }
        });
    }
}));
