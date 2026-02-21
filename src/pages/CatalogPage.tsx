import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowDownAZ, ArrowUpZA, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import { useUIStore } from '../store/useUIStore';
import { ProductCard } from '../components/ProductCard';
import { useCompareStore } from '../store/useCompareStore';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

interface CatalogPageProps {
    products: Product[];
    categories: string[];
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    onQuickView: (product: Product) => void;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export const CatalogPage: React.FC<CatalogPageProps> = ({
    products: staticProducts, categories: rawCategories, activeCategory, setActiveCategory, onQuickView
}) => {
    const categories = useMemo(() => ['Todos', ...rawCategories.filter(c => c !== 'Todos')], [rawCategories]);

    const { isDarkMode } = useUIStore();
    const { toggleCompare, isInCompare } = useCompareStore();
    const { products: firestoreProducts, fetchProducts, isLoading } = useProductStore();
    const { items: cartItems, addToCart, updateQuantity } = useCartStore();
    const { isInWishlist, toggleWishlist } = useWishlistStore();

    const products = firestoreProducts.length > 0 ? firestoreProducts : staticProducts;

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [showFilters, setShowFilters] = useState(false);
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [onlyInStock, setOnlyInStock] = useState(false);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (activeCategory !== 'Todos') {
            result = result.filter(p => p.category === activeCategory);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                (p.description && p.description.toLowerCase().includes(lowerTerm))
            );
        }

        if (minPrice) {
            result = result.filter(p => p.priceRetail >= parseFloat(minPrice));
        }

        if (maxPrice) {
            result = result.filter(p => p.priceRetail <= parseFloat(maxPrice));
        }

        if (onlyInStock) {
            result = result.filter(p => p.stock > 0);
        }

