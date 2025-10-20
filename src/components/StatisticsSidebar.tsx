import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Star, Users, TrendingUp } from 'lucide-react';
import { usersApi, TopUserData } from '../api/userApi';

interface StatisticsSidebarProps {
    className?: string;
}

export const StatisticsSidebar: React.FC<StatisticsSidebarProps> = ({ className = '' }) => {
    const [topVendedores, setTopVendedores] = useState<TopUserData[]>([]);
    const [topCompradores, setTopCompradores] = useState<TopUserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar estadísticas al montar el componente
    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            setError(null);

            const [vendedoresResponse, compradoresResponse] = await Promise.all([
                usersApi.getTopVendedores(5), // Mostrar top 5
                usersApi.getTopCompradores(5) // Mostrar top 5
            ]);

            if (vendedoresResponse.success) {
                setTopVendedores(vendedoresResponse.data);
            }

            if (compradoresResponse.success) {
                setTopCompradores(compradoresResponse.data);
            }

        } catch (err) {
            console.error('Error loading statistics:', err);
            setError('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    // Formatear calificación
    const formatRating = (rating: string | number): number => {
        const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
        return isNaN(numRating) ? 0 : numRating;
    };

    // Renderizar componente de loading
    if (loading) {
        return (
            <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Renderizar componente de error
    if (error) {
        return (
            <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 ${className}`}>
                <div className="text-center text-red-600">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={loadStatistics}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Top Vendedores */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden">
                {/* Elemento decorativo */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full filter blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center mb-5">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                            <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                Top Vendedores
                            </h3>
                            <p className="text-xs text-gray-600">Mejor calificados</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {topVendedores.length > 0 ? (
                            topVendedores.map((vendedor, index) => (
                                <div
                                    key={vendedor.id}
                                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-200"
                                >
                                    {/* Posición */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                            index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                                            index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                                            'bg-gradient-to-br from-blue-500 to-blue-600'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Info del vendedor */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">
                                            {vendedor.nombre} {vendedor.apellido}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                            <div className="flex items-center">
                                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                                <span className="font-medium">
                                                    {formatRating(vendedor.calificacion_promedio).toFixed(1)}
                                                </span>
                                            </div>
                                            <span>•</span>
                                            <span>
                                                {vendedor.total_intercambios_vendedor || 0} ventas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No hay vendedores registrados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Compradores */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden">
                {/* Elemento decorativo */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full filter blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center mb-5">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Top Compradores
                            </h3>
                            <p className="text-xs text-gray-600">Más activos</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {topCompradores.length > 0 ? (
                            topCompradores.map((comprador, index) => (
                                <div
                                    key={comprador.id}
                                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                                >
                                    {/* Posición */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                            index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                            index === 1 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' :
                                            index === 2 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                                            'bg-gradient-to-br from-gray-500 to-gray-600'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Info del comprador */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">
                                            {comprador.nombre} {comprador.apellido}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                            <div className="flex items-center">
                                                <Users className="h-3 w-3 text-blue-500 mr-1" />
                                                <span className="font-medium">
                                                    {comprador.total_intercambios_comprador || 0} compras
                                                </span>
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center">
                                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                                <span>
                                                    {formatRating(comprador.calificacion_promedio).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No hay compradores registrados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Botón para actualizar */}
            <div className="text-center">
                <button
                    onClick={loadStatistics}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                    disabled={loading}
                >
                    🔄 Actualizar estadísticas
                </button>
            </div>
        </div>
    );
};