import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Layout & Modals
import { Layout } from './components/layout/Layout';
import { ProductQuickViewModal } from './components/modals/ProductQuickViewModal';

// Pages
import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Data & Utils
import { PRODUCTS, CATEGORIES } from '../constants';
import { Product } from '../types';

// Protected Route Wrapper for Admin
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isAdmin, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};

export default function App() {
    const [selectedCategory, setSelectedCategory] = React.useState<string>('Todos');
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const { initializeAuthListener } = useAuthStore();

    useEffect(() => {
        initializeAuthListener();
    }, [initializeAuthListener]);

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route
                        path="/"
                        element={
                            <CatalogPage
                                products={PRODUCTS}
                                categories={CATEGORIES}
                                activeCategory={selectedCategory}
                                setActiveCategory={setSelectedCategory}
                                onQuickView={setSelectedProduct}
                            />
                        }
                    />
                    <Route path="/cart" element={<CartPage />} />
                    <Route
                        path="/wishlist"
                        element={
                            <WishlistPage
                                products={PRODUCTS}
                                onQuickView={setSelectedProduct}
                            />
                        }
                    />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedAdminRoute>
                                <AdminDashboardPage />
                            </ProtectedAdminRoute>
                        }
                    />
                    <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProductsPage /></ProtectedAdminRoute>} />
                    <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrdersPage /></ProtectedAdminRoute>} />
                    <Route path="/admin/customers" element={<ProtectedAdminRoute><AdminCustomersPage /></ProtectedAdminRoute>} />
                    <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettingsPage /></ProtectedAdminRoute>} />

                </Route>
            </Routes>

            {/* Global Modals */}
            <ProductQuickViewModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </BrowserRouter>
    );
}
