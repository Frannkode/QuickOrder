import React from 'react';
import { Product } from '../../types';
import { Button } from '../../components/Button';
import { Plus, Minus, ShoppingCart, Tag, Heart, Eye, Share2, Boxes } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { OptimizedImage } from './ui/OptimizedImage';

interface ProductCardProps {
    product: Product;
    cartQuantity: number;
    onUpdateQuantity: (id: string, delta: number) => void;
    onAdd: (product: Product) => void;
    onQuickView?: () => void;
    isInWishlist?: boolean;
    onToggleWishlist?: () => void;
    viewMode?: 'grid' | 'list';
    isInCompare?: boolean;
    onToggleCompare?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    cartQuantity,
    onUpdateQuantity,
    onAdd,
    onQuickView,
    isInWishlist = false,
    onToggleWishlist,
    viewMode = 'grid',
    isInCompare = false,
    onToggleCompare
}) => {
    const isWholesale = (cartQuantity > 0 ? cartQuantity : 1) >= product.wholesaleThreshold;
    const displayPrice = isWholesale ? product.priceWholesale : product.priceRetail;

    const stockStatus = product.stock > 20 ? 'high' : product.stock > 0 ? 'medium' : 'low';
    const stockColors = {
        high: 'text-emerald-600 bg-emerald-50',
        medium: 'text-amber-600 bg-amber-50',
        low: 'text-red-600 bg-red-50'
    };

    if (viewMode === 'list') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                <div className="relative md:w-48 h-48 md:h-auto flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden">
                    <OptimizedImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full group-hover:scale-110"
                    />
                    {isWholesale && cartQuantity > 0 && (
                        <div className="absolute top-3 left-3 bg-yellow-400/90 backdrop-blur-sm text-yellow-950 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                            <Tag size={10} />
                            MAYORISTA
                        </div>
                    )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {product.category}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${stockColors[stockStatus]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${stockStatus === 'high' ? 'bg-emerald-500' :
                                    stockStatus === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}></span>
                                {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                            </span>
                        </div>
                        {onToggleWishlist && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
                                className={`p-2 rounded-full transition-all ${isInWishlist ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                            >
                                <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
                            </button>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">
                        {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow leading-relaxed">
                        {product.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col mb-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                    {formatCurrency(displayPrice)}
                                </span>
                                {isWholesale && (
                                    <span className="text-xs text-gray-400 line-through decoration-gray-300">
                                        {formatCurrency(product.priceRetail)}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                Mayorista desde {product.wholesaleThreshold} un.
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {cartQuantity === 0 ? (
                                <Button
                                    onClick={() => onAdd(product)}
                                    fullWidth
                                    className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 dark:shadow-gray-900 rounded-xl py-3"
                                >
                                    <ShoppingCart size={18} className="mr-2" />
                                    Agregar
                                </Button>
                            ) : (
                                <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl p-1.5 flex-grow">
                                    <button
                                        onClick={() => onUpdateQuantity(product.id, -1)}
                                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-lg shadow-sm hover:shadow-md hover:text-brand-800 transition-all border border-brand-100 dark:border-brand-800"
                                    >
                                        <Minus size={20} strokeWidth={2.5} />
                                    </button>
                                    <span className="text-lg font-bold text-brand-900 dark:text-brand-100 w-12 text-center font-mono">
                                        {cartQuantity}
                                    </span>
                                    <button
                                        onClick={() => onAdd(product)}
                                        className="w-10 h-10 flex items-center justify-center bg-brand-600 text-white rounded-lg shadow-brand-200 shadow-md hover:bg-brand-700 hover:shadow-lg hover:scale-105 transition-all"
                                    >
                                        <Plus size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}
                            {onQuickView && (
                                <button
                                    onClick={onQuickView}
                                    className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
                                    title="Vista rápida"
                                >
                                    <Eye size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative">
            {/* Wishlist & Compare Buttons */}
            {onToggleWishlist && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
                    className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-md transition-all ${isInWishlist
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                >
                    <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
                </button>
            )}

            {/* Compare Button */}
            {onToggleCompare && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
                    className={`absolute top-3 left-3 z-20 p-2 rounded-full shadow-md transition-all ${isInCompare
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}
                    title="Comparar"
                >
                    <Boxes size={18} fill={isInCompare ? "currentColor" : "none"} />
                </button>
            )}

            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
                <OptimizedImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {isWholesale && cartQuantity > 0 && (
                    <div className="absolute top-3 left-3 bg-yellow-400/90 backdrop-blur-sm text-yellow-950 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                        <Tag size={10} />
                        PRECIO MAYORISTA
                    </div>
                )}

                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2 z-10">
                    {onQuickView && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onQuickView(); }}
                            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 transition-all flex items-center gap-1"
                        >
                            <Eye size={14} /> Ver
                        </button>
                    )}
                </div>

                {/* Stock Badge */}
                <div className="absolute bottom-3 left-3 z-10">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stockStatus === 'high' ? 'bg-emerald-500/90 text-white' :
                        stockStatus === 'medium' ? 'bg-amber-500/90 text-white' : 'bg-red-500/90 text-white'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-white ${stockStatus === 'low' ? 'animate-pulse' : ''}`}></span>
                        {product.stock > 0 ? `${product.stock} u.` : 'Sin stock'}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow relative">
                <div className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {product.category}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow leading-relaxed">
                    {product.description}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {formatCurrency(displayPrice)}
                            </span>
                            {isWholesale && (
                                <span className="text-xs text-gray-400 line-through decoration-gray-300">
                                    {formatCurrency(product.priceRetail)}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                            <span className="w-1 h-1 rounded-full bg-brand-400 inline-block"></span>
                            Mayorista desde {product.wholesaleThreshold} un. ({formatCurrency(product.priceWholesale)})
                        </span>
                    </div>

                    {cartQuantity === 0 ? (
                        <Button
                            onClick={() => onAdd(product)}
                            fullWidth
                            className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 dark:shadow-gray-900 rounded-xl py-3 group-hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <ShoppingCart size={18} className="transition-transform group-hover:scale-110" />
                                <span className="font-bold">Agregar</span>
                            </div>
                        </Button>
                    ) : (
                        <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl p-1.5 backdrop-blur-sm">
                            <button
                                onClick={() => onUpdateQuantity(product.id, -1)}
                                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-lg shadow-sm hover:shadow-md hover:text-brand-800 dark:hover:text-brand-300 transition-all border border-brand-100 dark:border-brand-800"
                            >
                                <Minus size={20} strokeWidth={2.5} />
                            </button>
                            <span className="text-lg font-bold text-brand-900 dark:text-brand-100 w-12 text-center font-mono">
                                {cartQuantity}
                            </span>
                            <button
                                onClick={() => onAdd(product)}
                                className="w-10 h-10 flex items-center justify-center bg-brand-600 text-white rounded-lg shadow-brand-200 shadow-md hover:bg-brand-700 hover:shadow-lg hover:scale-105 transition-all"
                            >
                                <Plus size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
