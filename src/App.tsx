import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { RegistrationPage } from "./components/RegistrationPage";
import { NewAdminDashboard } from "./components/NewAdminDashboard";
import CreateAdPage from "./components/CreateAdPage";
import { ProductCatalog } from "./components/ProductCatalog";
import { UsersList } from "./components/UsersList";
import { ProductDetail } from "./components/ProductDetail";
import { User } from "./components/types";
import { mockUsers } from "./components/mockData";

// Componente para rutas protegidas que recibe currentUser como prop
const ProtectedRoute: React.FC<{ children: React.ReactNode; currentUser: User | null }> = ({ children, currentUser }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  return currentUser ? <>{children}</> : null;
};

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

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactDetails, setContactDetails] = useState<{
    productTitle: string;
    sellerName: string;
    selectedDate: Date;
    meetingPointId: string;
  } | null>(null);

  const handleLogin = (credentials?: { username: string; password: string }) => {
    if (credentials) {
      // Check for admin credentials
      if (credentials.username === "Admin" && credentials.password === "123456") {
        const adminUser = mockUsers.find(u => u.username === "Admin" && u.role === "admin");
        if (adminUser) {
          setCurrentUser(adminUser);
          navigate('/admin-dashboard'); // Navegación directa a admin dashboard (de Anett)
          return;
        }
      }
      // In a real app, validate other user credentials here
      const user = mockUsers.find(u => u.username === credentials.username);
      if (user) {
        setCurrentUser(user);
        navigate('/catalog');
        return;
      }
    }
    // Default behavior for demo
    const user = mockUsers[0];
    setCurrentUser(user);
    navigate('/catalog');
  };

  const logout = () => {
    setCurrentUser(null);
    navigate('/catalog');
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleContactSeller = (productId: string, date: Date, time: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Find product details for the modal
    const product = mockUsers.find(p => p.id === productId);
    if (product) {
      setContactDetails({
        productTitle: "iPhone 15 Pro Max 256GB", // This would come from the product
        sellerName: "juan_tech", // This would come from the product
        selectedDate: date,
        meetingPointId: "1" // Use first available meeting point
      });
      setShowContactModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      <Header
        currentUser={currentUser}
        onLogin={() => navigate('/login')}
        onLogout={logout}
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
              onLoginSuccess={handleLogin}
            />
          } />
          <Route path="/register" element={
            <RegistrationPage
              onNavigateToLogin={() => navigate('/login')}
            />
          } />

          {/* Rutas de productos */}
          <Route path="/product/:id" element={<ProductDetailWrapper />} />
          <Route path="/products-catalog" element={
            <div className="container mx-auto px-4 py-8">
              <ProductCatalog searchQuery={searchQuery} onProductClick={(id) => navigate(`/product/${id}`)} />
            </div>
          } />

          {/* UsersList ahora está integrado en el panel administrativo */}

          {/* Rutas protegidas - Usando CreateAdPage funcional de Anett */}
          <Route path="/create-ad" element={
            <ProtectedRoute currentUser={currentUser}>
              <CreateAdPage onBack={() => navigate('/catalog')} />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard - Temporarily accessible to all users */}
          <Route path="/admin-dashboard" element={<NewAdminDashboard />} />
          <Route path="/profile" element={
            <ProtectedRoute currentUser={currentUser}>
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                  <h1 className="text-3xl font-bold mb-6" style={{ color: '#9d0045' }}>
                    Mi Perfil
                  </h1>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      Función en Desarrollo
                    </h3>
                    <p className="text-green-700">
                      La página de perfil estará disponible próximamente.
                    </p>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute currentUser={currentUser}>
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
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
