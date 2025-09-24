import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { productsApi, ProductSummary, ProductFilters } from '../api/productsApi';
import { getImageUrl } from '../api/api';

interface ProductCatalogProps {
    onProductClick?: (productId: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
    onProductClick
}) => {
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<ProductFilters>({
        page: 1,
        limit: 12,
        estado: 'activo'
    });

    // Estados para los filtros visuales
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [selectedStockFilter, setSelectedStockFilter] = useState('activo');

    // Cargar productos
    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (searchQuery.trim()) {
                response = await productsApi.searchProducts(searchQuery, filters);
            } else {
                response = await productsApi.getAllProducts(filters);
            }

            if (response.success) {
                setProducts(response.data);
                setCurrentPage(response.pagination.page);
                setTotalPages(response.pagination.totalPages);
            } else {
                setError('Error al cargar productos');
            }
        } catch (err) {
            setError('Error de conexión al servidor');
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    // Effect para cargar productos
    useEffect(() => {
        loadProducts();
    }, [filters, searchQuery]);

    // Manejar cambio de página
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Manejar filtros
    const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    // Manejar búsqueda
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    // Limpiar búsqueda
    const clearSearch = () => {
        setSearchQuery('');
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    // Manejar filtro de precio
    const handlePriceFilter = (value: string) => {
        setSelectedPriceRange(value);

        if (value === 'low') {
            handleFilterChange({ minPrice: undefined, maxPrice: 50 });
        } else if (value === 'medium') {
            handleFilterChange({ minPrice: 50, maxPrice: 200 });
        } else if (value === 'high') {
            handleFilterChange({ minPrice: 200, maxPrice: undefined });
        } else {
            handleFilterChange({ minPrice: undefined, maxPrice: undefined });
        }
    };

    // Manejar filtro de stock
    const handleStockFilter = (value: string) => {
        setSelectedStockFilter(value);
        handleFilterChange({ estado: value as any || 'activo' });
    };

    // Limpiar todos los filtros
    const clearAllFilters = () => {
        setSelectedPriceRange('');
        setSelectedStockFilter('activo');
        setSearchQuery('');
        setFilters({
            page: 1,
            limit: 12,
            estado: 'activo'
        });
    };

    // Componente de loading mejorado
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col items-center justify-center min-h-64">
                        <div className="relative mb-8">
                            {/* Loading spinner sofisticado */}
                            <div className="w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-b-purple-500 border-l-pink-500 rounded-full animate-spin animation-delay-150"></div>
                            <div className="absolute top-4 left-4 w-12 h-12 border-4 border-transparent border-t-green-500 border-r-blue-500 rounded-full animate-spin animation-delay-300"></div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                                🛍️ Cargando catálogo de productos
                            </h3>
                            <p className="text-gray-600 mb-6">Preparando los mejores componentes electrónicos para ti</p>

                            {/* Dots animados */}
                            <div className="flex justify-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce animation-delay-100"></div>
                                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Componente de error mejorado
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-12 text-center shadow-xl">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-4xl text-white">⚠️</span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Oops! Algo salió mal</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            {error}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={loadProducts}
                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                            >
                                🔄 Intentar de nuevo
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                            >
                                🏠 Recargar página
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Contenedor principal con máximo ancho */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header con filtros mejorado */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 overflow-hidden">
                    {/* Elementos decorativos sutiles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full filter blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full filter blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                            <div className="flex-1">
                                <div className="flex items-center mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                        <span className="text-2xl text-white">🛍️</span>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo ElectroMarket'}
                                        </h1>
                                        <p className="text-gray-600 font-medium mt-1">
                                            {products.length > 0 ? `${products.length} componentes electrónicos disponibles` : 'Explora nuestra selección de productos'}
                                        </p>
                                    </div>
                                </div>

                                {/* Breadcrumb profesional */}
                                <div className="flex items-center text-sm text-gray-500 space-x-2">
                                    <span className="px-3 py-1 bg-white/60 rounded-lg">🏠 Inicio</span>
                                    <span>→</span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">🛍️ Catálogo</span>
                                    {searchQuery && (
                                        <>
                                            <span>→</span>
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-medium">🔍 Búsqueda</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Filtro por precio mejorado */}
                                <div className="relative">
                                    <select
                                        value={selectedPriceRange}
                                        onChange={(e) => handlePriceFilter(e.target.value)}
                                        className="appearance-none px-6 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-blue-300 text-gray-700 font-medium min-w-[160px]"
                                    >
                                        <option value="">💰 Todos los precios</option>
                                        <option value="low">💵 Hasta Bs. 50</option>
                                        <option value="medium">💶 Bs. 50 - 200</option>
                                        <option value="high">💷 Más de Bs. 200</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>

                                {/* Filtro por stock mejorado */}
                                <div className="relative">
                                    <select
                                        value={selectedStockFilter}
                                        onChange={(e) => handleStockFilter(e.target.value)}
                                        className="appearance-none px-6 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-indigo-300 text-gray-700 font-medium min-w-[160px]"
                                    >
                                        <option value="activo">✅ Con stock</option>
                                        <option value="">📋 Todos los estados</option>
                                        <option value="agotado">❌ Agotados</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>

                                {/* Botón limpiar filtros mejorado */}
                                {(selectedPriceRange || selectedStockFilter !== 'activo' || searchQuery) && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium flex items-center space-x-2"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>🧹 Limpiar</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda espectacular */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 overflow-hidden">
                    {/* Elementos decorativos sutiles */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full filter blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/10 to-pink-400/10 rounded-full filter blur-2xl"></div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        {/* Título de búsqueda */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                🔍 Encuentra tu componente ideal
                            </h2>
                            <p className="text-gray-600">Busca entre miles de componentes electrónicos de calidad</p>
                        </div>

                        {/* Input de búsqueda mejorado */}
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                                <Search className="h-6 w-6 text-blue-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar productos por nombre (ej: Arduino, sensor, resistencia, ESP32...)"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-16 pr-16 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 bg-white/80 backdrop-blur-sm shadow-inner"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-blue-500 transition-colors z-10"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Indicador de búsqueda activa */}
                            {searchQuery && (
                                <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-500/50 ring-offset-2 pointer-events-none"></div>
                            )}
                        </div>

                        {/* Búsquedas sugeridas mejoradas */}
                        {!searchQuery && (
                            <div className="mb-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-700 px-3 py-2 bg-gray-100 rounded-lg">✨ Búsquedas populares:</span>
                                    {[
                                        { term: 'Arduino', icon: '🔌' },
                                        { term: 'Sensor', icon: '📡' },
                                        { term: 'Resistencia', icon: '⚡' },
                                        { term: 'ESP32', icon: '📱' },
                                        { term: 'LED', icon: '💡' }
                                    ].map(({ term, icon }) => (
                                        <button
                                            key={term}
                                            onClick={() => handleSearchChange(term)}
                                            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 transform hover:scale-105 shadow-sm border border-blue-200/50 font-medium"
                                        >
                                            {icon} {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resultados de búsqueda mejorados */}
                        {searchQuery && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">🔍</span>
                                        </div>
                                        <span className="text-gray-700 font-medium">
                                            {products.length > 0
                                                ? `📦 Se encontraron ${products.length} productos para "${searchQuery}"`
                                                : `❌ No se encontraron productos para "${searchQuery}"`
                                            }
                                        </span>
                                    </div>
                                    <button
                                        onClick={clearSearch}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium text-sm"
                                    >
                                        🗑️ Limpiar búsqueda
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid de productos */}
                {products.length === 0 ? (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-16 text-center border border-white/20">
                        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-5xl text-white">🔍</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">No se encontraron productos</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">
                            {searchQuery
                                ? `No pudimos encontrar productos que coincidan con "${searchQuery}". Intenta con otros términos de búsqueda o explora nuestras categorías.`
                                : 'No hay productos disponibles en este momento. ¡Vuelve pronto para ver nuevos componentes!'}
                        </p>

                        {searchQuery ? (
                            <div className="space-y-4">
                                <button
                                    onClick={clearSearch}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                                >
                                    🔍 Explorar todos los productos
                                </button>
                                <div className="text-sm text-gray-500">
                                    <p className="mb-2">Sugerencias de búsqueda:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['Arduino', 'Sensor', 'LED', 'Resistencia'].map(term => (
                                            <button
                                                key={term}
                                                onClick={() => handleSearchChange(term)}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={loadProducts}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                            >
                                🔄 Recargar productos
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Grid responsivo espectacular */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
                            {products.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={onProductClick}
                                    index={index}
                                />
                            ))}
                        </div>

                        {/* Paginación espectacular */}
                        {totalPages > 1 && (
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div className="text-center sm:text-left">
                                        <p className="text-gray-600 font-medium">
                                            📄 Mostrando página <span className="font-bold text-blue-600">{currentPage}</span> de <span className="font-bold text-blue-600">{totalPages}</span>
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Navegando por nuestro catálogo de componentes
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage <= 1}
                                            className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                        >
                                            ← Anterior
                                        </button>

                                        <div className="flex items-center space-x-2">
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
                                            className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                        >
                                            Siguiente →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Componente ProductCard ESPECTACULAR
interface ProductCardProps {
    product: ProductSummary;
    onClick?: (productId: number) => void;
    index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, index = 0 }) => {
    const handleClick = () => {
        if (onClick) {
            onClick(product.id);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2
        }).format(price);
    };

    return (
        <div
            className="group relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-white/20 overflow-hidden transform hover:scale-[1.02] hover:-translate-y-1"
            onClick={handleClick}
        >
            {/* Badge de estado flotante */}
            <div className="absolute top-4 right-4 z-20">
                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm ${
                    product.estado === 'activo' ? 'bg-green-500/90 text-white' :
                    product.estado === 'agotado' ? 'bg-red-500/90 text-white' :
                    'bg-gray-500/90 text-white'
                }`}>
                    {product.estado === 'activo' ? '✅ Disponible' :
                     product.estado === 'agotado' ? '❌ Agotado' :
                     product.estado}
                </span>
            </div>

            {/* Imagen con overlay y efectos */}
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                    src={getImageUrl(product.imagen_principal)}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                />

                {/* Overlay degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Badge de stock flotante */}
                <div className="absolute bottom-4 left-4">
                    <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-700 shadow-lg">
                        📦 {product.stock} unidades
                    </div>
                </div>
            </div>

            {/* Contenido mejorado */}
            <div className="p-6">
                {/* Título destacado */}
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                    {product.nombre}
                </h3>

                {/* Precio prominente */}
                <div className="mb-4">
                    <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        {formatPrice(product.precio)}
                    </p>
                </div>

                {/* Información del vendedor mejorada */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                                {product.vendedor_nombre?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                                {product.vendedor_nombre} {product.vendedor_apellido}
                            </p>
                            <div className="flex items-center space-x-2 text-xs">
                                <span className="flex items-center text-yellow-600 font-medium">
                                    ⭐ {parseFloat(product.vendedor_calificacion).toFixed(1)}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600 font-medium">
                                    {product.categoria_nombre}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de acción👁️*/}
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg group-hover:shadow-xl">
                    <span className="flex items-center justify-center space-x-2">
                        <span> Ver detalles</span>
                    </span>
                </button>
            </div>

            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
        </div>
    );
};