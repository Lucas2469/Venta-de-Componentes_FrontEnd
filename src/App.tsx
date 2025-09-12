import React, { useState } from 'react';
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { RegistrationPage } from "./components/RegistrationPage";
import { LoginPage } from "./components/LoginPage";


import { ContactConfirmationModal } from "./components/ContactConfirmationModal";
import { NewAdminDashboard } from "./components/NewAdminDashboard";
import { CreateAdPage } from "./components/CreateAdPage";
import { BuyCreditsPage } from "./components/BuyCreditsPage";
import { ProductCatalog } from "./components/ProductCatalog";     // ⬅️ NUEVO
import { UsersList } from "./components/UsersList";               // ⬅️ NUEVO
import { ProductDetail } from "./components/ProductDetail";       // ⬅️ NUEVO
import { User } from "./components/types";
import { mockUsers } from "./components/mockData";

// Define AppState type - ACTUALIZAR
type AppState = 
  | "login" 
  | "register" 
  | "catalog" 
  | "product-detail" 
  | "create-ad" 
  | "buy-credits" 
  | "admin-dashboard"
  | "profile"
  | "settings"
  | "products-catalog"    // ⬅️ NUEVO - Tu catálogo de productos
  | "users-list"         // ⬅️ NUEVO - Tu lista de usuarios
  | "product-detail-api"; // ⬅️ NUEVO - Detalle con API

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppState>("catalog");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  // Contact confirmation modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactDetails, setContactDetails] = useState<{
    productTitle: string;
    sellerName: string;
    selectedDate: Date;
    meetingPointId: string;
  } | null>(null);

  // Navigation functions
  const navigateToLogin = () => setCurrentPage("login");
  const navigateToRegistration = () => setCurrentPage("register");
  const navigateToCatalog = () => setCurrentPage("catalog");
  
  // ⬅️ NUEVAS FUNCIONES DE NAVEGACIÓN
  const navigateToProductsCatalog = () => setCurrentPage("products-catalog");
  const navigateToUsersList = () => setCurrentPage("users-list");
  const navigateToProductDetail = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage("product-detail-api");
  };
  
  const logout = () => {
    setCurrentUser(null);
    setCurrentPage("catalog");
  };

  const handleLogin = (credentials?: { username: string; password: string }) => {
    if (credentials) {
      // Check for admin credentials
      if (credentials.username === "Admin" && credentials.password === "123456") {
        const adminUser = mockUsers.find(u => u.username === "Admin" && u.role === "admin");
        if (adminUser) {
          setCurrentUser(adminUser);
          setCurrentPage("catalog");
          return;
        }
      }
      // In a real app, validate other user credentials here
      const user = mockUsers.find(u => u.username === credentials.username);
      if (user) {
        setCurrentUser(user);
        setCurrentPage("catalog");
        return;
      }
    }
    // Default behavior for demo
    const user = mockUsers[0];
    setCurrentUser(user);
    setCurrentPage("catalog");
  };

  // ACTUALIZAR handleNavigate
  const handleNavigate = (page: string) => {
    switch (page) {
      case 'catalog':
        navigateToCatalog();
        break;
      case 'login':
        navigateToLogin();
        break;
      case 'register':
        navigateToRegistration();
        break;
      case 'products-catalog':        // ⬅️ NUEVO
        navigateToProductsCatalog();
        break;
      case 'users-list':              // ⬅️ NUEVO
        navigateToUsersList();
        break;
      case 'profile':
      case 'settings':
      case 'create-ad':
      case 'buy-credits':
      case 'admin-dashboard':
        if (!currentUser) {
          navigateToLogin();
        } else {
          setCurrentPage(page as AppState);
        }
        break;
      default:
        navigateToCatalog();
    }
  };

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage("product-detail");
  };

  const handleContactSeller = (productId: string, date: Date, time: string) => {
    if (!currentUser) {
      navigateToLogin();
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

  // ACTUALIZAR renderCurrentPage
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "register":
        return <RegistrationPage onNavigateToLogin={navigateToLogin} />;
      
      case "login":
        return (
          <LoginPage
            onNavigateToRegistration={navigateToRegistration}
            onLoginSuccess={handleLogin}
          />
        );
      
      case "product-detail":
        return (
          <ProductDetail
            productId={selectedProductId || 0}
            onBack={navigateToCatalog}
          />
        );

      // ⬅️ NUEVAS PÁGINAS CON TU API
      case "products-catalog":
        return (
          <div className="container mx-auto px-4 py-8">
            <ProductCatalog
              searchQuery={searchQuery}
              onProductClick={navigateToProductDetail}
            />
          </div>
        );

      case "users-list":
        return (
          <div className="container mx-auto px-4 py-8">
            <UsersList
              searchQuery={searchQuery}
              onUserClick={(userId) => {
                console.log('Usuario clickeado:', userId);
                // Aquí podrías navegar a un detalle de usuario si lo implementas
              }}
            />
          </div>
        );

      case "product-detail-api":
        return selectedProductId ? (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => setCurrentPage("products-catalog")}
          />
        ) : (
          <div>Error: Producto no encontrado</div>
        );
      
      case "create-ad":
        return <CreateAdPage onBack={navigateToCatalog} />;
      
      case "buy-credits":
        return <BuyCreditsPage onBack={navigateToCatalog} currentUser={currentUser} />;
      
      case "admin-dashboard":
        return <NewAdminDashboard />;
      
      case "profile":
        return (
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
        );
      
      case "settings":
        return (
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
        );
      
      case "catalog":
      default:
        return (
          <ProductCatalog
            searchQuery={searchQuery}
            onProductClick={handleProductClick}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      <Header
        currentUser={currentUser}
        onLogin={navigateToLogin}
        onLogout={logout}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      
      <Footer onNavigate={handleNavigate} />

      {/* Contact Confirmation Modal */}
     {showContactModal && contactDetails && (
        <ContactConfirmationModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          productTitle={contactDetails.productTitle}
          sellerName={contactDetails.sellerName}
          selectedDate={contactDetails.selectedDate}
          meetingPointId={contactDetails.meetingPointId}
        />
      )}
    </div>
  );
}