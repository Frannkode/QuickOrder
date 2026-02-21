import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { STORE_CONFIG } from '../../../constants';
import { toast } from 'sonner';
import { doc, setDoc, getFirestore } from 'firebase/firestore';

export const AdminSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useUIStore();

    const [form, setForm] = useState({
        name: STORE_CONFIG.name,
        logoText: STORE_CONFIG.logoText,
        whatsappNumber: STORE_CONFIG.whatsappNumber,
        currencySymbol: STORE_CONFIG.currencySymbol,
        minOrderAmount: STORE_CONFIG.minOrderAmount.toString(),
        openHours: STORE_CONFIG.openHours,
        adminEmails: [...STORE_CONFIG.adminEmails],
    });
    const [newEmail, setNewEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const addEmail = () => {
        if (newEmail && !form.adminEmails.includes(newEmail)) {
            setForm(f => ({ ...f, adminEmails: [...f.adminEmails, newEmail] }));
            setNewEmail('');
        }
    };
    const removeEmail = (email: string) => {
        setForm(f => ({ ...f, adminEmails: f.adminEmails.filter(e => e !== email) }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const db = getFirestore();
            await setDoc(doc(db, 'config', 'store'), {
                ...form,
                minOrderAmount: Number(form.minOrderAmount),
                updatedAt: new Date().toISOString(),
            });
            toast.success('Configuración guardada en Firestore. Recargá la app para ver los cambios.');
        } catch (error) {
            toast.error('Error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    };

    const InputField = ({ label, value, onChange, type = 'text', hint }: any) => (
        <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{label}</label>
            {hint && <p className={`text-xs mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{hint}</p>}
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-900'}`}
            />
        </div>
    );

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate('/admin/dashboard')} className={`p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Configuración</h1>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Datos de la tienda y acceso de administradores
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Store Info */}
                    <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <h2 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <Settings className="w-5 h-5 text-brand-500" /> Datos del Negocio
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Nombre de la Tienda" value={form.name} onChange={(v: string) => setForm(f => ({ ...f, name: v }))} />
                            <InputField label="Logo (texto)" value={form.logoText} onChange={(v: string) => setForm(f => ({ ...f, logoText: v }))} />
                            <InputField
                                label="Número de WhatsApp"
                                value={form.whatsappNumber}
                                onChange={(v: string) => setForm(f => ({ ...f, whatsappNumber: v }))}
                                hint="Formato internacional sin +. Ej: 5493482232529"
                            />
                            <InputField label="Símbolo de Moneda" value={form.currencySymbol} onChange={(v: string) => setForm(f => ({ ...f, currencySymbol: v }))} />
                            <InputField
                                label="Monto mínimo de pedido ($)"
                                value={form.minOrderAmount}
                                type="number"
                                onChange={(v: string) => setForm(f => ({ ...f, minOrderAmount: v }))}
                            />
                            <InputField label="Horario de Atención" value={form.openHours} onChange={(v: string) => setForm(f => ({ ...f, openHours: v }))} />
                        </div>
                    </div>

                    {/* Admin Emails */}
                    <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <h2 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Emails de Administrador</h2>
                        <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Solo estas cuentas de Google podrán acceder al panel de administración.
                        </p>

                        <div className="space-y-3 mb-6">
                            {form.adminEmails.map(email => (
                                <div key={email} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{email}</span>
                                    <button onClick={() => removeEmail(email)} className="p-1 text-rose-400 hover:text-rose-600 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addEmail()}
                                placeholder="nuevo@gmail.com"
                                className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400'}`}
                            />
                            <button onClick={addEmail} className="px-5 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Agregar
                            </button>
                        </div>
                    </div>

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Save className="w-5 h-5" /> Guardar Configuración</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