        // Sort logic without mutation
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.priceRetail - b.priceRetail);
                break;
            case 'price-desc':
                result.sort((a, b) => b.priceRetail - a.priceRetail);
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }

        return result;
    }, [products, activeCategory, searchTerm, sortBy, minPrice, maxPrice, onlyInStock]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >

            {/* Search and Filters Header */}
            <div className={`sticky top-16 sm:top-20 z-30 -mx-4 px-4 py-4 sm:mx-0 sm:px-0 sm:py-0 sm:static mb-8 transition-colors ${isDarkMode ? 'bg-slate-900/95 sm:bg-transparent' : 'bg-slate-50/95 sm:bg-transparent'
                } backdrop-blur-md sm:backdrop-blur-none`}>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1 max-w-2xl group">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl opacity-20 group-focus-within:opacity-40 blur transition duration-300`}></div>
                        <div className={`relative flex items-center h-14 rounded-2xl border transition-all duration-300 ${isDarkMode
                            ? 'bg-slate-900/80 border-slate-700 focus-within:border-brand-500/50 focus-within:ring-4 focus-within:ring-brand-500/10'
                            : 'bg-white/80 border-slate-200 focus-within:border-brand-500/50 focus-within:ring-4 focus-within:ring-brand-500/5'
                            } backdrop-blur-xl shadow-sm`}>
                            <Search className={`ml-5 w-5 h-5 transition-colors duration-300 ${isDarkMode ? 'text-slate-500 group-focus-within:text-brand-400' : 'text-slate-400 group-focus-within:text-brand-500'}`} />
                            <input
                                type="text"
                                placeholder="Buscar productos por nombre o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none px-4 text-base font-medium placeholder:text-slate-400 dark:text-white"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="p-2 mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors border ${showFilters
                                ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-400'
                                : isDarkMode
                                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            <span className="hidden sm:inline">Filtros</span>
                        </button>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-medium transition-colors border appearance-none pr-10 bg-no-repeat bg-[right_1rem_center] cursor-pointer outline-none ${isDarkMode
                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 focus:border-brand-500'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus:border-brand-500'
                                }`}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`
                            }}
                        >
                            <option value="default">Recomendados</option>
                            <option value="price-asc">Menor precio</option>
                            <option value="price-desc">Mayor precio</option>
                            <option value="name-asc">A-Z</option>
                            <option value="name-desc">Z-A</option>
                        </select>

                        <div className={`hidden sm:flex flex-shrink-0 items-center p-1 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                            }`}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                                    ? isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                                    : isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                aria-label="Vista de grilla"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                                    ? isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                                    : isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                aria-label="Vista de lista"
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="relative overflow-hidden"
                        >
                            <div className={`p-6 rounded-2xl border backdrop-blur-xl ${isDarkMode
                                ? 'bg-slate-900/40 border-slate-800'
                                : 'bg-white/40 border-slate-200'
                                } shadow-sm`}>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                                    {/* Price Range */}
                                    <div className="md:col-span-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-brand-500/10 dark:bg-brand-500/20">
                                                <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                            </div>
                                            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                Rango de Precio
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Mínimo</label>
                                                <div className="relative group/input">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                                    <input
                                                        type="number"
                                                        value={minPrice}
                                                        onChange={(e) => setMinPrice(e.target.value)}
                                                        className={`w-full bg-transparent border-2 rounded-xl py-2 pl-8 pr-4 text-sm font-semibold transition-all outline-none ${isDarkMode
                                                            ? 'border-slate-800 focus:border-brand-500/50 focus:bg-slate-800/50'
                                                            : 'border-slate-100 focus:border-brand-500/50 focus:bg-white'
                                                            }`}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-700 mt-6 shrink-0"></div>
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Máximo</label>
                                                <div className="relative group/input">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                                    <input
                                                        type="number"
                                                        value={maxPrice}
                                                        onChange={(e) => setMaxPrice(e.target.value)}
                                                        className={`w-full bg-transparent border-2 rounded-xl py-2 pl-8 pr-4 text-sm font-semibold transition-all outline-none ${isDarkMode
                                                            ? 'border-slate-800 focus:border-brand-500/50 focus:bg-slate-800/50'
                                                            : 'border-slate-100 focus:border-brand-500/50 focus:bg-white'
                                                            }`}
                                                        placeholder="S/L"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    <div className="md:col-span-4 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                                                <div className="w-4 h-4 rounded-full border-2 border-green-500"></div>
                                            </div>
                                            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                Stock
                                            </h4>
                                        </div>
                                        <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${onlyInStock
                                            ? 'border-brand-500/30 bg-brand-500/5'
                                            : isDarkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-100 hover:border-slate-200'
                                            }`}>
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold ${onlyInStock ? 'text-brand-600 dark:text-brand-400' : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Solo disponibles</span>
                                                <span className="text-[10px] text-slate-400">Ocultar sin stock</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={onlyInStock}
                                                    onChange={(e) => setOnlyInStock(e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-11 h-6 rounded-full transition-colors ${onlyInStock ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${onlyInStock ? 'translate-x-5' : ''}`}></div>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Actions */}
                                    <div className="md:col-span-3 pb-0.5">
                                        <button
                                            onClick={() => {
                                                setMinPrice('');
                                                setMaxPrice('');
                                                setOnlyInStock(false);
                                            }}
                                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-2 ${isDarkMode
                                                ? 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                                                : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:text-slate-900'
                                                }`}
                                        >
                                            Restablecer filtros
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Categories Bar */}
                <div className="mt-6 relative group/cats">
                    {showLeftArrow && (
                        <button
                            onClick={() => scroll('left')}
                            className={`absolute -left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full shadow-2xl border backdrop-blur-md transition-all duration-300 hidden sm:flex items-center justify-center hover:scale-110 active:scale-95 ${isDarkMode
                                ? 'bg-slate-800/95 border-slate-700 text-white hover:bg-slate-700 hover:border-brand-500/50'
                                : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-brand-500/50'
                                }`}
                            title="Ver categorías anteriores"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        onScroll={checkScroll}
                        className="overflow-x-auto no-scrollbar scroll-smooth flex gap-2 sm:gap-3 px-1 pb-4"
                    >
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`
                                    flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden group/btn
                                    ${activeCategory === category
                                        ? 'text-white shadow-md shadow-brand-500/10 active:scale-95'
                                        : isDarkMode
                                            ? 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:bg-slate-800'
                                            : 'bg-white/50 text-slate-500 hover:text-slate-800 border border-slate-200/50 hover:bg-white hover:shadow-sm'
                                    }
                                `}
                            >
                                {activeCategory === category && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute inset-0 bg-gradient-to-r from-brand-600 to-purple-600 z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{category}</span>
                            </button>
                        ))}
                    </div>

                    {showRightArrow && (
                        <button
                            onClick={() => scroll('right')}
                            className={`absolute -right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full shadow-2xl border backdrop-blur-md transition-all duration-300 hidden sm:flex items-center justify-center hover:scale-110 active:scale-95 ${isDarkMode
                                ? 'bg-slate-800/95 border-slate-700 text-white hover:bg-slate-700 hover:border-brand-500/50'
                                : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-brand-500/50'
                                }`}
                            title="Ver más categorías"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {/* Fades for scroll indicate */}
                    <div className={`absolute -left-1 top-0 bottom-4 w-16 pointer-events-none z-10 bg-gradient-to-r transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'} ${isDarkMode ? 'from-slate-950' : 'from-slate-50'}`}></div>
                    <div className={`absolute -right-1 top-0 bottom-4 w-16 pointer-events-none z-10 bg-gradient-to-l transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'} ${isDarkMode ? 'from-slate-950' : 'from-slate-50'}`}></div>
                </div>
            </div>

            {/* Products Display */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        No se encontraron productos
                    </h3>
                    <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                        Intenta con otros términos de búsqueda o filtros
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setActiveCategory('Todos');
                            setSortBy('default');
                            setMinPrice('');
                            setMaxPrice('');
                            setOnlyInStock(false);
                        }}
                        className="mt-6 text-brand-600 font-semibold hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                        Limpiar todos los filtros
                    </button>
                </div>
            ) : (
                <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
                    }`}>
                    {filteredProducts.map(product => {
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
                                viewMode={viewMode}
                            />
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};
