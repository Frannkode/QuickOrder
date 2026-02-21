import React from 'react';
import { ShoppingBag, ArrowLeft, Plus, Minus, Trash2, Send, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';
import { STORE_CONFIG } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

export const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useUIStore();
    const { items: cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCartStore();

    const total = getCartTotal();
    const isBelowMinimum = total < STORE_CONFIG.minOrderAmount;

    const handleWhatsAppCheckout = () => {
        const orderId = Math.random().toString(36).substring(7).toUpperCase();
        let message = `*Hola Muná! Quisiera realizar el siguiente pedido:*%0A%0A`;
        message += `*Pedido ID:* #${orderId}%0A`;
        message += `---------------------------%0A`;

        cartItems.forEach(item => {
            message += `${item.quantity}x ${item.product.name} - $${(item.product.priceRetail * item.quantity).toLocaleString()}%0A`;
        });

        message += `---------------------------%0A`;
        message += `*Total:* $${total.toLocaleString()}%0A%0A`;
        message += `Pagaré al momento de recibir o retirar el pedido. Corríjanme si hay algún error en los precios.`;

        window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${message}`, '_blank');
        // Optionally clear cart after some time or confirmation
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center py-16 px-4">
                    <div className={`w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center border-4 border-dashed shadow-inner transition-transform hover:scale-105 duration-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-brand-50 border-brand-200'
                        }`}>
                        <ShoppingBag className={`w-14 h-14 ${isDarkMode ? 'text-slate-600' : 'text-brand-300'}`} />
                    </div>
                    <h3 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Tu carrito está vacío
                    </h3>
                    <p className={`mb-10 text-lg max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        ¡Agrega algunos de nuestros hermosos vasos y termos para comenzar tu pedido!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-3 bg-brand-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-brand-700 hover:shadow-2xl hover:shadow-brand-500/30 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Explorar Catálogo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => navigate('/')}
                    className={`p-3 rounded-xl border transition-all ${isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                        }`}
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Tu Carrito
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Items List */}
                <div className="lg:col-span-8 space-y-4">
                    <AnimatePresence>
                        {cartItems.map((item) => (
                            <motion.div
                                key={item.product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {item.product.name}
                                    </h3>
                                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {item.product.category}
                                    </p>
                                    <p className={`text-2xl font-black ${isDarkMode ? 'text-brand-400' : 'text-brand-600'}`}>
                                        ${item.product.priceRetail.toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center bg-transparent border-2 rounded-2xl overflow-hidden h-12 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'
                                        }`}>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                                            className={`px-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className={`w-12 text-center font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            className={`px-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all hover:scale-110"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Summary Panel */}
                <div className="lg:col-span-4">
                    <div className={`sticky top-24 p-8 rounded-[2rem] border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                        }`}>
                        <h2 className={`text-2xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Resumen del Pedido
                        </h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-lg">
                                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Subtotal</span>
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    ${total.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Envío</span>
                                <span className="text-green-500 font-bold">A coordinar</span>
                            </div>
                        </div>

                        <div className={`pt-6 border-t mb-8 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Total</span>
                                <span className={`text-3xl font-black ${isDarkMode ? 'text-brand-400' : 'text-brand-600'}`}>
                                    ${total.toLocaleString()}
                                </span>
                            </div>

                            {isBelowMinimum && (
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
                                    Nota: El pedido mínimo es de ${STORE_CONFIG.minOrderAmount.toLocaleString()}.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleWhatsAppCheckout}
                                disabled={isBelowMinimum}
                                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 shadow-xl disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200 dark:shadow-brand-900/20`}
                            >
                                <Send className="w-6 h-6" />
                                Hacer pedido por WhatsApp
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className={`w-full py-5 rounded-2xl font-bold text-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
                                    }`}
                            >
                                Seguir Comprando
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
