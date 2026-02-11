import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, ShoppingBag, Trash2, ArrowRight, CheckCircle2, MessageCircle, 
  LayoutDashboard, Lock, LogOut, ChevronDown, Search, AlertTriangle, CloudOff, 
  Plus, Minus, Eye, X, Filter, DollarSign, Package, Clock, TrendingUp, 
  Calendar, MapPin, Phone, FileText, ChevronRight, Boxes, Store, Star
} from 'lucide-react';
import { MOCK_PRODUCTS, STORE_CONFIG, CATEGORIES } from './constants';
import { Product, CartItem, CustomerInfo, Order, OrderStatus } from './types';
import { ProductCard } from './components/ProductCard';
import { Button } from './components/Button';
import { formatCurrency, calculateTotal, getPrice, generateOrderId, generateWhatsAppLink } from './utils';

// Firebase Imports
import { db, isConfigured } from './firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';

type View = 'CATALOG' | 'CART' | 'CHECKOUT' | 'SUCCESS' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';
type DashboardTab = 'ORDERS' | 'INVENTORY';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('CATALOG');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbError, setDbError] = useState<string | null>(null);

  // Admin Dashboard State
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('ORDERS');
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- Persistence Logic ---
  
  // 1. Load Cart from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('quickorder_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // 2. Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('quickorder_cart', JSON.stringify(cart));
  }, [cart]);

  // 3. Load Orders from Firebase
  useEffect(() => {
    if (!isConfigured || !db) {
        const savedOrders = localStorage.getItem('quickorder_orders_backup');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        return;
    }

    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(ordersData);
            setDbError(null);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setDbError("No se pudo conectar a la base de datos.");
        });
        return () => unsubscribe();
    } catch (err) {
        console.error("Firebase Query Error", err);
        setDbError("Error de configuración de Firebase.");
    }
  }, []);

  // --- Cart Logic ---
  const handleAddProduct = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = useMemo(() => calculateTotal(cart), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    let result = MOCK_PRODUCTS;
    if (selectedCategory !== 'Todos') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return result;
  }, [selectedCategory, searchQuery]);

  // --- Dashboard Logic ---
  const dashboardStats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    const pendingOrders = orders.filter(o => ['pending_payment', 'received', 'preparing'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    return { totalRevenue, pendingOrders, completedOrders, avgTicket };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
        const matchesSearch = 
            order.shortId.toLowerCase().includes(adminSearch.toLowerCase()) || 
            order.customer.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
            order.customer.phone.includes(adminSearch);
        
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
  }, [orders, adminSearch, statusFilter]);

  // --- Actions ---
  const handlePlaceOrder = async (customer: CustomerInfo) => {
    const newOrderData = {
      shortId: generateOrderId(),
      items: cart,
      customer,
      total: cartTotal,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };
    
    // Save to Cloud if available
    if (isConfigured && db) {
        try {
            const docRef = await addDoc(collection(db, "orders"), newOrderData);
            setLastOrder({ id: docRef.id, ...newOrderData } as Order);
        } catch (e) {
            console.error("Error saving to cloud", e);
            saveLocalOrder(newOrderData);
        }
    } else {
        saveLocalOrder(newOrderData);
    }

    setCart([]);
    setCurrentView('SUCCESS');
  };

  const saveLocalOrder = (orderData: any) => {
    const fallbackOrder = { id: crypto.randomUUID(), ...orderData } as Order;
    const currentLocal = JSON.parse(localStorage.getItem('quickorder_orders_backup') || '[]');
    localStorage.setItem('quickorder_orders_backup', JSON.stringify([fallbackOrder, ...currentLocal]));
    setLastOrder(fallbackOrder);
    setOrders(prev => [fallbackOrder, ...prev]);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (isConfigured && db) {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        } catch (e) {
            alert("Error actualizando estado online.");
        }
    } else {
        // Local mode update
        const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updated);
        localStorage.setItem('quickorder_orders_backup', JSON.stringify(updated));
    }
  };

  const deleteOrder = async (orderId: string) => {
    if(confirm('¿Estás seguro de eliminar este pedido del historial?')) {
        if (isConfigured && db) {
            try {
                await deleteDoc(doc(db, "orders", orderId));
            } catch (e) {
                alert("Error eliminando online.");
            }
        } else {
             const updated = orders.filter(o => o.id !== orderId);
             setOrders(updated);
             localStorage.setItem('quickorder_orders_backup', JSON.stringify(updated));
        }
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
    }
  }

  // --- Helper Components ---
  
  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const styles = {
        pending_payment: "bg-amber-100 text-amber-800 border-amber-200 ring-amber-500/30",
        received: "bg-blue-100 text-blue-800 border-blue-200 ring-blue-500/30",
        preparing: "bg-purple-100 text-purple-800 border-purple-200 ring-purple-500/30",
        ready: "bg-indigo-100 text-indigo-800 border-indigo-200 ring-indigo-500/30",
        delivered: "bg-emerald-100 text-emerald-800 border-emerald-200 ring-emerald-500/30",
        cancelled: "bg-rose-100 text-rose-800 border-rose-200 ring-rose-500/30",
    };

    const labels = {
        pending_payment: "Pendiente Pago",
        received: "Recibido",
        preparing: "Preparando",
        ready: "Listo p/ Retirar",
        delivered: "Entregado",
        cancelled: "Cancelado"
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ring-1 ring-inset ${styles[status]} shadow-sm`}>
            {labels[status]}
        </span>
    );
  };

  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col animate-slide-up border border-white/20">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white/90 backdrop-blur-md z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-bold text-gray-900">Pedido #{selectedOrder.shortId}</h3>
                            <StatusBadge status={selectedOrder.status} />
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-1 font-medium">
                            <Calendar size={14} />
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Customer Info */}
                    <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                <UsersIcon className="w-3 h-3" /> Cliente
                            </h4>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
                                    {selectedOrder.customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 block">{selectedOrder.customer.name}</span>
                                    <a href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                                        <Phone size={12} /> {selectedOrder.customer.phone}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Notas
                            </h4>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 h-full">
                                <p className="text-sm text-gray-600 italic leading-relaxed">
                                    {selectedOrder.customer.notes || "Sin observaciones adicionales."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
                                <ShoppingBag size={18} />
                            </div>
                            Productos ({selectedOrder.items.reduce((acc, i) => acc + i.quantity, 0)})
                        </h4>
                        <div className="space-y-3">
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-2xl hover:border-brand-200 hover:bg-brand-50/30 transition-all bg-white shadow-sm">
                                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200" />
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                                <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">{item.category}</p>
                                            </div>
                                            <p className="font-bold text-gray-900 text-lg">{formatCurrency(getPrice(item) * item.quantity)}</p>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-bold text-gray-700">{item.quantity} un.</span>
                                            <span className="text-gray-300">×</span>
                                            <span className="font-medium">{formatCurrency(getPrice(item))}</span>
                                            {item.quantity >= item.wholesaleThreshold && (
                                                <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full ml-auto border border-brand-200">Mayorista</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 mt-auto rounded-b-3xl">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <span className="text-gray-500 font-medium">Total a pagar</span>
                        <span className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <a 
                            href={generateWhatsAppLink(selectedOrder)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-green-200 transition-transform active:scale-95"
                        >
                            <MessageCircle size={22} />
                            Enviar WhatsApp
                        </a>
                         <button 
                            onClick={() => deleteOrder(selectedOrder.id)}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 py-4 px-6 rounded-xl font-bold transition-all shadow-sm"
                        >
                            <Trash2 size={22} />
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const UsersIcon = ({className}:{className?:string}) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );

  // --- Render Views ---

  const renderCatalog = () => (
    <div className="pb-24 animate-fade-in">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 mb-8 shadow-xl shadow-brand-100/50 border border-brand-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                     <span className="bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> Venta Mayorista y Minorista
                     </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                    Todo para tu Bazar <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">al mejor precio.</span>
                </h2>
                <p className="text-gray-500 text-lg max-w-xl mb-6 leading-relaxed">
                    Explora nuestro catálogo exclusivo de termos, vasos y accesorios. Calidad premium y envíos a todo el país. 🇦🇷
                </p>
                <div className="flex gap-3">
                    <Button onClick={() => document.getElementById('catalog-start')?.scrollIntoView({behavior: 'smooth'})} className="rounded-full shadow-lg shadow-brand-200">
                        Ver Catálogo
                    </Button>
                    <a href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`} target="_blank" className="inline-flex items-center justify-center rounded-full font-semibold transition-colors focus:outline-none px-5 py-2.5 text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50">
                        Consultar
                    </a>
                </div>
            </div>
        </div>

      <div id="catalog-start">
        {!isConfigured && (
            <div className="bg-orange-50 border border-orange-200 p-4 mb-6 rounded-2xl shadow-sm flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-orange-800">Modo Demo</h4>
                    <p className="text-sm text-orange-600">La aplicación está funcionando sin conexión a la base de datos.</p>
                </div>
            </div>
        )}

        {/* Search & Filter */}
        <div className="mb-8 space-y-4 sticky top-20 z-20 bg-gray-50/95 backdrop-blur-xl p-4 -mx-4 md:mx-0 md:rounded-2xl md:top-24 border-b md:border border-gray-200/50 shadow-sm transition-all">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="¿Qué estás buscando hoy?" 
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none shadow-sm text-gray-700 transition-all bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
                onClick={() => setSelectedCategory('Todos')}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                selectedCategory === 'Todos' 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
                Todos
            </button>
            {CATEGORIES.map(cat => (
                <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                    selectedCategory === cat
                    ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                >
                {cat}
                </button>
            ))}
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={handleAddProduct}
                onUpdateQuantity={updateQuantity}
                cartQuantity={cart.find(c => c.id === product.id)?.quantity || 0}
            />
            ))}
        </div>
        
        {filteredProducts.length === 0 && (
            <div className="text-center py-32">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Search size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No encontramos productos</h3>
                <p className="text-gray-500">Intenta con otra categoría o término de búsqueda.</p>
            </div>
        )}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="max-w-2xl mx-auto pb-32 pt-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setCurrentView('CATALOG')} className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowRight className="rotate-180 text-gray-500" />
        </button>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tu Pedido</h2>
      </div>
      
      {cart.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 px-6">
          <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <ShoppingBag size={40} className="text-brand-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h3>
          <p className="text-gray-500 text-lg mb-8 max-w-xs mx-auto">Agrega los mejores productos para tu negocio.</p>
          <Button variant="primary" onClick={() => setCurrentView('CATALOG')} className="shadow-xl shadow-brand-200 rounded-full px-8">
            Explorar Catálogo
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {cart.map(item => {
                const price = getPrice(item);
                const isWholesale = item.quantity >= item.wholesaleThreshold;
                return (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center group transition-all hover:shadow-md">
                    <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-gray-100 border border-gray-100" />
                    <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <div className="text-sm text-gray-500 mb-3 font-medium">
                        {formatCurrency(price)} x {item.quantity} 
                        {isWholesale && <span className="text-brand-700 ml-2 text-[10px] uppercase font-bold bg-brand-100 px-2 py-0.5 rounded-full border border-brand-200">Mayorista</span>}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg font-bold text-gray-600 transition-all">-</button>
                            <span className="text-sm font-bold w-10 text-center text-gray-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg font-bold text-gray-600 transition-all">+</button>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">{formatCurrency(price * item.quantity)}</span>
                    </div>
                    </div>
                </div>
                );
            })}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-10 -mt-10 z-0"></div>
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-gray-700">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-gray-900 border-t border-gray-100 pt-4 mt-2">
                <span>Total Estimado</span>
                <span>{formatCurrency(cartTotal)}</span>
                </div>
                
                {cartTotal < STORE_CONFIG.minOrderAmount && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 text-sm rounded-xl flex items-start gap-3">
                        <div className="p-1 bg-amber-100 rounded text-amber-600 shrink-0">
                            <AlertTriangle size={16} />
                        </div>
                        <span>
                        El pedido mínimo es de <strong>{formatCurrency(STORE_CONFIG.minOrderAmount)}</strong>. <br/>
                        Te faltan <strong>{formatCurrency(STORE_CONFIG.minOrderAmount - cartTotal)}</strong> para completar.
                        </span>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CheckoutForm = () => {
    const [formData, setFormData] = useState<CustomerInfo>({ name: '', phone: '', notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isValid = formData.name.length > 2 && formData.phone.length > 6;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(isValid) {
        setIsSubmitting(true);
        await handlePlaceOrder(formData);
        setIsSubmitting(false);
      }
    };

    return (
      <div className="max-w-xl mx-auto pt-8 animate-fade-in">
        <button onClick={() => setCurrentView('CART')} className="text-gray-500 hover:text-brand-600 mb-8 flex items-center gap-2 text-sm font-bold bg-white px-4 py-2 rounded-full shadow-sm w-fit border border-gray-100">
           <ArrowRight className="rotate-180" size={16} /> Volver al carrito
        </button>
        
        <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Finalizar Compra</h2>
            <p className="text-gray-500">Completa tus datos para enviarnos el pedido por WhatsApp.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-teal-400"></div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Completo <span className="text-red-500">*</span></label>
            <input 
              required
              type="text" 
              placeholder="Ej. Juan Pérez"
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all bg-gray-50 focus:bg-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp / Teléfono <span className="text-red-500">*</span></label>
            <input 
              required
              type="tel" 
              placeholder="Ej. 11 1234 5678"
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all bg-gray-50 focus:bg-white"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones (Opcional)</label>
            <textarea 
              rows={3}
              placeholder="Ej. Entregar después de las 14hs, llamar antes..."
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none resize-none transition-all bg-gray-50 focus:bg-white"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <div className="pt-4">
            <Button type="submit" fullWidth size="lg" disabled={!isValid || isSubmitting} className="shadow-xl shadow-brand-200 rounded-xl py-4 text-lg">
              {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
            </Button>
            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Lock size={12} /> Tus datos viajan seguros
            </p>
          </div>
        </form>
      </div>
    );
  };

  const renderSuccess = () => {
    if (!lastOrder) return null;
    const waLink = generateWhatsAppLink(lastOrder);

    return (
      <div className="max-w-lg mx-auto pt-16 text-center pb-20 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-xl shadow-green-100 ring-8 ring-green-50 animate-bounce">
           <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">¡Excelente!</h1>
        <p className="text-gray-600 mb-10 text-lg">Tu orden <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">#{lastOrder.shortId}</span> está lista para enviar.</p>

        <div className="bg-white p-0 rounded-3xl border border-gray-200 shadow-xl shadow-gray-100 text-left mb-8 relative overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resumen del Pedido</h3>
            </div>
            <div className="p-6 space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {lastOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm items-center">
                        <div className="flex gap-3 items-center">
                            <span className="font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{item.quantity}x</span>
                            <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 whitespace-nowrap">{formatCurrency(getPrice(item) * item.quantity)}</span>
                    </div>
                ))}
            </div>
            <div className="p-6 bg-brand-50/50 flex justify-between text-xl font-black border-t border-gray-100 text-brand-900">
                <span>Total</span>
                <span>{formatCurrency(lastOrder.total)}</span>
            </div>
        </div>

        <a 
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-xl shadow-green-200 flex items-center justify-center gap-3 w-full transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle size={28} />
          Enviar por WhatsApp
        </a>
        
        <Button variant="ghost" className="mt-8 text-gray-400 hover:text-gray-600" onClick={() => {
            setLastOrder(null);
            setCurrentView('CATALOG');
        }}>
            Volver al inicio
        </Button>
      </div>
    );
  };

  const AdminLoginForm = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if(pin === STORE_CONFIG.adminPin) {
            setCurrentView('ADMIN_DASHBOARD');
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="max-w-md mx-auto pt-24 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-gray-400">
                <Lock size={32} />
            </div>
            <h2 className="text-3xl font-black mb-2 text-gray-900">Acceso Admin</h2>
            <p className="text-gray-500 mb-8">Ingresa el PIN de seguridad para continuar.</p>
            
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100">
                <input 
                    autoFocus
                    type="password" 
                    maxLength={4}
                    placeholder="••••"
                    className="w-full text-center text-4xl tracking-[1em] p-6 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none mb-6 font-mono transition-all"
                    value={pin}
                    onChange={e => { setPin(e.target.value); setError(false); }}
                />
                {error && <p className="text-red-500 text-sm mb-6 bg-red-50 p-2 rounded-lg font-medium flex items-center justify-center gap-2"><AlertTriangle size={14}/> PIN Incorrecto</p>}
                <div className="flex gap-3">
                    <Button type="button" variant="ghost" fullWidth onClick={() => setCurrentView('CATALOG')}>Cancelar</Button>
                    <Button type="submit" fullWidth disabled={pin.length < 4} className="rounded-xl shadow-lg">Ingresar</Button>
                </div>
            </form>
        </div>
    )
  };

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="bg-brand-100 p-3 rounded-2xl text-brand-600">
                    <LayoutDashboard size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Control</h2>
                    <p className="text-gray-500 font-medium">Vista general del negocio</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-1.5 rounded-xl flex text-sm font-bold">
                    <button 
                        onClick={() => setDashboardTab('ORDERS')}
                        className={`px-6 py-2.5 rounded-lg transition-all ${dashboardTab === 'ORDERS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Pedidos
                    </button>
                    <button 
                        onClick={() => setDashboardTab('INVENTORY')}
                        className={`px-6 py-2.5 rounded-lg transition-all ${dashboardTab === 'INVENTORY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Inventario
                    </button>
                </div>
                <Button variant="outline" onClick={() => setCurrentView('CATALOG')} className="flex items-center gap-2 border-gray-200 rounded-xl h-[46px]">
                    <LogOut size={18} />
                </Button>
            </div>
        </div>

        {/* KPI Cards */}
        {dashboardTab === 'ORDERS' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Ingresos Totales</p>
                        <h3 className="text-3xl font-black text-gray-900">{formatCurrency(dashboardStats.totalRevenue)}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pendientes</p>
                        <h3 className="text-3xl font-black text-gray-900">{dashboardStats.pendingOrders}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Completados</p>
                        <h3 className="text-3xl font-black text-gray-900">{dashboardStats.completedOrders}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Ticket Promedio</p>
                        <h3 className="text-3xl font-black text-gray-900">{formatCurrency(dashboardStats.avgTicket)}</h3>
                    </div>
                </div>
            </div>
        )}

        {/* Database Error Alert */}
        {dbError && (
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 flex items-center gap-3 shadow-sm">
                <AlertTriangle size={24} />
                <span className="font-medium">{dbError}</span>
             </div>
        )}

        {/* Orders Table */}
        {dashboardTab === 'ORDERS' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/30">
                    <div className="relative flex-grow max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar pedido..." 
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none text-sm bg-white transition-all shadow-sm"
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            <select 
                                className="border border-gray-200 rounded-xl py-3 pl-10 pr-8 text-sm focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none bg-white font-medium text-gray-700 cursor-pointer shadow-sm hover:border-gray-300 transition-all appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                                <option value="ALL">Todos los Estados</option>
                                <option value="pending_payment">Pendiente Pago</option>
                                <option value="received">Recibido</option>
                                <option value="preparing">En Preparación</option>
                                <option value="ready">Listo p/ Retirar</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-auto flex-grow custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ID / Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-24">
                                        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 text-gray-300">
                                            <Search size={24} />
                                        </div>
                                        <p className="text-gray-500 font-medium">No se encontraron pedidos.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-brand-50/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded w-fit text-sm">#{order.shortId}</div>
                                            <div className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-teal-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                                                    {order.customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{order.customer.name}</div>
                                                    <div className="text-xs text-gray-500">{order.customer.phone}</div>
                                                </div>
                                            </div>
                                            {order.customer.notes && (
                                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-[10px] font-bold border border-yellow-100">
                                                    <FileText size={10} /> Nota
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative flex items-center gap-2 w-fit group/select">
                                                <StatusBadge status={order.status} />
                                                <ChevronDown size={14} className="text-gray-400 opacity-0 group-hover/select:opacity-100 transition-opacity" />
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                                                    title="Cambiar estado"
                                                >
                                                    <option value="pending_payment">Pendiente Pago</option>
                                                    <option value="received">Recibido</option>
                                                    <option value="preparing">En Preparación</option>
                                                    <option value="ready">Listo p/ Retirar</option>
                                                    <option value="delivered">Entregado</option>
                                                    <option value="cancelled">Cancelado</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-black text-gray-900 text-base">{formatCurrency(order.total)}</span>
                                            <div className="text-xs text-gray-400 font-medium">{order.items.length} items</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 opacity-100">
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                                                    title="Ver Detalles"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteOrder(order.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Inventory View */}
        {dashboardTab === 'INVENTORY' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                            <Boxes size={20} className="text-brand-600" />
                            Catálogo de Productos
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{MOCK_PRODUCTS.length} productos registrados</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-bold tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4 text-right">Precio Unit.</th>
                                <th className="px-6 py-4 text-right">Precio Mayor.</th>
                                <th className="px-6 py-4 text-center">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_PRODUCTS.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={product.imageUrl} className="w-12 h-12 rounded-lg bg-gray-100 object-cover border border-gray-100" alt="" />
                                            <div>
                                                <div className="font-bold text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{product.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-600">
                                        {formatCurrency(product.priceRetail)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-brand-700 block">{formatCurrency(product.priceWholesale)}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Min. {product.wholesaleThreshold} un.</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                            product.stock > 20 ? 'bg-emerald-100 text-emerald-800' : 
                                            product.stock > 0 ? 'bg-amber-100 text-amber-800' : 
                                            'bg-rose-100 text-rose-800'
                                        }`}>
                                            {product.stock} un.
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Modal */}
        {selectedOrder && <OrderDetailModal />}
    </div>
  );

  return (
    <div className="min-h-screen font-sans flex flex-col bg-pattern">
      {/* Header */}
      {(currentView !== 'SUCCESS' && currentView !== 'ADMIN_LOGIN' && currentView !== 'ADMIN_DASHBOARD') && (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            <div 
                className="flex items-center gap-3 cursor-pointer group" 
                onClick={() => setCurrentView('CATALOG')}
            >
              <div className="bg-gradient-to-br from-brand-600 to-teal-600 text-white font-black rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform">
                {STORE_CONFIG.logoText}
              </div>
              <div>
                  <h1 className="font-black text-xl tracking-tight text-gray-900 leading-none">{STORE_CONFIG.name}</h1>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Tienda Oficial</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentView === 'CATALOG' && (
                  <button onClick={() => setCurrentView('ADMIN_LOGIN')} className="text-xs font-bold text-gray-400 hover:text-brand-600 px-3 py-1.5 hidden md:flex items-center gap-1 transition-colors rounded-full hover:bg-gray-50">
                    <Lock size={12} /> Area Negocio
                  </button>
              )}
              <button onClick={() => setCurrentView('CART')} className="relative p-3 text-gray-600 hover:bg-gray-100/80 rounded-full transition-all hover:text-brand-600 group">
                <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white shadow-sm animate-bounce">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-grow w-full px-4 py-8 ${currentView === 'ADMIN_DASHBOARD' ? 'bg-gray-100/50' : 'max-w-6xl mx-auto'}`}>
        {currentView === 'CATALOG' && renderCatalog()}
        {currentView === 'CART' && renderCart()}
        {currentView === 'CHECKOUT' && <CheckoutForm />}
        {currentView === 'SUCCESS' && renderSuccess()}
        {currentView === 'ADMIN_LOGIN' && <AdminLoginForm />}
        {currentView === 'ADMIN_DASHBOARD' && renderDashboard()}
      </main>

      {/* Sticky Bottom Actions */}
      {(currentView === 'CATALOG' || currentView === 'CART') && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 md:hidden animate-slide-up">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total ({cartItemCount})</span>
                    <span className="text-2xl font-black text-gray-900">{formatCurrency(cartTotal)}</span>
                </div>
                <Button 
                    onClick={() => setCurrentView(currentView === 'CATALOG' ? 'CART' : 'CHECKOUT')} 
                    disabled={currentView === 'CART' && cartTotal < STORE_CONFIG.minOrderAmount}
                    className="shadow-xl shadow-brand-200 rounded-xl px-8"
                >
                    {currentView === 'CATALOG' ? 'Ver Carrito' : 'Continuar'}
                </Button>
            </div>
        </div>
      )}
      
      {currentView === 'CART' && cart.length > 0 && (
        <div className="hidden md:block fixed bottom-10 right-10 z-40 animate-fade-in">
           <Button 
                size="lg" 
                onClick={() => setCurrentView('CHECKOUT')} 
                disabled={cartTotal < STORE_CONFIG.minOrderAmount}
                className="shadow-2xl shadow-brand-900/20 transform hover:scale-105 transition-all rounded-2xl py-4 px-8 text-lg flex items-center gap-2"
            >
                Confirmar Compra 
                <span className="bg-brand-700/30 px-2 py-0.5 rounded text-sm">
                    {formatCurrency(cartTotal)}
                </span>
            </Button>
        </div>
      )}

      {/* Footer */}
      {(currentView !== 'SUCCESS' && currentView !== 'ADMIN_LOGIN' && currentView !== 'ADMIN_DASHBOARD') && (
        <footer className="bg-white border-t border-gray-200 mt-auto py-12">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="bg-brand-600 text-white font-bold rounded-lg w-6 h-6 flex items-center justify-center text-xs">
                        {STORE_CONFIG.logoText}
                    </div>
                    <span className="font-bold text-gray-900">{STORE_CONFIG.name}</span>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                     {STORE_CONFIG.openHours}
                </p>
                <div className="flex justify-center gap-4">
                     <button onClick={() => setCurrentView('ADMIN_LOGIN')} className="text-xs font-bold text-gray-300 hover:text-brand-600 transition-colors bg-gray-50 px-3 py-1 rounded-full">
                        Admin Access
                     </button>
                </div>
            </div>
        </footer>
      )}
    </div>
  );
}