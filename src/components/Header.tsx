import { useState, useEffect } from "react";
import { Search, User as UserIcon, LogOut, Settings, Package, CreditCard, BarChart3, Menu, Bell, Grid, Calendar, Clock } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { NotificationPanel } from "./NotificationPanel";
import { fetchUnreadNotificationsCount } from "../api/notifications";

interface HeaderProps {
  onNavigate: (page: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ onNavigate, searchQuery, onSearchChange }: HeaderProps) {
  const { user: currentUser, logout, isAuthenticated } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = currentUser?.tipo_usuario === "admin";
  const userCredits = currentUser?.creditos_disponibles || 0;

  // Usar el ID real del usuario logueado
  const userId = currentUser?.id || 0;

  // Lógica dinámica para determinar capacidades del usuario basada en créditos
  const canSell = !isAdmin && userCredits > 0; // Puede vender si tiene créditos
  const canBuy = !isAdmin; // Cualquier usuario no-admin puede comprar

  // Cargar contador de notificaciones no leídas
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      loadUnreadCount();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, isAuthenticated]);

  async function loadUnreadCount() {
    try {
      const count = await fetchUnreadNotificationsCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }

  function handleNavigateToNotifications(notificationId?: number) {
    const url = notificationId ? `notifications?expand=${notificationId}` : 'notifications';
    onNavigate(url);
  }

  return (
    <header className="bg-gradient-to-r from-pink-700 to-pink-800 border-b border-pink-600 shadow-lg z-50">
      <div className="bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate("catalog")}
              className="flex items-center space-x-2 text-white hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Grid className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold tracking-wide">
                ELECTROMARKET
              </span>
            </button>

            {/* Navigation Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => onNavigate("catalog")}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
              >
                <Grid className="h-4 w-4" />
                <span>Catálogo</span>
              </button>
            </div>


            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {currentUser ? (
                <>
                  {/* Notifications - Para todos los usuarios logueados */}
                  {currentUser && (
                    <div className="relative">
                      <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                      >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Notification Panel */}
                      <NotificationPanel
                        isOpen={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                        userId={userId}
                        onNavigateToNotifications={handleNavigateToNotifications}
                      />
                    </div>
                  )}
                  {/* User Info & Menu */}
                  <div className="flex items-center space-x-3">
                    {/* User Info Display */}
                    <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-lg">
                      <div className="bg-white/20 p-1.5 rounded-full">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-white">
                        <p className="text-sm font-medium">{currentUser.nombre} {currentUser.apellido}</p>
                        {!isAdmin && (
                          <p className="text-xs text-pink-200">{userCredits} créditos</p>
                        )}
                      </div>
                    </div>

                    {/* User Menu Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                      >
                        <Menu className="h-5 w-5" />
                      </button>

                      {/* User Menu Dropdown */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 -z-50">
                          <div className="p-2">
                            {/* Mi Perfil - Para todos los usuarios */}
                            <button
                              onClick={() => {
                                onNavigate("profile");
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                            >
                              <UserIcon className="h-4 w-4 mr-3" />
                              Mi Perfil
                            </button>

                            {/* Mis horarios - Solo para usuarios que pueden vender (tienen créditos) */}
                            {canSell && (
                              <button
                                onClick={() => {
                                  onNavigate("mis-horarios");
                                  setIsMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                              >
                                <Clock className="h-4 w-4 mr-3" />
                                Mis horarios
                              </button>
                            )}

                            {/* Agendamientos del vendedor - Solo para usuarios que pueden vender */}
                            {canSell && (
                              <button
                                onClick={() => {
                                  onNavigate("vendor-appointments");
                                  setIsMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                              >
                                <Calendar className="h-4 w-4 mr-3" />
                                Mis Agendamientos
                              </button>
                            )}

                            {/* Mis citas - Solo para usuarios que pueden comprar */}
                            {canBuy && (
                              <button
                                onClick={() => {
                                  onNavigate("my-appointments");
                                  setIsMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                              >
                                <Calendar className="h-4 w-4 mr-3" />
                                Mis Citas
                              </button>
                            )}

                            {!isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    onNavigate("create-ad");
                                    setIsMenuOpen(false);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                                >
                                  <Package className="h-4 w-4 mr-3" />
                                  Crear Anuncio
                                </button>
                                <button
                                  onClick={() => {
                                    onNavigate("buy-credits");
                                    setIsMenuOpen(false);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                                >
                                  <CreditCard className="h-4 w-4 mr-3" />
                                  Comprar Créditos ({userCredits})
                                </button>
                              </>
                            )}

                            {/* Admin Dashboard - Solo para administradores */}
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  onNavigate("admin-dashboard");
                                  setIsMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                              >
                                <BarChart3 className="h-4 w-4 mr-3" />
                                Panel Administrativo
                              </button>
                            )}

                            <button
                              onClick={() => {
                                onNavigate("settings");
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                            >
                              <Settings className="h-4 w-4 mr-3" />
                              Configuración
                            </button>

                            <div className="border-t border-gray-200 my-2"></div>

                            <button
                              onClick={() => {
                                logout();
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <LogOut className="h-4 w-4 mr-3" />
                              Cerrar Sesión
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => onNavigate("register")}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-white/90 text-pink-700 font-medium transition-all duration-200 hover:scale-105"
                  >
                    <span className="hidden md:inline">Registrarse</span>
                    <span className="md:hidden">Registro</span>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </header>
  );
}