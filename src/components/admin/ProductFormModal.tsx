import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Package, DollarSign, List, FileText, BarChart, Plus } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useUIStore } from '../../store/useUIStore';
import { CATEGORIES } from '../../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingProduct?: any;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, editingProduct }) => {
    const { isDarkMode } = useUIStore();
    const { addProduct, updateProduct } = useProductStore();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priceRetail: '',
        priceWholesale: '',
        wholesaleThreshold: '6',
        category: CATEGORIES[1], // Skip "Todos"
        stock: '0',
        imageUrl: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                description: editingProduct.description || '',
                priceRetail: editingProduct.priceRetail.toString(),
                priceWholesale: editingProduct.priceWholesale.toString(),
                wholesaleThreshold: (editingProduct.wholesaleThreshold || 6).toString(),
                category: editingProduct.category,
                stock: editingProduct.stock.toString(),
                imageUrl: editingProduct.imageUrl
            });
        } else {
            setFormData({
                name: '',
                description: '',
                priceRetail: '',
                priceWholesale: '',
                wholesaleThreshold: '6',
                category: CATEGORIES[1],
                stock: '0',
                imageUrl: ''
            });
        }
    }, [editingProduct, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const productData = {
            ...formData,
            priceRetail: parseFloat(formData.priceRetail),
            priceWholesale: parseFloat(formData.priceWholesale),
            wholesaleThreshold: parseInt(formData.wholesaleThreshold),
            stock: parseInt(formData.stock),
        };

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
                toast.success('Producto actualizado correctamente');
            } else {
                await addProduct(productData);
                toast.success('Producto agregado correctamente');
            }
            onClose();
        } catch (error) {
            toast.error('Error al guardar el producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
                    }`}
            >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b backdrop-blur-md bg-opacity-80 border-inherit">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-black">
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold mb-2 ml-1 text-brand-500">
                                    <Package className="w-4 h-4" /> Nombre del Producto
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Termo Stanley 1.2L"
                                    className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 placeholder-slate-600' : 'bg-slate-50 border-slate-100 focus:bg-white placeholder-slate-400'}`}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold mb-2 ml-1 text-brand-500">
                                    <List className="w-4 h-4" /> Categoría
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                                >
                                    {CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold mb-2 ml-1 text-brand-500">
                                    <FileText className="w-4 h-4" /> Descripción
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalles sobre materiales, origen, etc."
                                    className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all resize-none ${isDarkMode ? 'bg-slate-800 border-slate-700 placeholder-slate-600' : 'bg-slate-50 border-slate-100 focus:bg-white placeholder-slate-400'}`}
                                />
                            </div>
                        </div>

                        {/* Inventory & Pricing */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold mb-2 ml-1 text-brand-500">
                                        <DollarSign className="w-4 h-4" /> P. Minorista
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.priceRetail}
                                        onChange={(e) => setFormData({ ...formData, priceRetail: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold mb-2 ml-1 text-brand-500">
                                        <DollarSign className="w-4 h-4" /> P. Mayorista
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.priceWholesale}
                                        onChange={(e) => setFormData({ ...formData, priceWholesale: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold mb-2 ml-1 text-brand-500">
                                        <BarChart className="w-4 h-4" /> Min. Mayorista
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.wholesaleThreshold}
                                        onChange={(e) => setFormData({ ...formData, wholesaleThreshold: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold mb-2 ml-1 text-brand-500">
                                        <Package className="w-4 h-4" /> Stock Actual
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold mb-2 ml-1 text-brand-500">
                                    <Upload className="w-4 h-4" /> URL Imagen
                                </label>
                                <input
                                    required
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all mb-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                                />
                                {formData.imageUrl && (
                                    <div className="w-full aspect-video rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                                        <img src={formData.imageUrl} alt="Vista previa" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-12 pt-8 border-t border-inherit">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
