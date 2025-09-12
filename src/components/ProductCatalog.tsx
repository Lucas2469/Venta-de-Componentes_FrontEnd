import React, { useState, useEffect } from 'react';
import { productsApi, ProductSummary, ProductFilters } from '../api/productsApi';
import { getImageUrl } from '../api/api';

interface ProductCatalogProps {
    searchQuery?: string;
    onProductClick?: (productId: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
    searchQuery = '',
    onProductClick
}) => {
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<ProductFilters>({
        page: 1,
        limit: 12,
        estado: 'activo'
    });

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

    // Componente de loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center min-h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        <span className="ml-3 text-gray-600">Cargando productos...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Componente de error
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button 
                            onClick={loadProducts}
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
            {/* Contenedor principal con máximo ancho */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header con filtros */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo de Productos'}
                            </h1>
                            <p className="text-gray-600">
                                {products.length > 0 && `${products.length} productos encontrados`}
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Filtro por precio */}
                            <select 
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'low') {
                                        handleFilterChange({ minPrice: undefined, maxPrice: 50 });
                                    } else if (value === 'medium') {
                                        handleFilterChange({ minPrice: 50, maxPrice: 200 });
                                    } else if (value === 'high') {
                                        handleFilterChange({ minPrice: 200, maxPrice: undefined });
                                    } else {
                                        handleFilterChange({ minPrice: undefined, maxPrice: undefined });
                                    }
                                }}
                            >
                                <option value="">Todos los precios</option>
                                <option value="low">Hasta Bs. 50</option>
                                <option value="medium">Bs. 50 - 200</option>
                                <option value="high">Más de Bs. 200</option>
                            </select>

                            {/* Filtro por stock */}
                            <select 
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                                onChange={(e) => {
                                    handleFilterChange({ estado: e.target.value as any || 'activo' });
                                }}
                            >
                                <option value="activo">Con stock</option>
                                <option value="">Todos los estados</option>
                                <option value="agotado">Agotados</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grid de productos */}
                {products.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                        <p className="text-gray-600">
                            {searchQuery ? 'Intenta con otros términos de búsqueda' : 'No hay productos disponibles en este momento'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Grid responsivo mejorado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {products.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onClick={onProductClick}
                                />
                            ))}
                        </div>

                        {/* Paginación mejorada */}
                        {totalPages > 1 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-center items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ← Anterior
                                    </button>
                                    
                                    <span className="px-6 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Componente ProductCard MEJORADO
interface ProductCardProps {
    product: ProductSummary;
    onClick?: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
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
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 overflow-hidden group"
            onClick={handleClick}
        >
            {/* Imagen más pequeña y mejor proporcionada */}
            <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                <img
                    src={getImageUrl(product.imagen_principal)}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                />
            </div>

            {/* Contenido con mejor espaciado */}
            <div className="p-4">
                {/* Título y estado */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                        {product.nombre}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        product.estado === 'activo' ? 'bg-green-100 text-green-700' :
                        product.estado === 'agotado' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {product.estado}
                    </span>
                </div>

                {/* Precio destacado */}
                <p className="text-lg font-bold text-red-600 mb-3">
                    {formatPrice(product.precio)}
                </p>

                {/* Información adicional */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center">
                            📦 Stock: {product.stock}
                        </span>
                        <span className="flex items-center">
                            ⭐ {parseFloat(product.vendedor_calificacion).toFixed(1)}
                        </span>
                    </div>

                    <div className="text-xs text-gray-500 border-t pt-2">
                        <p><strong>Vendedor:</strong> {product.vendedor_nombre} {product.vendedor_apellido}</p>
                        <p><strong>Categoría:</strong> {product.categoria_nombre}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};