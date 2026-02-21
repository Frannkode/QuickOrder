import React, { useEffect } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useUIStore } from '../store/useUIStore';
import { ProductCard } from '../components/ProductCard';
import { useCompareStore } from '../store/useCompareStore';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { Product } from '../../types';

interface WishlistPageProps {
    products: Product[];
    onQuickView: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ products: staticProducts, onQuickView }) => {
    const navigate = useNavigate();
    const { isDarkMode } = useUIStore();
    const { wishlistIds, isInWishlist, toggleWishlist } = useWishlistStore();
    const { toggleCompare, isInCompare } = useCompareStore();
    const { products: firestoreProducts, fetchProducts, isLoading } = useProductStore();
    const { items: cartItems, addToCart, updateQuantity } = useCartStore();

    const products = firestoreProducts.length > 0 ? firestoreProducts : staticProducts;

    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [products.length, fetchProducts]);

    const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

    if (wishlistProducts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8"
            >
                <div className="text-center py-16 px-4">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-rose-50'
                            }`}
                    >
                        <Heart className={`w-12 h-12 ${isDarkMode ? 'text-slate-600' : 'text-rose-300'}`} />
                    </motion.div>
                    <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Tu lista de deseos está vacía
                    </h3>
                    <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Guarda los productos que te gustan para comprarlos más tarde.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200/50 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Explorar catálogo
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={`text-3xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        <Heart className="w-8 h-8 text-rose-500 fill-current" />
                        Mis Favoritos
                    </h1>
                    <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {wishlistProducts.length} {wishlistProducts.length === 1 ? 'producto guardado' : 'productos guardados'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
                {wishlistProducts.map(product => {
                    const cartItem = cartItems.find(item => item.product.id === product.id);
                    return (
                        <ProductCard
                            key={product.id}
                            product={product}
                            cartQuantity={cartItem ? cartItem.quantity : 0}
                            onUpdateQuantity={updateQuantity}
                            onAdd={addToCart}
                            onQuickView={() => onQuickView(product)}
                            isInWishlist={isInWishlist(product.id)}
                            onToggleWishlist={() => toggleWishlist(product)}
                            isInCompare={isInCompare(product.id)}
                            onToggleCompare={() => toggleCompare(product)}
                            viewMode="grid"
                        />
                    );
                })}
            </div>
        </motion.div>
    );
};
