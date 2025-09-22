import React, { useState, useEffect } from 'react';
import { useNavigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { RegistrationPage } from "./components/RegistrationPage";
import { LoginPage } from "./components/LoginPage";
import { CatalogPage } from "./components/CatalogPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { ContactConfirmationModal } from "./components/ContactConfirmationModal";
import { NewAdminDashboard } from "./components/NewAdminDashboard";
import CreateAdPage from "./components/CreateAdPage";
import { BuyCreditsPage } from "./components/BuyCreditsPage";
import { User } from "./components/types";
import { mockUsers } from "./components/mockData";
import ScheduleManager from "./components/ScheduleManager";// ✅

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

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
  | "Mis horarios";

function App() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<AppState>("catalog");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactDetails, setContactDetails] = useState<{
    productTitle: string;
    sellerName: string;
    selectedDate: Date;
    meetingPointId: string;
  } | null>(null);

  const navigateToLogin = () => navigate("/login");
  const navigateToRegistration = () => navigate("/register");
  const navigateToCatalog = () => navigate("/");
  const logout = () => {
    setCurrentUser(null);
    navigateToCatalog();
  };

  const handleLogin = (credentials?: { username: string; password: string }) => {
    if (credentials) {
      if (credentials.username === "Admin" && credentials.password === "123456") {
        const adminUser = mockUsers.find(u => u.username === "Admin" && u.role === "admin");
        if (adminUser) {
          setCurrentUser(adminUser);
           navigate("/admin-dashboard"); 
          return;
        }
      }
      const user = mockUsers.find(u => u.username === credentials.username);
      if (user) {
        setCurrentUser(user);
        navigateToCatalog();
        return;
      }
    }
    const user = mockUsers[0];
    setCurrentUser(user);
    navigateToCatalog();
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    navigate("/producto");
  };

  const handleContactSeller = (productId: string, date: Date, time: string) => {
    if (!currentUser) {
      navigateToLogin();
      return;
    }
    const product = mockUsers.find(p => p.id === productId);
    if (product) {
      setContactDetails({
        productTitle: "iPhone 15 Pro Max 256GB",
        sellerName: "juan_tech",
        selectedDate: date,
        meetingPointId: "1"
      });
      setShowContactModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      <Header
        currentUser={currentUser}
        onLogin={navigateToLogin}
        onLogout={logout}
        onNavigate={(page) => navigate(`/${page}`)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CatalogPage searchQuery={searchQuery} onProductClick={handleProductClick} currentUser={currentUser} onNavigate={(p) => navigate(`/${p}`)} />} />
          <Route path="/register" element={<RegistrationPage onNavigateToLogin={navigateToLogin} />} />
          <Route path="/login" element={<LoginPage onNavigateToRegistration={navigateToRegistration} onLoginSuccess={handleLogin} />} />
          <Route path="/producto" element={<ProductDetailPage productId={selectedProductId} onBack={navigateToCatalog} onContactSeller={handleContactSeller} />} />
          <Route path="/create-ad" element={<CreateAdPage />} />
          <Route path="/buy-credits" element={<BuyCreditsPage onBack={navigateToCatalog} currentUser={currentUser} />} />
          <Route path="/admin-dashboard" element={<NewAdminDashboard />} />
      
        </Routes>
      </main>

      <Footer onNavigate={(page) => navigate(`/${page}`)} />

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
