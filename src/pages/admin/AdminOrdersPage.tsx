import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Trash2, Package, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore, OrderStatus, AdminOrder } from '../../store/useOrderStore';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    pending_payment: { label: 'Pago Pendiente', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    received: { label: 'Recibido', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    preparing: { label: 'Preparando', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ready: { label: 'Listo para entrega', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    delivered: { label: 'Entregado', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    cancelled: { label: 'Cancelado', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
};

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const conf = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${conf.color} ${conf.bg}`}>
            {conf.label}
        </span>
    );
};

const OrderRow: React.FC<{ order: AdminOrder; isDarkMode: boolean }> = ({ order, isDarkMode }) => {
    const [expanded, setExpanded] = useState(false);
    const { updateOrderStatus, deleteOrder } = useOrderStore();

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            await updateOrderStatus(order.id, e.target.value as OrderStatus);
            toast.success('Estado actualizado');
        } catch { toast.error('Error al actualizar estado'); }
    };

    const handleDelete = async () => {
        if (window.confirm(`¿Eliminar el pedido #${order.shortId}?`)) {
            try { await deleteOrder(order.id); toast.success('Pedido eliminado'); }
            catch { toast.error('Error al eliminar pedido'); }
        }
    };

    return (
        <>
            <tr
                className={`transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}
                onClick={() => setExpanded(!expanded)}
            >
                <td className="px-6 py-4">
                    <span className={`font-mono font-bold text-sm ${isDarkMode ? 'text-brand-400' : 'text-brand-600'}`}>
                        #{order.shortId}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{order.customerPhone}</div>
                </td>
                <td className="px-6 py-4">
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        ${order.total.toLocaleString()}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-sm" onClick={e => e.stopPropagation()}>
                    <select
                        value={order.status}
                        onChange={handleStatusChange}
                        className={`text-sm border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                    >
                        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setExpanded(!expanded)} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button onClick={handleDelete} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
            <AnimatePresence>
                {expanded && (
                    <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <td colSpan={6} className={`px-8 py-6 ${isDarkMode ? 'bg-slate-800/40' : 'bg-slate-50/80'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Productos</h4>
                                    <div className="space-y-2">
                                        {order.items && order.items.length > 0 ? order.items.map((item, i) => (
                                            <div key={i} className={`flex justify-between text-sm py-2 border-b ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                                                <span>{item.quantity}x {item.name || `Producto ${item.productId?.slice(0, 6)}`}</span>
                                                <span className="font-bold">${(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        )) : (
                                            <p className="text-slate-400 text-sm">Detalle de productos no disponible (pedido por WhatsApp)</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Datos del Pedido</h4>
                                    <div className={`text-sm space-y-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        <p><span className="font-semibold">Dirección:</span> {order.customerAddress || 'No especificada'}</p>
                                        <p><span className="font-semibold">Fecha:</span> {new Date(order.createdAt).toLocaleString('es-AR')}</p>
                                        <p><span className="font-semibold">Total:</span> ${order.total.toLocaleString()}</p>
                                        {order.notes && <p><span className="font-semibold">Notas:</span> {order.notes}</p>}
                                    </div>
                                </div>
                            </div>
                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </>
    );
};

export const AdminOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useUIStore();
    const { orders, fetchOrders, isLoading } = useOrderStore();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = orders.filter(o => {
        const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) ||
            o.shortId.toLowerCase().includes(search.toLowerCase()) ||
            o.customerPhone.includes(search);
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/dashboard')} className={`p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pedidos</h1>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {orders.length} pedido{orders.length !== 1 ? 's' : ''} · Ingresos totales: <span className="font-bold text-brand-500">${totalRevenue.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className={`p-4 rounded-2xl border mb-8 flex flex-col md:flex-row gap-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="relative flex-1">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400'}`}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as any)}
                        className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                    >
                        <option value="all">Todos los estados</option>
                        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={`text-xs uppercase font-bold tracking-wider ${isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <tr>
                                    <th className="px-6 py-5">ID</th>
                                    <th className="px-6 py-5">Cliente</th>
                                    <th className="px-6 py-5">Total</th>
                                    <th className="px-6 py-5">Estado</th>
                                    <th className="px-6 py-5">Cambiar Estado</th>
                                    <th className="px-6 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {filtered.map(order => (
                                    <OrderRow key={order.id} order={order} isDarkMode={isDarkMode} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {isLoading && (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500">Cargando pedidos...</p>
                        </div>
                    )}
                    {!isLoading && filtered.length === 0 && (
                        <div className="py-20 text-center">
                            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No hay pedidos</h3>
                            <p className="text-slate-400 mt-2">Los pedidos hechos por WhatsApp aparecerán aquí cuando los registres</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
