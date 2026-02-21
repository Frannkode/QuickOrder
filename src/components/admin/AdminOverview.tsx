import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PackageSearch, Users, ShoppingCart, ArrowUpRight, Clock } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useProductStore } from '../../store/useProductStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending_payment: { label: 'Pago Pendiente', color: 'text-amber-500' },
    received: { label: 'Recibido', color: 'text-blue-500' },
    preparing: { label: 'Preparando', color: 'text-purple-500' },
    ready: { label: 'Listo', color: 'text-teal-500' },
    delivered: { label: 'Entregado', color: 'text-emerald-500' },
    cancelled: { label: 'Cancelado', color: 'text-rose-500' },
};

export const AdminOverview: React.FC = () => {
    const { isDarkMode } = useUIStore();
    const navigate = useNavigate();
    const { products, fetchProducts } = useProductStore();
    const { orders, fetchOrders, isLoading } = useOrderStore();

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, [fetchProducts, fetchOrders]);

    const stats = useMemo(() => {
        const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
        const activeProducts = products.filter(p => p.stock > 0).length;
        const newOrders = orders.filter(o => o.status === 'received').length;
        const uniqueCustomers = new Set(orders.map(o => o.customerPhone || o.customerName)).size;

        return [
            { title: 'Ingresos Totales', value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, colorBase: 'bg-gradient-to-br from-emerald-400 to-emerald-600', sub: `${orders.filter(o => o.status !== 'cancelled').length} pedidos`, link: '/admin/orders' },
            { title: 'Productos Activos', value: activeProducts, icon: PackageSearch, colorBase: 'bg-gradient-to-br from-blue-400 to-blue-600', sub: `${products.length} en total`, link: '/admin/products' },
            { title: 'Pedidos Nuevos', value: newOrders, icon: ShoppingCart, colorBase: 'bg-gradient-to-br from-purple-400 to-purple-600', sub: 'Sin confirmar', link: '/admin/orders' },
            { title: 'Clientes Únicos', value: uniqueCustomers, icon: Users, colorBase: 'bg-gradient-to-br from-amber-400 to-amber-600', sub: 'Desde los pedidos', link: '/admin/customers' },
        ];
    }, [products, orders]);

    const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        onClick={() => navigate(stat.link)}
                        className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.colorBase}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <ArrowUpRight className={`w-4 h-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                        </div>
                        <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.title}</p>
                        <h3 className={`text-3xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{isLoading ? '...' : stat.value}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className={`rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-inherit">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-brand-500" />
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Pedidos Recientes</h3>
                    </div>
                    <button onClick={() => navigate('/admin/orders')} className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                        Ver todos →
                    </button>
                </div>
                {isLoading ? (
                    <div className="py-12 text-center">
                        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="py-12 text-center">
                        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No hay pedidos aún. Los pedidos de WhatsApp se mostrarán aquí.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-inherit">
                        {recentOrders.map(order => {
                            const statusConf = STATUS_LABELS[order.status] || STATUS_LABELS.received;
                            return (
                                <div key={order.id} className={`flex items-center justify-between px-6 py-4 transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm bg-gradient-to-br from-brand-400 to-purple-500 text-white shrink-0`}>
                                            {order.customerName ? order.customerName[0].toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</p>
                                            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                #{order.shortId} · {new Date(order.createdAt).toLocaleDateString('es-AR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-bold ${statusConf.color}`}>{statusConf.label}</span>
                                        <span className={`font-black ${isDarkMode ? 'text-brand-400' : 'text-brand-600'}`}>${order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
