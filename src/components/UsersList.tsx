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
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center min-h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                        <span className="ml-3 text-gray-600">Cargando usuarios...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button 
                            onClick={loadUsers}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Estadísticas */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-blue-800">Total Usuarios</h3>
                            <p className="text-2xl font-bold text-blue-900">{stats.total_usuarios}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-green-800">Compradores</h3>
                            <p className="text-2xl font-bold text-green-900">{stats.total_compradores}</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-purple-800">Vendedores</h3>
                            <p className="text-2xl font-bold text-purple-900">{stats.total_vendedores}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-yellow-800">Calificación Promedio</h3>
                            <p className="text-2xl font-bold text-yellow-900">
                                ⭐ {typeof stats.calificacion_promedio_general === 'number' ? stats.calificacion_promedio_general.toFixed(1) : '0.0'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Header con filtros */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {searchQuery ? `Resultados para "${searchQuery}"` : 'Gestión de Usuarios'}
                            </h1>
                            <p className="text-gray-600">
                                Panel administrativo para gestionar usuarios del sistema
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Filtro por tipo */}
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                                value={filters.tipo_usuario || ''}
                                onChange={(e) => {
                                    handleFilterChange({ tipo_usuario: e.target.value as any || undefined });
                                }}
                            >
                                <option value="">Todos los tipos</option>
                                <option value="comprador">Compradores</option>
                                <option value="vendedor">Vendedores</option>
                                <option value="admin">Administradores</option>
                            </select>

                            {/* Filtro por estado */}
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                                value={filters.estado || ''}
                                onChange={(e) => {
                                    handleFilterChange({ estado: e.target.value as any || undefined });
                                }}
                            >
                                <option value="">Todos los estados</option>
                                <option value="activo">Activos</option>
                                <option value="suspendido">Suspendidos</option>
                                <option value="inactivo">Inactivos</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                {users.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
                        <p className="text-gray-600">
                            {searchQuery ? 'Intenta con otros términos de búsqueda' : 'No hay usuarios disponibles'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* Tabla responsiva */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Créditos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Calificación
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Registro
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Usuario */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">
                                                            {user.nombre.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.nombre} {user.apellido}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                        {user.telefono && (
                                                            <div className="text-xs text-gray-400">
                                                                📞 {user.telefono}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tipo */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    user.tipo_usuario === 'admin' ? 'bg-red-100 text-red-700' :
                                                    user.tipo_usuario === 'vendedor' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1)}
                                                </span>
                                            </td>

                                            {/* Estado */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    user.estado === 'activo' ? 'bg-green-100 text-green-700' :
                                                    user.estado === 'suspendido' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {user.estado}
                                                </span>
                                            </td>

                                            {/* Créditos */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.tipo_usuario === 'vendedor' ? (
                                                    <span className="font-medium text-green-600">
                                                        {user.creditos_disponibles}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>

                                            {/* Calificación */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <span>⭐ {parseFloat(user.calificacion_promedio).toFixed(1)}</span>
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        ({user.total_ventas} ventas)
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Registro */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user.fecha_registro)}
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {user.tipo_usuario !== 'admin' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(user)}
                                                        disabled={actionLoading === user.id}
                                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                            user.estado === 'activo'
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        } ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {actionLoading === user.id ? (
                                                            'Procesando...'
                                                        ) : (
                                                            user.estado === 'activo' ? 'Desactivar' : 'Activar'
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Admin</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Mostrando {((currentPage - 1) * filters.limit!) + 1} a {Math.min(currentPage * filters.limit!, users.length)} usuarios
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage <= 1}
                                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            ← Anterior
                                        </button>
                                        
                                        <span className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
                                            {currentPage} / {totalPages}
                                        </span>
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages}
                                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Siguiente →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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

// Componente Modal de Confirmación
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActivating ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        <span className="text-2xl">
                            {isActivating ? '✅' : '⚠️'}
                        </span>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isActivating ? 'Activar Usuario' : 'Desactivar Usuario'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Esta acción afectará el acceso del usuario
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                                {user.nombre.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                {user.nombre} {user.apellido}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                                {user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1)}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-gray-700 mb-6">
                    {isActivating ? (
                        <>¿Estás seguro que deseas <strong className="text-green-600">activar</strong> a este usuario? 
                        Podrá acceder normalmente al sistema.</>
                    ) : (
                        <>¿Estás seguro que deseas <strong className="text-red-600">desactivar</strong> a este usuario? 
                        No podrá acceder al sistema hasta que sea reactivado.</>
                    )}
                </p>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                            isActivating 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {isActivating ? 'Activar Usuario' : 'Desactivar Usuario'}
                    </button>
                </div>
            </div>
        </div>
    );
};