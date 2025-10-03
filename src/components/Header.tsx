import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Search, User, LogOut, Settings, Package, CreditCard, BarChart3, Menu, Bell } from "lucide-react";
import { User as UserType } from "./types";

interface HeaderProps {
  currentUser: UserType | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ currentUser, onLogin, onLogout, onNavigate, searchQuery, onSearchChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Mock notifications data
  const notifications = [
    { id: 1, message: "Nueva solicitud de créditos pendiente", type: "payment", time: "hace 5 min" },
    { id: 2, message: "Nuevo anuncio requiere aprobación", type: "ad", time: "hace 10 min" },
    { id: 3, message: "Usuario reportado por comportamiento inapropiado", type: "user", time: "hace 1 hora" }
  ];

  return (
    <header className="border-b shadow-sm" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xl md:text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            ELECTROMARKET
          </button>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                {/* Notifications - Solo para admin */}
                {currentUser.role === 'admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/10 relative">
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                          <Badge 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            style={{ backgroundColor: '#00adb5', color: '#ffffff' }}
                          >
                            {notifications.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-3 border-b">
                        <h3 className="font-semibold">Notificaciones</h3>
                      </div>
                      {notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                          <div className="space-y-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <div className="p-3 border-t">
                        <Button variant="outline" className="w-full text-xs">
                          Ver todas las notificaciones
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">{currentUser.username}</span>
                      <span className="md:hidden">Menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  
                  {currentUser.role === 'user' && (
                    <>
                      <DropdownMenuItem onClick={() => onNavigate('create-ad')}>
                        <Package className="h-4 w-4 mr-2" />
                        Crear Anuncio
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('buy-credits')}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Comprar Créditos ({currentUser.credits})
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {currentUser.role === 'admin' && (
                    <DropdownMenuItem onClick={() => onNavigate('admin-dashboard')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Panel Administrativo
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => onNavigate('settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={onLogin}
                  className="text-white hover:bg-white/10"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('register')}
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  <span className="hidden md:inline">Registrarse</span>
                  <span className="md:hidden">Registro</span>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
            />
          </div>
        </div>
      </div>
    </header>
  );
}