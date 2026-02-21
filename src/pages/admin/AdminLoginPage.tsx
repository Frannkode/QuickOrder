import React, { useState } from 'react';
import { Lock, ArrowLeft, LogIn } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

export const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useUIStore();
    const { loginWithGoogle, user, isAdmin, isLoading } = useAuthStore();

    // If already logged in and admin, redirect
    if (user && isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            toast.success('Sesión iniciada correctamente');
            navigate('/admin/dashboard', { replace: true });
        } catch (error: any) {
            toast.error(error.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-20 animate-scale-in">
            <div className={`p-8 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                }`}>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-200/50">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Acceso Administrativo
                    </h2>
                    <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Inicia sesión con tu cuenta de Google autorizada
                    </p>
                </div>

                <div className="space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-4 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-bold shadow-md border border-slate-200 dark:border-slate-600 transition-all hover:-translate-y-1 active:scale-95 text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                                Ingresar con Google
                            </>
                        )}
                    </button>

                    {user && !isAdmin && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-center">
                            Tu cuenta no tiene permisos de administrador. Contacta al soporte para acceso.
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate('/')}
                    className={`w-full mt-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${isDarkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a la tienda
                </button>
            </div>
        </div>
    );
};
