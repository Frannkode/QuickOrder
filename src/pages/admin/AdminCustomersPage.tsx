import React, { useEffect, useMemo } from 'react';
import { ArrowLeft, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { useUIStore } from '../../store/useUIStore';

interface CustomerSummary {
    phone: string;
    name: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
}

export const AdminCustomersPage: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useUIStore();
    const { orders, fetchOrders, isLoading } = useOrderStore();

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const customers = useMemo<CustomerSummary[]>(() => {
        const map = new Map<string, CustomerSummary>();
        orders.forEach(order => {
            const key = order.customerPhone || order.customerName;
            const existing = map.get(key);
            if (existing) {
                existing.orderCount++;
                existing.totalSpent += order.total;
                if (order.createdAt > existing.lastOrder) existing.lastOrder = order.createdAt;
            } else {
                map.set(key, {
                    phone: order.customerPhone,
                    name: order.customerName,
                    orderCount: 1,
                    totalSpent: order.total,
                    lastOrder: order.createdAt,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    }, [orders]);

    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate('/admin/dashboard')} className={`p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Clientes</h1>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Clientes únicos agregados desde los pedidos
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[
                        { icon: Users, label: 'Clientes Únicos', value: totalCustomers, color: 'from-blue-400 to-blue-600' },
                        { icon: DollarSign, label: 'Ingresos Totales', value: `$${totalRevenue.toLocaleString()}`, color: 'from-emerald-400 to-emerald-600' },
                        { icon: ShoppingBag, label: 'Ticket Promedio', value: `$${avgOrderValue.toLocaleString()}`, color: 'from-purple-400 to-purple-600' },
                    ].map(stat => (
                        <div key={stat.label} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                                    <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={`text-xs uppercase font-bold tracking-wider ${isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <tr>
                                    <th className="px-6 py-5">Cliente</th>
                                    <th className="px-6 py-5">Teléfono</th>
                                    <th className="px-6 py-5">Pedidos</th>
                                    <th className="px-6 py-5">Total Gastado</th>
                                    <th className="px-6 py-5">Último Pedido</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {customers.map((c, i) => (
                                    <tr key={i} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm bg-gradient-to-br from-brand-400 to-purple-500 text-white`}>
                                                    {c.name ? c.name[0].toUpperCase() : '?'}
                                                </div>
                                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{c.name || 'Desconocido'}</span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{c.phone || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                                {c.orderCount} pedido{c.orderCount !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-black ${isDarkMode ? 'text-brand-400' : 'text-brand-600'}`}>
                                            ${c.totalSpent.toLocaleString()}
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {new Date(c.lastOrder).toLocaleDateString('es-AR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {isLoading && (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500">Cargando clientes...</p>
                        </div>
                    )}
                    {!isLoading && customers.length === 0 && (
                        <div className="py-20 text-center">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No hay clientes aún</h3>
                            <p className="text-slate-400 mt-2">Los clientes aparecerán cuando haya pedidos registrados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
