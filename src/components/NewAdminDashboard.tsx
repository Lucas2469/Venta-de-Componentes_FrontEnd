import React, { useState } from "react";
import {
  Users,
  MapPin,
  BarChart3,
  Package,
  ShoppingBag,
  Star,
  Settings,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Crown
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { UsersList } from './UsersList';
import { AdsManagement } from './AdsManagement';
import ComprobantesPage from "./ComprobantesPage";
import CreditPackagesPage from "./CreditPackagesPage";
import AdminStatisticsPage from "./AdminStatisticsPage";

export function NewAdminDashboard() {
  const [activeSection, setActiveSection] = useState("statistics");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Estadísticas básicas (datos simulados simples)
  const statistics = {
    totalUsers: 15,
    activeUsers: 12,
    totalSellers: 8,
    totalBuyers: 7,
    activeProducts: 24,
    weeklyAds: 6,
    totalCategories: 5,
    totalMeetingPoints: 8
  };

  const menuItems = [
    { id: "statistics", label: "Estadísticas", icon: BarChart3 },
    { id: "users", label: "Gestión Usuarios", icon: Users },
    { id: "payment-proofs", label: "Comprobantes", icon: Receipt },
    { id: "meeting-points", label: "Puntos de Encuentro", icon: MapPin },
    { id: "credit-packages", label: "Paquetes Créditos", icon: Package },
    { id: "ads-management", label: "Gestión Anuncios", icon: ShoppingBag },
    { id: "categories", label: "Categorías", icon: Settings },
    { id: "ratings", label: "Calificaciones", icon: Star }
  ];

  const renderStatistics = () => {
    // Datos simples para gráficos
    const paymentStatusData = [
      { name: 'Pendientes', value: 3, color: '#fbbf24' },
      { name: 'Aprobadas', value: 7, color: '#10b981' },
      { name: 'Rechazadas', value: 2, color: '#ef4444' }
    ];

    const userRegistrationData = [
      { month: 'Oct', users: 12 },
      { month: 'Nov', users: 18 },
      { month: 'Dic', users: 24 }
    ];

    return (
      <div className="space-y-8">
        {/* Título de la sección */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            📊 Panel de Estadísticas
          </h2>
          <p className="text-gray-600">Resumen completo del sistema ElectroMarket</p>
        </div>

        {/* Cards de estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full filter blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Usuarios Totales</h3>
              <p className="text-xs text-gray-500">Usuarios registrados</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full filter blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{statistics.activeUsers}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Usuarios Activos</h3>
              <p className="text-xs text-gray-500">Usuarios no admin</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full filter blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{statistics.activeProducts}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Productos Activos</h3>
              <p className="text-xs text-gray-500">Anuncios publicados</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full filter blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{statistics.weeklyAds}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Anuncios Semanales</h3>
              <p className="text-xs text-gray-500">Últimos 7 días</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Solicitudes de Pago</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Registros por Mes</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userRegistrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#9d0045" name="Nuevos Usuarios" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Resumen de distribución */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Distribución de Usuarios</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <span className="font-medium text-gray-700">Vendedores</span>
                <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">{statistics.totalSellers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <span className="font-medium text-gray-700">Compradores</span>
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">{statistics.totalBuyers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <span className="font-medium text-gray-700">Administradores</span>
                <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">1</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del Sistema</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="font-medium text-gray-700">Categorías</span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">{statistics.totalCategories}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                <span className="font-medium text-gray-700">Puntos de Encuentro</span>
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">{statistics.totalMeetingPoints}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <span className="font-medium text-gray-700">Paquetes de Créditos</span>
                <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-bold">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "statistics":
        return <AdminStatisticsPage />;
      case "users":
        return <UsersList searchQuery="" onUserClick={(userId) => console.log('Usuario seleccionado:', userId)} />;
      case "payment-proofs":
        return <ComprobantesPage />;
      case "meeting-points":
        return <div className="text-center py-20 text-gray-500">🚧 Sección en desarrollo</div>;
      case "credit-packages":
        return <CreditPackagesPage />;
      case "ads-management":
        return <AdsManagement />;
      case "categories":
        return <div className="text-center py-20 text-gray-500">🚧 Sección en desarrollo</div>;
      case "ratings":
        return <div className="text-center py-20 text-gray-500">🚧 Sección en desarrollo</div>;
      default:
        return <AdminStatisticsPage />;
    }
  };

  const getCurrentIcon = () => {
    const currentItem = menuItems.find(item => item.id === activeSection);
    return currentItem ? currentItem.icon : BarChart3;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white/95 backdrop-blur-sm shadow-2xl border-r border-white/20 transition-all duration-300 ease-in-out`}>

        {/* Header del sidebar */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ELECTROMARKET
                </h1>
                <p className="text-sm text-gray-600 mt-1">Panel Administrativo</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 transform hover:scale-105 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <item.icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer del sidebar */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Admin Sistema</p>
                  <p className="text-xs text-gray-600">Acceso completo</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                v2.0.0 • ElectroMarket
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <CurrentIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === activeSection)?.label || 'Panel Administrativo'}
                </h2>
                <p className="text-gray-600 mt-1">
                  Gestiona y supervisa todas las operaciones del sistema
                </p>
              </div>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}