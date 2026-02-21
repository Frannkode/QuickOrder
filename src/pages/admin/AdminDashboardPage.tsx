import React, { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminOverview } from '../../components/admin/AdminOverview';
import { Menu, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboardPage: React.FC = () => {
    const { isDarkMode } = useUIStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <AdminSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                {/* Topbar */}
                <header className={`h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center flex-1 gap-4">
                        <button
                            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="Buscar en el panel..."
                                className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${isDarkMode
                                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                    : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className={`relative p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-inherit"></span>
                        </button>
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 p-[2px] cursor-pointer hover:scale-105 transition-transform">
                            <div className={`w-full h-full rounded-full border flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-700'}`}>
                                A
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                        <AnimatePresence mode="wait">
                            <AdminOverview />
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};
