import React, { useState, useEffect } from 'react';
import { productsApi, ProductDetail as ProductDetailType } from '../api/productsApi';
import { getImageUrl } from '../api/api';

interface ProductDetailProps {
    productId: number;
    onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack }) => {
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await productsApi.getProductById(productId);
                
                if (response.success) {
                    setProduct(response.data);
                } else {
                    setError('Producto no encontrado');
                }
            } catch (err) {
                setError('Error al cargar el producto');
                console.error('Error loading product:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center min-h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        <span className="ml-3 text-gray-600">Cargando producto...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button 
                            onClick={onBack}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Volver al catálogo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2
        }).format(price);
    };

    const images = product.imagenes || [];
    const currentImage = images[currentImageIndex]?.url_imagen || product.imagen_principal;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Botón de regreso */}
                <button
                    onClick={onBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
                >
                    ← Volver al catálogo
                </button>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
                        
                        {/* Galería de imágenes - ÁREA REDUCIDA */}
                        <div className="space-y-4">
                            {/* Imagen principal - Tamaño reducido */}
                            <div className="aspect-[4/3] w-full bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={getImageUrl(currentImage || '')}
                                    alt={product.nombre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>

                            {/* Miniaturas - Más compactas */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                                                index === currentImageIndex ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={getImageUrl(image.url_imagen)}
                                                alt={`${product.nombre} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Información del producto */}
                        <div className="space-y-6">
                            {/* Título y precio */}
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                    {product.nombre}
                                </h1>
                                <p className="text-3xl font-bold text-red-600">
                                    {formatPrice(product.precio)}
                                </p>
                            </div>

                            {/* Estado y stock */}
                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                    product.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                    product.estado === 'agotado' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {product.estado}
                                </span>
                                <span className="text-gray-600">
                                    📦 Stock: <strong>{product.stock}</strong> unidades
                                </span>
                            </div>

                            {/* Descripción */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                                <p className="text-gray-700 leading-relaxed">{product.descripcion}</p>
                            </div>

                            {/* Especificaciones */}
                            {product.especificaciones && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificaciones</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                            {product.especificaciones}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Información del vendedor */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vendedor</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">
                                            {product.vendedor_nombre?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {product.vendedor_nombre} {product.vendedor_apellido}
                                        </p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span className="flex items-center">
                                                ⭐ {parseFloat(product.vendedor_calificacion).toFixed(1)}
                                            </span>
                                            <span>
                                                🛍️ {product.vendedor_total_ventas} ventas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Categoría */}
                            <div className="border-t pt-6">
                                <p className="text-sm text-gray-600">
                                    <strong>Categoría:</strong> 
                                    <span className="ml-1 text-gray-900">{product.categoria_nombre}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productos relacionados */}
                {product.productos_relacionados && product.productos_relacionados.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Productos Relacionados</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {product.productos_relacionados.map((relatedProduct) => (
                                <div 
                                    key={relatedProduct.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => window.location.reload()}
                                >
                                    <div className="aspect-[4/3] w-full bg-gray-100 rounded-t-lg overflow-hidden">
                                        <img
                                            src={getImageUrl(relatedProduct.imagen_principal)}
                                            alt={relatedProduct.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {relatedProduct.nombre}
                                        </h4>
                                        <p className="text-lg font-bold text-red-600">
                                            {formatPrice(relatedProduct.precio)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};