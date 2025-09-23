import { useState } from "react";
import { Search, User as UserIcon, LogOut, Settings, Package, CreditCard, BarChart3, Menu, Bell, Grid, Users } from "lucide-react";
import { User } from "./types";

interface HeaderProps {
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export function Header({ currentUser, onLogin, onLogout, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const userCredits = currentUser?.credits ?? 0;

  return (
    <header className="bg-gradient-to-r from-pink-700 to-pink-800 border-b border-pink-600 shadow-lg">
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
              <button
                onClick={() => onNavigate("users-list")}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
              >
                <Users className="h-4 w-4" />
                <span>Usuarios</span>
              </button>
            </div>


            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {currentUser ? (
                <>
                  {/* Notifications - Solo para admin */}
                  {isAdmin && (
                    <div className="relative">
                      <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                      >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          3
                        </span>
                      </button>

                      {/* Notifications Dropdown */}
                      {isNotificationsOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                          <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                              <p className="text-sm text-gray-900">Nueva solicitud de créditos pendiente</p>
                              <p className="text-xs text-gray-500 mt-1">hace 5 min</p>
                            </div>
                            <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                              <p className="text-sm text-gray-900">Nuevo anuncio requiere aprobación</p>
                              <p className="text-xs text-gray-500 mt-1">hace 10 min</p>
                            </div>
                            <div className="p-4 hover:bg-gray-50">
                              <p className="text-sm text-gray-900">Usuario reportado por comportamiento inapropiado</p>
                              <p className="text-xs text-gray-500 mt-1">hace 1 hora</p>
                            </div>
                          </div>
                          <div className="p-3 border-t border-gray-200">
                            <button className="w-full px-3 py-2 text-sm text-pink-700 hover:bg-pink-50 rounded-md transition-colors">
                              Ver todas las notificaciones
                            </button>
                          </div>
                        </div>
                      )}
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
                        <p className="text-sm font-medium">{currentUser.username}</p>
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
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                          <div className="p-2">
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
                                onLogout();
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
                    onClick={onLogin}
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