import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, ProtectedRoute as AuthProtectedRoute, RoleBased } from './contexts/AuthContext';
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { RegistrationPage } from "./components/RegistrationPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { NewAdminDashboard } from "./components/NewAdminDashboard";
import CreateAdPage from "./components/CreateAdPage";
import { ProductCatalog } from "./components/ProductCatalog";
import { UsersList } from "./components/UsersList";
import { ProductDetail } from "./components/ProductDetail";
import { BuyCreditsPage } from "./components/BuyCreditsPage";
import { NotificationsPage } from "./components/NotificationsPage";
import VendorAppointmentsPage from "./components/VendorAppointmentsPage";
import MyAppointmentsPage from "./components/MyAppointmentsPage";
import MisHorariosPage from "./components/MisHorariosPage";
import RatingSystemManager from "./components/RatingSystemManager";
import { SecurityPage } from "./components/SecurityPage";
import { HelpPage } from "./components/HelpPage";
import { SellerGuidePage } from "./components/SellerGuidePage";
import { MyProfilePage } from "./components/MyProfilePage";
import { PublicProfilePage } from "./components/PublicProfilePage";
import { MyProductsPage } from "./components/MyProductsPage";
import { User } from "./components/types";

// Wrapper para ProductDetail que extrae el ID de la URL
const ProductDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const productId = id ? parseInt(id) : 0;

  return (
    <ProductDetail
      productId={productId}
      onBack={() => navigate('/catalog')}
    />
  );
};

// Wrapper para PublicProfilePage que extrae el ID de la URL
const PublicProfileWrapper: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <PublicProfilePage
      userId={id || '0'}
      onNavigate={onNavigate}
      onProductClick={(productId) => navigate(`/product/${productId}`)}
    />
  );
};

// Wrapper para NotificationsPage que maneja los parámetros de URL
const NotificationsPageWrapper: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const expandId = searchParams.get('expand');

  return (
    <NotificationsPage
      expandNotificationId={expandId ? parseInt(expandId) : undefined}
    />
  );
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      <Header
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<ProductCatalog searchQuery={searchQuery} onProductClick={handleProductClick} />} />
          <Route path="/catalog" element={<ProductCatalog searchQuery={searchQuery} onProductClick={handleProductClick} />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={
            <LoginPage
              onNavigateToRegistration={() => navigate('/register')}
            />
          } />
          <Route path="/register" element={
            <RegistrationPage
              onNavigateToLogin={() => navigate('/login')}
            />
          } />
          <Route path="/forgot-password" element={
            <ForgotPasswordPage onNavigate={handleNavigate} />
          } />
          <Route path="/reset-password" element={
            <ResetPasswordPage onNavigate={handleNavigate} />
          } />

          {/* Admin Dashboard - Solo para admins */}
          <Route path="/admin-dashboard" element={
            <AuthProtectedRoute requiredRoles={['admin']}>
              <NewAdminDashboard />
            </AuthProtectedRoute>
          } />

          {/* Rutas de productos */}
          <Route path="/product/:id" element={<ProductDetailWrapper />} />
          <Route path="/products-catalog" element={
            <div className="container mx-auto px-4 py-8">
              <ProductCatalog searchQuery={searchQuery} onProductClick={(id) => navigate(`/product/${id}`)} />
            </div>
          } />

          {/* Rutas protegidas */}
          <Route path="/create-ad" element={
            <AuthProtectedRoute requiredRoles={['comprador', 'vendedor']}>
              <CreateAdPage onBack={() => navigate('/catalog')} />
            </AuthProtectedRoute>
          } />

          <Route path="/buy-credits" element={
            <AuthProtectedRoute requiredRoles={['comprador', 'vendedor']}>
              <BuyCreditsPage onBack={() => navigate('/catalog')} />
            </AuthProtectedRoute>
          } />

          <Route path="/notifications" element={
            <AuthProtectedRoute>
              <NotificationsPageWrapper />
            </AuthProtectedRoute>
          } />

          <Route path="/vendor-appointments" element={
            <AuthProtectedRoute requiredRoles={['vendedor', 'admin']}>
              <VendorAppointmentsPage />
            </AuthProtectedRoute>
          } />

          <Route path="/my-appointments" element={
            <AuthProtectedRoute requiredRoles={['comprador', 'vendedor']}>
              <MyAppointmentsPage />
            </AuthProtectedRoute>
          } />

          <Route path="/mis-horarios" element={
            <AuthProtectedRoute requiredRoles={['vendedor', 'admin']}>
              <MisHorariosPage onNavigate={handleNavigate} />
            </AuthProtectedRoute>
          } />

          <Route path="/profile" element={
            <AuthProtectedRoute>
              <MyProfilePage onNavigate={handleNavigate} />
            </AuthProtectedRoute>
          } />

          <Route path="/user/:id" element={<PublicProfileWrapper onNavigate={handleNavigate} />} />

          <Route path="/my-products" element={
            <AuthProtectedRoute requiredRoles={['vendedor', 'admin']}>
              <MyProductsPage
                onNavigate={handleNavigate}
                onProductClick={(id) => navigate(`/product/${id}`)}
              />
            </AuthProtectedRoute>
          } />

          <Route path="/settings" element={
            <AuthProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                  <h1 className="text-3xl font-bold mb-6" style={{ color: '#9d0045' }}>
                    Configuración
                  </h1>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Función en Desarrollo
                    </h3>
                    <p className="text-gray-700">
                      La página de configuración estará disponible próximamente.
                    </p>
                  </div>
                </div>
              </div>
            </AuthProtectedRoute>
          } />

          {/* Páginas informativas del Footer */}
          <Route path="/security" element={<SecurityPage onNavigate={handleNavigate} />} />
          <Route path="/help" element={<HelpPage onNavigate={handleNavigate} />} />
          <Route path="/seller-guide" element={<SellerGuidePage onNavigate={handleNavigate} />} />
        </Routes>
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Sistema de calificaciones automático - solo se ejecuta si hay usuario autenticado */}
      <RatingSystemManager isActive={true} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
