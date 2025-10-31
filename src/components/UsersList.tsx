import React, { useState, useEffect } from 'react';
import { usersApi, UserDetail, UserFilters } from '../api/userApi';
import { useToast } from './Toast';

interface UsersListProps {
    searchQuery?: string;
    onUserClick?: (userId: number) => void;
}

// Interfaz para el modal de confirmación
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: UserDetail | null;
    action: 'activate' | 'deactivate';
}

export const UsersList: React.FC<UsersListProps> = ({
    searchQuery = '',
    onUserClick
}) => {
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState<any>(null);
    const [filters, setFilters] = useState<UserFilters>({
        page: 1,
        limit: 20, // Más usuarios por página en tabla
        estado: undefined // Mostrar todos los estados por defecto en admin
    });

    // Estados para el modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
    const [pendingAction, setPendingAction] = useState<'activate' | 'deactivate' | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Hook para el Toast
    const { showToast, ToastComponent } = useToast();

    // Cargar usuarios
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (searchQuery.trim()) {
                response = await usersApi.searchUsers(searchQuery, filters);
            } else {
                response = await usersApi.getAllUsers(filters);
            }

            if (response.success) {
                setUsers(response.data);
                setCurrentPage(response.pagination.page);
                setTotalPages(response.pagination.totalPages);
            } else {
                setError('Error al cargar usuarios');
            }
        } catch (err) {
            setError('Error de conexión al servidor');
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar estadísticas
    const loadStats = async () => {
        try {
            const statsResponse = await usersApi.getUserStats();
            if (statsResponse.success) {
                setStats(statsResponse.data);
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [filters, searchQuery]);

    useEffect(() => {
        loadStats();
    }, []);

    // Manejar cambio de página
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Manejar filtros
    const handleFilterChange = (newFilters: Partial<UserFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    // Manejar cambio de estado de usuario
    const handleStatusChange = (user: UserDetail) => {
        // No permitir cambiar estado de admins
        if (user.tipo_usuario === 'admin') {
            showToast(
                'warning',
                'Acción no permitida',
                'No se puede modificar el estado de otros administradores por seguridad del sistema'
            );
            return;
        }

        setSelectedUser(user);
        setPendingAction(user.estado === 'activo' ? 'deactivate' : 'activate');
        setShowConfirmModal(true);
    };

    // Confirmar cambio de estado
    const confirmStatusChange = async () => {
        if (!selectedUser || !pendingAction) return;

        setActionLoading(selectedUser.id);
        try {
            const newStatus = pendingAction === 'activate' ? 'activo' : 'inactivo';
            const response = await usersApi.updateUserStatus(selectedUser.id, newStatus);

            if (response.success) {
                // Actualizar el estado local
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === selectedUser.id
                            ? { ...user, estado: newStatus }
                            : user
                    )
                );

                // Recargar estadísticas
                loadStats();

                // Mostrar mensaje de éxito
                showToast(
                    'success',
                    '¡Acción realizada!',
                    `Usuario ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`
                );
            } else {
                throw new Error(response.message || 'Error al actualizar el estado');
            }

        } catch (error) {
            console.error('Error updating user status:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            showToast(
                'error',
                'Error al actualizar estado',
                `No se pudo actualizar el estado del usuario: ${message}`
            );
        } finally {
            setActionLoading(null);
            setShowConfirmModal(false);
            setSelectedUser(null);
            setPendingAction(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-8 mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center min-h-64">
                        <div className="relative">
                            {/* Spinner animado mejorado */}
                            <div className="w-16 h-16 border-4 border-transparent border-t-indigo-600 border-r-purple-600 rounded-full animate-spin"></div>
                            <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-b-pink-500 border-l-blue-500 rounded-full animate-spin animation-delay-150"></div>
                        </div>
                        <div className="ml-6">
                            <div className="text-xl font-semibold text-gray-800 mb-2">Cargando usuarios...</div>                           
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="relative bg-white border border-red-200 rounded-2xl p-8 text-center shadow-xl">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl opacity-50"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-3xl text-white">⚠️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Ups! Algo salió mal</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
                            <button
                                onClick={loadUsers}
                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                            >
                                🔄 Intentar de nuevo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Estadísticas con animaciones mejoradas */}
                {stats && (
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                                    <span className="text-xl sm:text-2xl text-white">👥</span>
                                </div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Usuarios</h3>
                                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total_usuarios}</p>
                            </div>
                        </div>

                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                                    <span className="text-xl sm:text-2xl text-white">🛒</span>
                                </div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Compradores</h3>
                                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.total_compradores}</p>
                            </div>
                        </div>

                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                                    <span className="text-xl sm:text-2xl text-white">🏪</span>
                                </div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Vendedores</h3>
                                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.total_vendedores}</p>
                            </div>
                        </div>

                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                                    <span className="text-xl sm:text-2xl text-white">⭐</span>
                                </div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Calificación Promedio</h3>
                                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                    {typeof stats.calificacion_promedio_general === 'number' ? stats.calificacion_promedio_general.toFixed(1) : '0.0'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header con filtros mejorado */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 overflow-hidden">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 opacity-50"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full filter blur-3xl opacity-20 transform translate-x-16 -translate-y-16"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
                            <div className="flex-1">
                                <div className="flex items-center mb-4 gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                        <span className="text-xl sm:text-2xl text-white">👥</span>
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            {searchQuery ? `Resultados para "${searchQuery}"` : 'Gestión de Usuarios'}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                            Panel administrativo avanzado para gestionar usuarios del sistema
                                        </p>
                                    </div>
                                </div>

                                {/* Breadcrumb mejorado */}
                                <div className="flex items-center text-sm text-gray-500 space-x-2">
                                    <span className="px-2 py-1 bg-white/60 rounded-lg">🏠 Dashboard</span>
                                    <span>→</span>
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-medium">👥 Usuarios</span>
                                </div>
                            </div>

                            <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 w-full lg:w-auto">
                                {/* Filtro por tipo con diseño mejorado */}
                                <div className="relative flex-1 xs:flex-none">
                                    <select
                                        className="appearance-none w-full px-3 xs:px-6 py-2 xs:py-3 pr-8 xs:pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-indigo-300 text-gray-700 font-medium text-sm xs:text-base"
                                        value={filters.tipo_usuario || ''}
                                        onChange={(e) => {
                                            handleFilterChange({ tipo_usuario: e.target.value as any || undefined });
                                        }}
                                    >
                                        <option value="">🏷️ Todos los tipos</option>
                                        <option value="comprador">🛒 Compradores</option>
                                        <option value="vendedor">🏪 Vendedores</option>
                                        <option value="admin">👑 Administradores</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 xs:pr-3 pointer-events-none">
                                        <svg className="w-4 xs:w-5 h-4 xs:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>

                                {/* Filtro por estado con diseño mejorado */}
                                <div className="relative flex-1 xs:flex-none">
                                    <select
                                        className="appearance-none w-full px-3 xs:px-6 py-2 xs:py-3 pr-8 xs:pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-purple-300 text-gray-700 font-medium text-sm xs:text-base"
                                        value={filters.estado || ''}
                                        onChange={(e) => {
                                            handleFilterChange({ estado: e.target.value as any || undefined });
                                        }}
                                    >
                                        <option value="">📊 Todos los estados</option>
                                        <option value="activo">✅ Activos</option>
                                        <option value="inactivo">❌ Inactivos</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 xs:pr-3 pointer-events-none">
                                        <svg className="w-4 xs:w-5 h-4 xs:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>

                                {/* Botón para limpiar filtros */}
                                <button
                                    onClick={() => {
                                        handleFilterChange({
                                            tipo_usuario: undefined,
                                            estado: undefined
                                        });
                                    }}
                                    className="px-3 xs:px-6 py-2 xs:py-3 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl hover:from-gray-700 hover:to-slate-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium text-sm xs:text-base whitespace-nowrap"
                                >
                                    🧹 Limpiar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                {users.length === 0 ? (
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-16 text-center border border-white/20 overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 opacity-50"></div>
                        <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full filter blur-xl opacity-20"></div>
                            <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full filter blur-xl opacity-20"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-4xl text-white">🔍</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No se encontraron usuarios</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                {searchQuery ? 'Intenta con otros términos de búsqueda o ajusta los filtros' : 'No hay usuarios disponibles en el sistema'}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                                >
                                    🔄 Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP: Tabla tradicional (oculta en móvil) */}
                        <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                            {/* Tabla responsiva mejorada */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                👤 Usuario
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                🏷️ Tipo
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                🟢 Estado
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                💳 Créditos
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                ⭐ Calificación
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                📅 Registro
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                ⚙️ Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/50 divide-y divide-gray-100">
                                        {users.map((user, index) => (
                                            <tr key={user.id} className="group hover:bg-white/80 transition-all duration-200 hover:shadow-lg">
                                            {/* Usuario */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                                                        <span className="text-white font-bold text-lg">
                                                            {user.nombre.charAt(0).toUpperCase()}
                                                        </span>
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                                                    </div>
                                                    <div className="ml-5">
                                                        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                            {user.nombre} {user.apellido}
                                                        </div>
                                                        <div className="text-sm text-gray-600 font-medium">
                                                            📧 {user.email}
                                                        </div>
                                                        {user.telefono && (
                                                            <div className="text-xs text-gray-500 flex items-center mt-1">
                                                                <span className="mr-1">📞</span> {user.telefono}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tipo */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className={`px-4 py-2 text-sm font-bold rounded-xl shadow-sm ${
                                                    user.tipo_usuario === 'admin' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                                                    user.tipo_usuario === 'vendedor' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' :
                                                    'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                                }`}>
                                                    {user.tipo_usuario === 'admin' ? '👑 Admin' :
                                                     user.tipo_usuario === 'vendedor' ? '🏦 Vendedor' :
                                                     '🛒 Comprador'}
                                                </span>
                                            </td>

                                            {/* Estado */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                                        user.estado === 'activo' ? 'bg-green-500 animate-pulse' :
                                                        'bg-gray-400'
                                                    }`}></div>
                                                    <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                                                        user.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {user.estado === 'activo' ? '✅ Activo' :
                                                         '❌ Inactivo'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Créditos */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {user.tipo_usuario !== 'admin' ? (
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-2">
                                                            <span className="text-white text-sm font-bold">💳</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-green-600">
                                                            {user.creditos_disponibles || 0}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 font-medium">—</span>
                                                )}
                                            </td>

                                            {/* Calificación */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg px-3 py-1">
                                                        <span className="text-white font-bold">⭐ {parseFloat(user.calificacion_promedio).toFixed(1)}</span>
                                                    </div>
                                                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                        {user.total_ventas} ventas
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Registro */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-700">
                                                    {formatDate(user.fecha_registro)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Miembro desde
                                                </div>
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {user.tipo_usuario !== 'admin' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(user)}
                                                        disabled={actionLoading === user.id}
                                                        className={`relative px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                                                            user.estado === 'activo'
                                                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                                                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                                        } ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {actionLoading === user.id ? (
                                                            <div className="flex items-center">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                Procesando...
                                                            </div>
                                                        ) : (
                                                            user.estado === 'activo' ? '❌ Desactivar' : '✅ Activar'
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm font-bold rounded-xl">
                                                        👑 Admin
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                            {/* Paginación mejorada */}
                            {totalPages > 1 && (
                                <div className="px-6 py-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="text-sm font-medium text-gray-700 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                                            📄 Mostrando {((currentPage - 1) * filters.limit!) + 1} a {Math.min(currentPage * filters.limit!, users.length)} de {users.length} usuarios
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage <= 1}
                                                className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                            >
                                                ← Anterior
                                            </button>

                                            <div className="flex items-center space-x-1">
                                                <span className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                                    {currentPage}
                                                </span>
                                                <span className="text-gray-500 font-medium">de</span>
                                                <span className="px-4 py-2 text-sm font-bold text-gray-700 bg-white rounded-xl shadow-sm border border-gray-200">
                                                    {totalPages}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= totalPages}
                                                className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                            >
                                                Siguiente →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MOBILE: Cards Layout (mostrado solo en móvil) */}
                        <div className="md:hidden space-y-3 px-4">
                            {users.map((user) => (
                                <div key={user.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-4 space-y-3">
                                    {/* Header: Nombre y Tipo */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                                <span className="text-white font-bold text-sm">{user.nombre.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{user.nombre} {user.apellido}</p>
                                                <p className="text-xs text-gray-600">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                                            user.tipo_usuario === 'admin' ? 'bg-red-100 text-red-700' :
                                            user.tipo_usuario === 'vendedor' ? 'bg-purple-100 text-purple-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {user.tipo_usuario === 'admin' ? '👑 Admin' :
                                             user.tipo_usuario === 'vendedor' ? '🏦 Vendedor' :
                                             '🛒 Comprador'}
                                        </span>
                                    </div>

                                    {/* Información */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-gray-600 font-medium">Estado</p>
                                            <p className={`font-semibold ${user.estado === 'activo' ? 'text-green-600' : 'text-gray-600'}`}>
                                                {user.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-medium">Créditos</p>
                                            <p className="font-semibold text-green-600">{user.creditos_disponibles || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-medium">Calificación</p>
                                            <p className="font-semibold text-yellow-600">⭐ {parseFloat(user.calificacion_promedio).toFixed(1)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-medium">Registro</p>
                                            <p className="font-semibold text-gray-700">{formatDate(user.fecha_registro)}</p>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                                        <button
                                            onClick={() => handleSuspendClick(user)}
                                            className="flex-1 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm"
                                        >
                                            🚫 Suspender
                                        </button>
                                        <button
                                            onClick={() => handleViewDetails(user)}
                                            className="flex-1 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm"
                                        >
                                            👁️ Ver
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal de confirmación */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmStatusChange}
                user={selectedUser}
                action={pendingAction!}
            />

            {/* Toast de notificaciones */}
            <ToastComponent />
        </div>
    );
};

// Componente Modal de Confirmación INCREÍBLE
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    user,
    action
}) => {
    if (!isOpen || !user) return null;

    const isActivating = action === 'activate';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">

            <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                {/* Header con icono animado */}
                <div className="text-center mb-8">
                    <div className={`relative inline-flex w-20 h-20 rounded-2xl items-center justify-center mb-4 shadow-2xl ${
                        isActivating
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                            : 'bg-gradient-to-br from-red-400 to-pink-500'
                    }`}>
                        <span className="text-4xl text-white animate-pulse">
                            {isActivating ? '✅' : '⚠️'}
                        </span>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-4 border-gray-100 flex items-center justify-center">
                            <span className="text-xs">{isActivating ? '🔓' : '🔒'}</span>
                        </div>
                    </div>

                    <h3 className={`text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                        isActivating
                            ? 'from-green-600 to-emerald-600'
                            : 'from-red-600 to-pink-600'
                    }`}>
                        {isActivating ? '🔓 Activar Usuario' : '🔒 Desactivar Usuario'}
                    </h3>
                    <p className="text-gray-600 font-medium">
                        Esta acción modificará los permisos de acceso del usuario
                    </p>
                </div>

                {/* Tarjeta de usuario mejorada */}
                <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-gray-100 shadow-inner">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">
                                    {user.nombre.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center text-xs ${
                                user.estado === 'activo' ? 'bg-green-500' : 'bg-gray-400'
                            }`}>
                                {user.estado === 'activo' ? '✓' : '×'}
                            </div>
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">
                                {user.nombre} {user.apellido}
                            </h4>
                            <p className="text-gray-600 font-medium mb-1">📧 {user.email}</p>
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                                    user.tipo_usuario === 'admin' ? 'bg-red-100 text-red-700' :
                                    user.tipo_usuario === 'vendedor' ? 'bg-purple-100 text-purple-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {user.tipo_usuario === 'admin' ? '👑 Admin' :
                                     user.tipo_usuario === 'vendedor' ? '🏪 Vendedor' :
                                     '🛒 Comprador'}
                                </span>
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                                    user.estado === 'activo' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {user.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensaje de confirmación con estilo */}
                <div className={`p-4 rounded-xl mb-6 border-l-4 ${
                    isActivating
                        ? 'bg-green-50 border-green-400'
                        : 'bg-red-50 border-red-400'
                }`}>
                    <p className="text-gray-800 font-medium">
                        {isActivating ? (
                            <>
                                ¿Estás seguro que deseas <strong className="text-green-600">✅ ACTIVAR</strong> a este usuario?
                                <br />
                                <span className="text-sm text-green-700 mt-1 block">
                                    → Podrá acceder normalmente al sistema y realizar todas las acciones permitidas.
                                </span>
                            </>
                        ) : (
                            <>
                                ¿Estás seguro que deseas <strong className="text-red-600">❌ DESACTIVAR</strong> a este usuario?
                                <br />
                                <span className="text-sm text-red-700 mt-1 block">
                                    → No podrá acceder al sistema hasta que sea reactivado por un administrador.
                                </span>
                            </>
                        )}
                    </p>
                </div>

                {/* Botones de acción espectaculares */}
                <div className="flex space-x-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 text-gray-700 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-200 transform hover:scale-105 shadow-lg font-bold"
                    >
                        🚫 Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-6 py-3 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-bold ${
                            isActivating
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                        }`}
                    >
                        {isActivating ? '✅ Activar Usuario' : '❌ Desactivar Usuario'}
                    </button>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-xs text-gray-500 mt-4 font-medium">
                    🔐 Esta acción requiere permisos de administrador y será registrada en el sistema
                </p>
            </div>
        </div>
    );
};