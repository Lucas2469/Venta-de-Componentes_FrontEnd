import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Search, User, LogOut, Menu, Bell } from "lucide-react";
import UserMenu from "./UserMenu";


interface UserType {
  username: string;
  role: string;
  credits?: number;
}

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

  const isAdmin = currentUser?.role === "admin";
  const userCredits = !isAdmin ? (currentUser?.credits ?? 0) : undefined;

  const notifications = [
    { id: 1, message: "Nueva solicitud de créditos pendiente", type: "payment", time: "hace 5 min" },
    { id: 2, message: "Nuevo anuncio requiere aprobación", type: "ad", time: "hace 10 min" },
    { id: 3, message: "Usuario reportado por comportamiento inapropiado", type: "user", time: "hace 1 hora" },
  ];

  return (
    <header className="border-b shadow-sm" style={{ backgroundColor: "#9d0045", color: "#ffffff" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("catalog")}
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
                {/* Notification Bell for non-admin users */}
             
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/10 relative">
                        <Bell className="h-4 w-4" />
                        {notifications.length > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500">
                            {notifications.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      side="top"
                      sideOffset={6}
                      className="w-64 bg-white text-black shadow-lg z-[2000]"
                    >
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="flex flex-col items-start hover:bg-gray-100"
                          >
                            <span className="text-sm">{notification.message}</span>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem className="hover:bg-gray-100">No hay notificaciones</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                

                {/* User Menu with Name and Credits */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline flex items-center gap-2">
                        {currentUser.username}
                        {!isAdmin && (
                          <span className="rounded px-2 py-0.5 text-xs bg-white/20">{userCredits} cr.</span>
                        )}
                      </span>
                      <span className="md:hidden">Menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    sideOffset={6}
                    className="w-48 bg-white text-black shadow-lg z-[2000]"
                  >
                    <DropdownMenuItem disabled>
                      <User className="h-4 w-4 mr-2" />
                      {currentUser.username}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Options Menu */}
              <UserMenu 
              vendedorId= {3}//{currentUser?.id ?? 0}  // usa el id real del usuario autenticado
              onSignOut={onLogout} 
            />
              </>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" onClick={onLogin} className="text-white hover:bg-white/10">
                  Iniciar Sesión
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate("register")}
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
        {isMenuOpen && (
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
        )}
      </div>
    </header>
  );
}