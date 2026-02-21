import React from 'react';
import { X, ExternalLink, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../../../types';
import { useCompareStore } from '../../store/useCompareStore';
import { useUIStore } from '../../store/useUIStore';

export const CompareModal: React.FC = () => {
    const { compareList, removeFromCompare, clearCompare, isCompareModalOpen, setCompareModalOpen } = useCompareStore();
    const { isDarkMode } = useUIStore();

    if (!isCompareModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setCompareModalOpen(false)}
            />
            <div className={`relative w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'
                    }`}>
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            Comparación de Productos
                        </h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {compareList.length} de 3 productos
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {compareList.length > 0 && (
                            <button
                                onClick={clearCompare}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Limpiar Todo</span>
                            </button>
                        )}
                        <button
                            onClick={() => setCompareModalOpen(false)}
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto overflow-x-auto custom-scrollbar">
                    {compareList.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
                                }`}>
                                <ExternalLink className={`w-10 h-10 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                Lista de comparación vacía
                            </h3>
                            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                                Agrega productos usando el botón de comparar en el catálogo.
                            </p>
                            <button
                                onClick={() => setCompareModalOpen(false)}
                                className="mt-6 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
                            >
                                Volver al catálogo
                            </button>
                        </div>
                    ) : (
                        <div className="min-w-[800px]">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="w-1/4 p-4 text-left font-medium text-slate-500 sticky left-0 z-10 bg-inherit border-b border-slate-200 dark:border-slate-800">
                                            Características
                                        </th>
                                        {compareList.map(product => (
                                            <th key={product.id} className="w-1/4 p-4 text-center border-b border-slate-200 dark:border-slate-800">
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => removeFromCompare(product.id)}
                                                        className="absolute -top-2 -right-2 p-1.5 bg-rose-100 text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-200"
                                                        title="Quitar"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '/images/products/placeholder.png';
                                                            }}
                                                        />
                                                    </div>
                                                    <h4 className={`font-bold text-sm line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                        {product.name}
                                                    </h4>
                                                </div>
                                            </th>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                                            <th key={`empty-${idx}`} className="w-1/4 p-4 border-b border-slate-200 dark:border-slate-800">
                                                <div className={`aspect-square rounded-xl flex flex-col justify-center items-center border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                                                    }`}>
                                                    <span className={isDarkMode ? 'text-slate-500 text-sm' : 'text-slate-400 text-sm'}>
                                                        Espacio vacío
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    <tr>
                                        <td className={`p-4 font-medium sticky left-0 z-10 ${isDarkMode ? 'text-slate-300 bg-slate-900' : 'text-slate-600 bg-white'}`}>
                                            Precio Minorista
                                        </td>
                                        {compareList.map(product => (
                                            <td key={`retail-${product.id}`} className="p-4 text-center text-lg font-bold text-brand-600 dark:text-brand-400">
                                                ${product.priceRetail.toLocaleString()}
                                            </td>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`e-ret-${idx}`} />)}
                                    </tr>
                                    <tr>
                                        <td className={`p-4 font-medium sticky left-0 z-10 ${isDarkMode ? 'text-slate-300 bg-slate-900' : 'text-slate-600 bg-white'}`}>
                                            Precio Mayorista
                                        </td>
                                        {compareList.map(product => (
                                            <td key={`whole-${product.id}`} className={`p-4 text-center font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                                ${product.priceWholesale.toLocaleString()}
                                            </td>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`e-wh-${idx}`} />)}
                                    </tr>
                                    <tr>
                                        <td className={`p-4 font-medium sticky left-0 z-10 ${isDarkMode ? 'text-slate-300 bg-slate-900' : 'text-slate-600 bg-white'}`}>
                                            Min. Mayorista
                                        </td>
                                        {compareList.map(product => (
                                            <td key={`min-${product.id}`} className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {product.wholesaleThreshold} un.
                                                </span>
                                            </td>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`e-min-${idx}`} />)}
                                    </tr>
                                    <tr>
                                        <td className={`p-4 font-medium sticky left-0 z-10 ${isDarkMode ? 'text-slate-300 bg-slate-900' : 'text-slate-600 bg-white'}`}>
                                            Categoría
                                        </td>
                                        {compareList.map(product => (
                                            <td key={`cat-${product.id}`} className={`p-4 text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {product.category}
                                            </td>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`e-cat-${idx}`} />)}
                                    </tr>
                                    <tr>
                                        <td className={`p-4 font-medium sticky left-0 z-10 ${isDarkMode ? 'text-slate-300 bg-slate-900' : 'text-slate-600 bg-white'}`}>
                                            Stock
                                        </td>
                                        {compareList.map(product => (
                                            <td key={`stock-${product.id}`} className="p-4 text-center">
                                                {product.stock > 0 ? (
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Disponible ({product.stock})
                                                    </div>
                                                ) : (
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        Sin stock
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`e-st-${idx}`} />)}
                                    </tr>
                                    <tr>
                                        <td className="p-4 sticky left-0 z-10 bg-inherit"></td>
                                        {compareList.map(product => (
                                            <td key={`add-${product.id}`} className="p-4 text-center">
                                                <button
                                                    className={`w-full py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${product.stock === 0
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                                                        : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/25 active:scale-95'
                                                        }`}
                                                    disabled={product.stock === 0}
                                                    onClick={() => {
                                                        // TODO interact with cart
                                                        // setCompareModalOpen(false);
                                                        // handleAddProduct(product)
                                                    }}
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    <span className="text-sm">Comprar</span>
                                                </button>
                                            </td>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`e-add-${idx}`} />)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
