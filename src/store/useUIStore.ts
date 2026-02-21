import { create } from 'zustand';

interface UIState {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    isCartDrawerOpen: boolean;
    setCartDrawerOpen: (isOpen: boolean) => void;
    toggleCartDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isDarkMode: false,
    toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        return { isDarkMode: newMode };
    }),
    isLoading: true,
    setIsLoading: (loading) => set({ isLoading: loading }),
    isCartDrawerOpen: false,
    setCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),
    toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen }))
}));

// Initialize theme immediately
if (typeof document !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        useUIStore.setState({ isDarkMode: true });
    }
}
