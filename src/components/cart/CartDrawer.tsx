import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';
import { OptimizedImage } from '../ui/OptimizedImage';

export const CartDrawer: React.FC = () => {
    const { isCartDrawerOpen, setCartDrawerOpen, isDarkMode } = useUIStore();
    const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCartStore();
    const navigate = useNavigate();

    const handleCheckout = () => {
        setCartDrawerOpen(false);
        navigate('/cart');
    };

    return (
        <AnimatePresence>
            {isCartDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setCartDrawerOpen(false)}
                        className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed top-0 right-0 bottom-0 z-[90] w-full sm:w-[450px] shadow-2xl flex flex-col ${isDarkMode ? 'bg-slate-900 border-l border-slate-800' : 'bg-white'
                            }`}
                    >
                        {/* Header */}
                        <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-brand-900/30' : 'bg-brand-50'}`}>
                                    <ShoppingBag className={`w-5 h-5 ${isDarkMode ? 'text-brand-400' : 'text-brand-600'}`} />
                                </div>
                                <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Tu Carrito ({items.reduce((acc, i) => acc + i.quantity, 0)})
                                </h2>
                            </div>
                            <button
                                onClick={() => setCartDrawerOpen(false)}
                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
                                        }`}>
                                        <ShoppingCart className={`w-10 h-10 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                    </div>
                                    <h3 className={`font-bold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                        Carrito vacío
                                    </h3>
                                    <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                                        Agrega algunos productos para empezar.
                                    </p>
                                    <button
                                        onClick={() => setCartDrawerOpen(false)}
                                        className={`mt-6 font-semibold px-6 py-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-brand-400 hover:bg-slate-700' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                                            }`}
                                    >
                                        Explorar productos
                                    </button>
                                </div>
                            ) : (
                                <motion.div layout className="space-y-4">
                                    {items.map((item) => {
                                        const product = item.product;
                                        const isWholesale = item.quantity >= product.wholesaleThreshold;
                                        const price = isWholesale ? product.priceWholesale : product.priceRetail;
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={product.id}
                                                className={`flex gap-4 p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'
                                                    }`}
                                            >
                                                <OptimizedImage
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className={`w-20 h-20 rounded-xl flex-shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
                                                />
                                                <div className="flex-1 flex flex-col min-w-0">
                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                        <h4 className={`font-semibold text-sm line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                            {product.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => {
                                                                removeFromCart(product.id);
                                                                toast.success('Producto eliminado del carrito');
                                                            }}
                                                            className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${isDarkMode ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                                                                }`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {isWholesale && (
                                                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mr-auto mb-1 ${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                                                            }`}>
                                                            Precio Mayorista
                                                        </span>
                                                    )}

                                                    <div className="mt-auto flex items-center justify-between">
                                                        <p className="font-bold text-brand-600 dark:text-brand-400">
                                                            ${price.toLocaleString()}
                                                        </p>
                                                        <div className={`flex items-center gap-1 p-1 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                                                            }`}>
                                                            <button
                                                                onClick={() => updateQuantity(product.id, -1)}
                                                                className={`p-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-white text-slate-600 shadow-sm hover:shadow'
                                                                    }`}
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className={`w-6 text-center text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    if (item.quantity >= product.stock) {
                                                                        toast.error('No hay más stock disponible');
                                                                    } else {
                                                                        updateQuantity(product.id, 1);
                                                                    }
                                                                }}
                                                                className={`p-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-white text-slate-600 shadow-sm hover:shadow'
                                                                    }`}
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className={`p-4 sm:p-6 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
                                }`}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className={isDarkMode ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>
                                        Total Estimado
                                    </span>
                                    <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        ${getCartTotal().toLocaleString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            clearCart();
                                            toast.info('Carrito vaciado');
                                        }}
                                        className={`py-3.5 rounded-xl font-bold transition-colors border-2 ${isDarkMode
                                            ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        Vaciar
                                    </button>
                                    <button
                                        onClick={handleCheckout}
                                        className="py-3.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        Checkout
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
