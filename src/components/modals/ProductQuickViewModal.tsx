import React, { useState } from 'react';
import { X, ShoppingCart, CheckCircle2, Heart } from 'lucide-react';
import { Product } from '../../../types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useUIStore } from '../../store/useUIStore';
import { toast } from 'sonner';

interface ProductQuickViewModalProps {
    product: Product | null;
    onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ product, onClose }) => {
    const { addToCart } = useCartStore();
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const { isDarkMode } = useUIStore();
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const handleAddToCart = () => {
        // Add multiple items if quantity > 1
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        toast.success(`${quantity}x ${product.name} agregado al carrito`);
        onClose();
        setQuantity(1); // Reset
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row max-h-[90vh] ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
                }`}>
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md md:hidden ${isDarkMode ? 'bg-slate-800/80 text-white' : 'bg-white/80 text-slate-800'
                        }`}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image Section */}
                <div className={`w-full md:w-1/2 aspect-square md:aspect-auto ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/products/placeholder.png';
                        }}
                    />
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 flex flex-col p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                    {/* Close Button Desktop */}
                    <div className="hidden md:flex justify-end mb-4">
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${isDarkMode ? 'bg-brand-500/20 text-brand-300' : 'bg-brand-100 text-brand-700'
                                    }`}>
                                    {product.category}
                                </span>
                                <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                    {product.name}
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    toggleWishlist(product);
                                    if (isInWishlist(product.id)) {
                                        toast.info('Eliminado de favoritos');
                                    } else {
                                        toast.info('Agregado a favoritos');
                                    }
                                }}
                                className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${isInWishlist(product.id)
                                    ? 'bg-rose-100 text-rose-500 dark:bg-rose-500/20'
                                    : isDarkMode
                                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-rose-400'
                                        : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                                    }`}
                            >
                                <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <p className={`text-base leading-relaxed mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {product.description || 'Sin descripción disponible para este producto.'}
                        </p>

                        {/* Price Section */}
                        <div className={`p-5 rounded-2xl mb-6 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'
                            }`}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Precio Minorista
                                    </p>
                                    <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                        ${product.priceRetail.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Precio Mayorista
                                    </p>
                                    <p className={`text-xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                        ${product.priceWholesale.toLocaleString()}
                                    </p>
                                    <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Llevando {product.wholesaleThreshold} o más
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2 mb-8">
                            {product.stock > 0 ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className={`font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        Stock Disponible ({product.stock} unidades)
                                    </span>
                                </>
                            ) : (
                                <>
                                    <X className="w-5 h-5 text-rose-500" />
                                    <span className={`font-medium ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                                        Sin Stock Temporalmente
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto">
                        <div className="flex gap-4">
                            <div className={`flex items-center border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                                }`}>
                                <button
                                    className={`px-4 py-3 font-medium transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50 text-slate-800'
                                        }`}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1 || product.stock === 0}
                                >
                                    -
                                </button>
                                <span className={`w-12 text-center font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                    {quantity}
                                </span>
                                <button
                                    className={`px-4 py-3 font-medium transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50 text-slate-800'
                                        }`}
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock || product.stock === 0}
                                >
                                    +
                                </button>
                            </div>

                            <button
                                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${product.stock === 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                                    : 'bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:shadow-lg hover:shadow-brand-500/25 active:scale-95'
                                    }`}
                                disabled={product.stock === 0}
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>{product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
