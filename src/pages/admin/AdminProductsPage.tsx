import React, { useState, useEffect } from 'react';
import {
    PackageSearch,
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreHorizontal,
    ArrowLeft,
    Filter,
    Package,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/useProductStore';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ProductFormModal } from '../../components/admin/ProductFormModal';

export const AdminProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useUIStore();
    const { products, fetchProducts, deleteProduct, isLoading } = useProductStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${name}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteProduct(id);
                toast.success('Producto eliminado correctamente');
            } catch (error) {
                toast.error('Error al eliminar el producto');
            }
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className={`p-3 rounded-xl border transition-all ${isDarkMode
                                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Gestión de Productos
                            </h1>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Administra tu catálogo, precios y stock en tiempo real
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar Producto
                    </button>
                </div>

                {/* Filters & Search */}
                <div className={`p-4 rounded-2xl border mb-8 flex flex-col md:flex-row gap-4 items-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
                    }`}>
                    <div className="relative flex-1 w-full">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                                : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400'
                                }`}
                        />
                    </div>
                    <button className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-medium transition-all ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </button>
                </div>

                {/* Products Table */}
                <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={`text-xs uppercase font-bold tracking-wider ${isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <tr>
                                    <th className="px-6 py-5">Producto</th>
                                    <th className="px-6 py-5">Categoría</th>
                                    <th className="px-6 py-5">Precio</th>
                                    <th className="px-6 py-5">Stock</th>
                                    <th className="px-6 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <motion.tr
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</div>
                                                        <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>ID: {product.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`font-black ${isDarkMode ? 'text-brand-400' : 'text-brand-600'}`}>
                                                    ${product.priceRetail.toLocaleString()}
                                                </div>
                                                <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    Mayorista: ${product.priceWholesale.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                                    <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{product.stock}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className={`p-2 rounded-lg transition-all text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {!isLoading && filteredProducts.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No se encontraron productos</h3>
                            <p className="text-slate-500 mt-2">Prueba ajustando los términos de búsqueda</p>
                        </div>
                    )}

                    {isLoading && filteredProducts.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500">Cargando productos...</p>
                        </div>
                    )}
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                editingProduct={editingProduct}
            />
        </div>
    );
};
