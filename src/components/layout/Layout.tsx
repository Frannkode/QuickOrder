import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    ShoppingCart, ShoppingBag, ArrowRight, CheckCircle2,
    MessageCircle, LayoutDashboard, Lock, LogOut, ChevronDown,
    Search, AlertTriangle, CloudOff, Edit2, Plus, Moon, Sun,
    Tag, Phone, MapPin, Instagram, Heart, ArrowUp, Boxes
} from 'lucide-react';

import { useUIStore } from '../../store/useUIStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCompareStore } from '../../store/useCompareStore';

import { CompareModal } from '../modals/CompareModal';
import { CartDrawer } from '../cart/CartDrawer';
import { Toaster, toast } from 'sonner';

const STORE_CONFIG = {
    name: 'Muná',
    phone: '5491112345678', // Replace with real phone
    currency: '$',
    social: {
        instagram: '@muna.ok'
    }
};

export const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { isDarkMode, toggleDarkMode, toggleCartDrawer } = useUIStore();
    const { items: cartItems } = useCartStore();
    const { wishlistIds } = useWishlistStore();
    const { compareList, isCompareModalOpen, setCompareModalOpen } = useCompareStore();

    const [showBackToTop, setShowBackToTop] = React.useState(false);
    const [isAdminMode, setIsAdminMode] = React.useState(false);

    useEffect(() => {
        // Check if we loged in previously 
        const isLogged = localStorage.getItem('isAdminLogged') === 'true';
        setIsAdminMode(isLogged);

        // Check offline status
        const handleOffline = () => {
            toast.error('Sin conexión. Estás viendo la versión offline.');
        };
        window.addEventListener('offline', handleOffline);

        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('isAdminLogged');
        setIsAdminMode(false);
        navigate('/');
        toast.info('Sesión cerrada');
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
            <Toaster
                theme={isDarkMode ? 'dark' : 'light'}
                position="top-right"
                closeButton
                richColors
            />

            {/* Main Header Nav */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
        ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 sm:h-20">
                        {/* Logo and Brand */}
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-200/50 group-hover:scale-105 transition-transform duration-300">
                                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600">
                                    {STORE_CONFIG.name}
                                </h1>
                                <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Distribuidora Mayorista
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:gap-4">
                            <button
                                onClick={toggleDarkMode}
                                className={`p-2 sm:p-2.5 rounded-full transition-colors ${isDarkMode
                                    ? 'hover:bg-slate-800 text-slate-300'
                                    : 'hover:bg-slate-100 text-slate-600'
                                    }`}
                                title="Cambiar tema"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={() => navigate('/wishlist')}
                                className={`p-2 sm:p-2.5 rounded-full transition-colors relative ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                                    } ${location.pathname === '/wishlist' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30' : ''}`}
                            >
                                <Heart className={`w-5 h-5 ${wishlistIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                                {wishlistIds.length > 0 && (
                                    <span className="absolute 0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                                )}
                            </button>

                            {!isAdminMode && (
                                <button
                                    onClick={() => navigate('/admin/login')}
                                    className={`p-2 sm:p-2.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                                        }`}
                                    title="Panel de Admin"
                                >
                                    <Lock className="w-5 h-5" />
                                </button>
                            )}

                            {isAdminMode && (
                                <>
                                    <button
                                        onClick={() => navigate('/admin/dashboard')}
                                        className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${isDarkMode
                                            ? 'bg-slate-800 hover:bg-slate-700 text-brand-400'
                                            : 'bg-brand-50 hover:bg-brand-100 text-brand-600'
                                            }`}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Panel</span>
                                    </button>
                                    <button
                                        onClick={handleAdminLogout}
                                        className="p-2 sm:p-2.5 rounded-full hover:bg-rose-50 text-rose-500 transition-colors"
                                        title="Cerrar sesión"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            <button
                                onClick={toggleCartDrawer}
                                className={`relative p-2 sm:p-3 rounded-full transition-all duration-300 ${totalCartItems > 0
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-200/50 hover:bg-brand-700 hover:scale-105'
                                    : isDarkMode
                                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                                {totalCartItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-bounce-short">
                                        {totalCartItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-20 pb-20 sm:pb-8 min-h-screen">
                <Outlet />
            </main>

            {/* Floating Buttons */}
            {/* Compare Button */}
            {compareList.length > 0 && (
                <button
                    onClick={() => setCompareModalOpen(true)}
                    className="fixed bottom-20 sm:bottom-8 right-4 lg:right-8 z-40 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 animate-bounce-short"
                >
                    <div className="relative">
                        <Boxes className="w-5 h-5" />
                        <span className="absolute -top-2 -right-2 bg-white text-purple-600 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                            {compareList.length}
                        </span>
                    </div>
                    <span className="font-semibold text-sm hidden sm:block">Comparar</span>
                </button>
            )}

            {/* Back to top Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-20 sm:bottom-8 left-4 lg:left-8 z-40 bg-gradient-to-r from-brand-600 to-purple-600 text-white p-3 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_20px_rgba(99,102,241,0.7)] hover:scale-110 transition-all duration-300 animate-fade-in group"
                    aria-label="Volver arriba"
                >
                    <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                </button>
            )}

            {/* Shared Modals & Drawers */}
            <CompareModal />
            <CartDrawer />

        </div>
    );
};
