import React, { useState, useEffect } from 'react';
import { usersApi, UserDetail, UserFilters } from '../api/userApi';

interface UsersListProps {
    searchQuery?: string;
    onUserClick?: (userId: number) => void;
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
        limit: 20,
        estado: 'activo'
    });

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

    // Effect para cargar usuarios
    useEffect(() => {
        loadUsers();
    }, [filters, searchQuery]);

    // Effect para cargar estadísticas
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

    // Componente de loading
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando usuarios...</span>
            </div>
        );
    }

    // Componente de error
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
                <button 
                    onClick={loadUsers}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800">Total Usuarios</h3>
                        <p className="text-2xl font-bold text-blue-900">{stats.total_usuarios}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-green-800">Compradores</h3>
                        <p className="text-2xl font-bold text-green-900">{stats.total_compradores}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-purple-800">Vendedores</h3>
                        <p className="text-2xl font-bold text-purple-900">{stats.total_vendedores}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-yellow-800">Calificación Promedio</h3>
                        <p className="text-2xl font-bold text-yellow-900">
                            ⭐ {typeof stats.calificacion_promedio_general === 'number' ? stats.calificacion_promedio_general.toFixed(1) : '0.0'}
                        </p>
                    </div>
                </div>
            )}

            {/* Header con filtros */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {searchQuery ? `Resultados para "${searchQuery}"` : 'Lista de Usuarios'}
                    </h2>
                    
                    <div className="flex gap-3">
                        {/* Filtro por tipo */}
                        <select 
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Lista de usuarios */}
            {users.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                    <p className="text-gray-600">
                        {searchQuery ? 'Intenta con otros términos de búsqueda' : 'No hay usuarios disponibles'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <UserCard 
                                key={user.id} 
                                user={user} 
                                onClick={onUserClick}
                            />
                        ))}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            
                            <span className="px-4 py-2 text-sm text-gray-700">
                                Página {currentPage} de {totalPages}
                            </span>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Componente UserCard
interface UserCardProps {
    user: UserDetail;
    onClick?: (userId: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
    const handleClick = () => {
        if (onClick) {
            onClick(user.id);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'vendedor':
                return 'bg-purple-100 text-purple-800';
            case 'comprador':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'activo':
                return 'bg-green-100 text-green-800';
            case 'suspendido':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactivo':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            onClick={handleClick}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {user.nombre.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {user.nombre} {user.apellido}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                    </div>

                    {/* Estado */}
                    <span className={`px-2 py-1 text-xs rounded-full ${getEstadoColor(user.estado)}`}>
                        {user.estado}
                    </span>
                </div>

                {/* Información */}
                <div className="space-y-3">
                    {/* Tipo y teléfono */}
                    <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTipoColor(user.tipo_usuario)}`}>
                            {user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1)}
                        </span>
                        {user.telefono && (
                            <span className="text-sm text-gray-600">📞 {user.telefono}</span>
                        )}
                    </div>

                    {/* Créditos (solo si es vendedor) */}
                    {user.tipo_usuario === 'vendedor' && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Créditos:</span>
                            <span className="font-medium text-green-600">
                                {user.creditos_disponibles}
                            </span>
                        </div>
                    )}

                    {/* Calificación y actividad */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Calificación:</span>
                            <div className="flex items-center">
                                <span className="font-medium">⭐ {parseFloat(user.calificacion_promedio).toFixed(1)}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-600">Ventas:</span>
                            <div className="font-medium text-blue-600">{user.total_ventas}</div>
                        </div>
                    </div>

                    {/* Fecha de registro */}
                    <div className="text-xs text-gray-500 border-t pt-3">
                        Registro: {formatDate(user.fecha_registro)}
                        {user.fecha_ultima_actividad && (
                            <span className="ml-3">
                                Última actividad: {formatDate(user.fecha_ultima_actividad)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};