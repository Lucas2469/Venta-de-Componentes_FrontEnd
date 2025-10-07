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
const ProductDetailWrapper: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const productId = id ? parseInt(id) : 0;

  return (
    <ProductDetail
      productId={productId}
      currentUser={currentUser}
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
const NotificationsPageWrapper: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const expandId = searchParams.get('expand');

  // Usar ID real del usuario logueado (misma lógica que Header.tsx y ProductDetail.tsx)
  const isAdmin = currentUser?.role === "admin";
  const userId = currentUser?.id ? parseInt(currentUser.id.toString()) : (isAdmin ? 1 : 2);

  return (
    <NotificationsPage
      userId={userId}
      expandNotificationId={expandId ? parseInt(expandId) : undefined}
    />
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Función para obtener datos reales del usuario desde la base de datos
  const fetchUserDataFromDB = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (response.ok) {
        const responseData = await response.json();
        const userData = responseData.data || responseData;

        // Mapear datos de la BD al formato del frontend
        return {
          id: userData.id.toString(),
          username: userData.email.split('@')[0], // Usar parte del email como username
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          telefono: userData.telefono,
          role: (userData.tipo_usuario === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
          registrationDate: userData.fecha_registro ? userData.fecha_registro.split('T')[0] : '',
          rating: userData.calificacion_promedio || 0,
          totalTransactions: userData.total_intercambios_vendedor || 0,
          total_intercambios_comprador: userData.total_intercambios_comprador || 0,
          credits: userData.creditos_disponibles || 0,
          creditos_disponibles: userData.creditos_disponibles || 0,
          isSeller: userData.creditos_disponibles > 0,
          isBuyer: userData.tipo_usuario !== 'admin'
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const handleLogin = async (credentials?: { username: string; password: string }) => {
    if (credentials) {
      // Check for admin credentials
      if (credentials.username === "Admin" && credentials.password === "123456") {
        const realUserData = await fetchUserDataFromDB("1");
        if (realUserData) {
          setCurrentUser(realUserData);
          navigate('/admin-dashboard');
          return;
        }
      }

      // Check for mock user credentials (hardcoded for testing)
      const mockCredentials = [
        { username: "juan_tech", password: "123", userId: "2" },
        { username: "maria_buyer", password: "123", userId: "3" },
        { username: "carlos_seller", password: "123", userId: "4" }
      ];

      const validCredential = mockCredentials.find(
        c => c.username === credentials.username && c.password === credentials.password
      );

      if (validCredential) {
        // Obtener datos reales de la base de datos
        const realUserData = await fetchUserDataFromDB(validCredential.userId);
        if (realUserData) {
          setCurrentUser(realUserData);
          navigate('/catalog');
          return;
        }
      }

      // If credentials don't match, show error (don't auto-login)
      alert("Credenciales incorrectas. Usa:\n- Admin / 123456 (admin)\n- juan_tech / 123 (vendedor)\n- maria_buyer / 123 (comprador)");
      return;
    }
    // Default behavior for demo (only if no credentials provided)
    const user = mockUsers[0];
    setCurrentUser(user);
    navigate('/catalog');
  };

  const logout = () => {
    setCurrentUser(null);
    navigate('/catalog');
  };

  // Función para actualizar créditos del usuario actual
  const updateUserCredits = (newCredits: number) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        credits: newCredits,
        creditos_disponibles: newCredits
      });
    }
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
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

          {/* Admin Dashboard - Ruta de prueba de AnettG */}
          <Route path="/admin-prueba" element={<NewAdminDashboard />} />

          {/* Rutas de productos */}
          <Route path="/product/:id" element={<ProductDetailWrapper currentUser={currentUser} />} />
          <Route path="/products-catalog" element={
            <div className="container mx-auto px-4 py-8">
              <ProductCatalog searchQuery={searchQuery} onProductClick={(id) => navigate(`/product/${id}`)} />
            </div>
          } />

          {/* UsersList ahora está integrado en el panel administrativo */}

          {/* Rutas protegidas - Usando CreateAdPage funcional de Anett */}
          <Route path="/create-ad" element={
            <ProtectedRoute currentUser={currentUser}>
              <CreateAdPage onBack={() => navigate('/catalog')} currentUser={currentUser} />
            </ProtectedRoute>
          } />

          {/* Buy Credits Page - Para usuarios normales */}
          <Route path="/buy-credits" element={
            <ProtectedRoute currentUser={currentUser}>
              <BuyCreditsPage
                onBack={() => navigate('/catalog')}
                currentUser={currentUser!}
                onCreditsUpdated={updateUserCredits}
              />
            </ProtectedRoute>
          } />

          {/* Notifications Page - Para usuarios logueados */}
          <Route path="/notifications" element={
            <ProtectedRoute currentUser={currentUser}>
              <NotificationsPageWrapper currentUser={currentUser!} />
            </ProtectedRoute>
          } />

          {/* Vendor Appointments Page - Para vendedores */}
          <Route path="/vendor-appointments" element={
            <ProtectedRoute currentUser={currentUser}>
              <VendorAppointmentsPage currentUser={currentUser!} />
            </ProtectedRoute>
          } />

          {/* My Appointments Page - Para compradores */}
          <Route path="/my-appointments" element={
            <ProtectedRoute currentUser={currentUser}>
              <MyAppointmentsPage currentUser={currentUser!} />
            </ProtectedRoute>
          } />

          {/* Mis Horarios Page - Para vendedores */}
          <Route path="/mis-horarios" element={
            <ProtectedRoute currentUser={currentUser}>
              <MisHorariosPage
                currentUser={currentUser!}
                onNavigate={handleNavigate}
              />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard - Temporarily accessible to all users */}
          <Route path="/admin-dashboard" element={<NewAdminDashboard />} />

          {/* Mi Perfil (privado) */}
          <Route path="/profile" element={
            <ProtectedRoute currentUser={currentUser}>
              <MyProfilePage
                currentUser={currentUser!}
                onNavigate={handleNavigate}
                onUserUpdate={(updatedUser) => setCurrentUser(updatedUser)}
              />
            </ProtectedRoute>
          } />

          {/* Perfil Público */}
          <Route path="/user/:id" element={<PublicProfileWrapper onNavigate={handleNavigate} />} />

          {/* Mis Productos */}
          <Route path="/my-products" element={
            <ProtectedRoute currentUser={currentUser}>
              <MyProductsPage
                currentUser={currentUser!}
                onNavigate={handleNavigate}
                onProductClick={(id) => navigate(`/product/${id}`)}
              />
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

          {/* Páginas informativas del Footer */}
          <Route path="/security" element={<SecurityPage onNavigate={handleNavigate} />} />
          <Route path="/help" element={<HelpPage onNavigate={handleNavigate} />} />
          <Route path="/seller-guide" element={<SellerGuidePage onNavigate={handleNavigate} />} />
        </Routes>
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Sistema de calificaciones automático */}
      {currentUser && (
        <RatingSystemManager
          currentUserId={currentUser?.id ? parseInt(currentUser.id.toString()) : (currentUser.role === "admin" ? 1 : 2)}
          isActive={true}
        />
      )}
    </div>
  );
}
