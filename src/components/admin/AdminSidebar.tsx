import React from 'react';
import { PackageSearch, Users, ShoppingCart, BarChart3, Settings, LogOut, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';

export const AdminSidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void }> = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuthStore();
    const { isDarkMode } = useUIStore();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login', { replace: true });
    };

    const navItems = [
        { name: 'Vista General', path: '/admin/dashboard', icon: BarChart3 },
        { name: 'Productos', path: '/admin/products', icon: PackageSearch },
        { name: 'Pedidos', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Clientes', path: '/admin/customers', icon: Users },
        { name: 'Configuración', path: '/admin/settings', icon: Settings },
    ];

    return (
        <aside
            className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 border-r flex flex-col
                ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
                ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
            `}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-inherit shrink-0">
                {isOpen && (
                    <span className="font-bold text-xl bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent truncate flex-1">
                        Bazar Admin
                    </span>
                )}
                <button
                    onClick={toggleSidebar}
                    className={`p-2 rounded-lg transition-colors ml-auto ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                    {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            title={!isOpen ? item.name : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                                ${isActive
                                    ? isDarkMode ? 'bg-brand-500/10 text-brand-400' : 'bg-brand-50 text-brand-600'
                                    : isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'
                                }
                                ${!isOpen && 'justify-center'}
                            `}
                        >
                            <Icon className={`shrink-0 ${isOpen ? 'w-5 h-5' : 'w-6 h-6'} ${isActive && 'text-brand-500'}`} />
                            {isOpen && <span className="font-medium whitespace-nowrap overflow-hidden">{item.name}</span>}
                        </button>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-inherit shrink-0">
                <button
                    onClick={handleLogout}
                    title={!isOpen ? 'Cerrar Sesión' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-rose-500
                        ${isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'}
                        ${!isOpen && 'justify-center'}
                    `}
                >
                    <LogOut className={`shrink-0 ${isOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    {isOpen && <span className="font-medium whitespace-nowrap overflow-hidden">Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
};
