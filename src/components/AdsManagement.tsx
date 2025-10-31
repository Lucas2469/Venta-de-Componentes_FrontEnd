import React, { useState, useEffect } from 'react';
import {
  Eye,
  ToggleLeft,
  ToggleRight,
  X,
  ExternalLink,
  Package,
  ShoppingBag,
  Star
} from "lucide-react";
import { productsApi, ProductSummary } from '../api/productsApi';
import { getImageUrl } from '../api/api';
import { ConfirmationModal } from './reusables/ConfirmationModal';
import { DeactivationModal } from './reusables/DeactivationModal';
import { notificationsApi } from '../api/notificationsApi';

export const AdsManagement: React.FC = () => {
  // Estados para gestión de productos
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function para formatear precio de manera segura
  const formatPrice = (precio: number | string): string => {
    const numericPrice = typeof precio === 'string' ? parseFloat(precio) : precio;
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  // Estados para modal de vista previa
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);

  // Estados para modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const [productToToggle, setProductToToggle] = useState<ProductSummary | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsApi.getAllProducts({
        page: 1,
        limit: 100 // Cargar todos para administración (activos e inactivos)
        // Sin filtro de estado para ver todos los productos
      });

      if (response.success) {
        // Filtrar productos agotados - el admin no debería gestionarlos
        const productosGestionables = response.data.filter((p: ProductSummary) => p.estado !== 'agotado');
        setProducts(productosGestionables);
      } else {
        setError('Error al cargar los productos');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Error de conexión al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Effect para cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Funciones para manejar acciones de productos
  const handlePreviewProduct = (product: ProductSummary) => {
    setSelectedProduct(product);
    setShowPreviewModal(true);
  };

  const handleToggleProductStatus = (product: ProductSummary) => {
    setProductToToggle(product);

    if (product.estado === 'activo') {
      // Para desactivar: usar modal de desactivación con notificación
      setShowDeactivationModal(true);
    } else {
      // Para reactivar: usar modal de confirmación simple
      setShowConfirmModal(true);
    }
  };

  // Para reactivación simple (sin notificación)
  const confirmReactivation = async () => {
    if (!productToToggle) return;

    try {
      setIsUpdatingStatus(true);
      const response = await productsApi.updateProductStatus(productToToggle.id, 'activo');

      if (response.success) {
        // Actualizar el estado local
        setProducts(prev => prev.map(product =>
          product.id === productToToggle.id
            ? { ...product, estado: 'activo' }
            : product
        ));

        // También actualizar el producto seleccionado si está en el modal de vista previa
        if (selectedProduct && selectedProduct.id === productToToggle.id) {
          setSelectedProduct({ ...selectedProduct, estado: 'activo' });
        }
      } else {
        console.error('Error reactivating product:', response.message);
        alert('Error al reactivar el producto');
      }
    } catch (error) {
      console.error('Error reactivating product:', error);
      alert('Error de conexión al reactivar el producto');
    } finally {
      setIsUpdatingStatus(false);
      setShowConfirmModal(false);
      setProductToToggle(null);
    }
  };

  // Para desactivación con notificación
  const confirmDeactivation = async (titulo: string, mensaje: string) => {
    if (!productToToggle) return;

    try {
      setIsUpdatingStatus(true);

      // 1. Desactivar el producto
      const productResponse = await productsApi.updateProductStatus(productToToggle.id, 'inactivo');

      if (!productResponse.success) {
        throw new Error('Error al desactivar el producto');
      }

      // 2. Crear notificación para el vendedor
      // Usando IDs hardcodeados como mencionaste:
      // - Admin ID: 1 (usuario remitente)
      // - Vendedor: se obtiene del producto (usuario receptor)
      const notificationData = {
        remitente_id: 1, // ID del admin hardcodeado
        usuario_id: productToToggle.vendedor_id, // ID del vendedor del producto
        titulo,
        mensaje,
        tipo: 'producto' as const
      };

      const notificationResponse = await notificationsApi.createNotification(notificationData);

      if (notificationResponse.success) {
        // Actualizar el estado local
        setProducts(prev => prev.map(product =>
          product.id === productToToggle.id
            ? { ...product, estado: 'inactivo' }
            : product
        ));

        // También actualizar el producto seleccionado si está en el modal de vista previa
        if (selectedProduct && selectedProduct.id === productToToggle.id) {
          setSelectedProduct({ ...selectedProduct, estado: 'inactivo' });
        }

        alert('Producto desactivado y notificación enviada exitosamente');
      } else {
        console.warn('Producto desactivado pero error al enviar notificación:', notificationResponse.message);
        alert('Producto desactivado correctamente, pero hubo un problema al enviar la notificación');
      }

    } catch (error) {
      console.error('Error deactivating product:', error);
      alert('Error al desactivar el producto');
    } finally {
      setIsUpdatingStatus(false);
      setShowDeactivationModal(false);
      setProductToToggle(null);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            Activo
          </span>
        );
      case 'inactivo':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
            Inactivo
          </span>
        );
      case 'agotado':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
            Agotado
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
            {estado}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Cargando productos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar productos</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Gestión de Anuncios</h3>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 space-y-1">
              <p>
                Total: <span className="font-semibold">{products.length}</span>
              </p>
              <div className="flex gap-2 sm:gap-4 flex-wrap">
                <span className="text-green-600 text-xs sm:text-sm">
                  Activos: <span className="font-semibold">{products.filter(p => p.estado === 'activo').length}</span>
                </span>
                <span className="text-red-600 text-xs sm:text-sm">
                  Inactivos: <span className="font-semibold">{products.filter(p => p.estado === 'inactivo').length}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* DESKTOP */}
        <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Nombre
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Vendedor
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Precio
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Estado
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Vista Previa
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate text-xs sm:text-sm" title={product.nombre}>
                          {product.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.categoria_nombre}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="text-xs sm:text-sm">
                        <p className="font-medium text-gray-900">
                          {product.vendedor_nombre}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="h-2 sm:h-3 w-2 sm:w-3 text-yellow-500 mr-1" />
                          <span className="text-xs text-gray-500">
                            {parseFloat(product.vendedor_calificacion || '0').toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <span className="text-sm sm:text-lg font-bold text-green-600">
                        Bs {formatPrice(product.precio)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      {getStatusBadge(product.estado)}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-center">
                      <button
                        onClick={() => handlePreviewProduct(product)}
                        className="p-1 sm:p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200 hover:scale-110 transform"
                        title="Ver vista previa"
                      >
                        <Eye className="h-3 sm:h-5 w-3 sm:w-5" />
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-center">
                      <button
                        onClick={() => handleToggleProductStatus(product)}
                        className={`p-1 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 transform ${
                          product.estado === 'activo'
                            ? 'bg-red-100 hover:bg-red-200 text-red-600'
                            : 'bg-green-100 hover:bg-green-200 text-green-600'
                        }`}
                        title={product.estado === 'activo' ? 'Desactivar producto' : 'Activar producto'}
                      >
                        {product.estado === 'activo' ? (
                          <ToggleLeft className="h-3 sm:h-5 w-3 sm:w-5" />
                        ) : (
                          <ToggleRight className="h-3 sm:h-5 w-3 sm:w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No hay productos registrados</p>
                    <p className="text-sm">Los productos aparecerán aquí cuando se registren.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}
        <div className="md:hidden space-y-3 px-2">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow border border-gray-200 p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{product.nombre}</p>
                    <p className="text-xs text-gray-600">{product.vendedor_nombre} · ⭐{parseFloat(product.vendedor_calificacion || '0').toFixed(1)}</p>
                  </div>
                  {getStatusBadge(product.estado)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-200 pt-2">
                  <div>
                    <p className="text-gray-600 font-medium">Precio</p>
                    <p className="text-green-600 font-bold">Bs {formatPrice(product.precio)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Categoría</p>
                    <p className="text-gray-900">{product.categoria_nombre}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button onClick={() => handlePreviewProduct(product)} className="flex-1 px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100">👁️ Ver</button>
                  <button onClick={() => handleToggleProductStatus(product)} className={`flex-1 px-2 py-1 text-xs font-bold rounded hover:scale-105 ${product.estado === 'activo' ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                    {product.estado === 'activo' ? '⬜ Desact' : '✅ Activ'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8"><ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-300" /><p>No hay productos</p></div>
          )}
        </div>
      </div>

      {/* Modal de Vista Previa de Producto */}
      {showPreviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-auto sm:mx-0">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex-1">Vista Previa del Producto</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                title="Cerrar"
              >
                <X className="h-5 sm:h-6 w-5 sm:w-6 text-gray-500" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Imagen del producto */}
              <div className="relative">
                {selectedProduct.imagen_principal ? (
                  <img
                    src={getImageUrl(selectedProduct.imagen_principal)}
                    alt={selectedProduct.nombre}
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/400/300';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sin imagen disponible</p>
                    </div>
                  </div>
                )}

                {/* Badge de estado sobre la imagen */}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(selectedProduct.estado)}
                </div>
              </div>

              {/* Información del producto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Nombre</h4>
                    <p className="text-gray-900">{selectedProduct.nombre}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Categoría</h4>
                    <p className="text-gray-900">{selectedProduct.categoria_nombre}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Precio</h4>
                    <p className="text-2xl font-bold text-green-600">Bs {formatPrice(selectedProduct.precio)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Vendedor</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-gray-900">
                        {selectedProduct.vendedor_nombre} {selectedProduct.vendedor_apellido}
                      </p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">
                          {parseFloat(selectedProduct.vendedor_calificacion).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Detalles</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-medium">{selectedProduct.stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Producto:</span>
                        <span className="font-medium">{selectedProduct.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Imágenes:</span>
                        <span className="font-medium">{selectedProduct.total_imagenes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleToggleProductStatus(selectedProduct)}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedProduct.estado === 'activo'
                      ? 'bg-red-100 hover:bg-red-200 text-red-700'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  {selectedProduct.estado === 'activo' ? '🔴 Desactivar' : '🟢 Activar'} Producto
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={() => window.open(`/product/${selectedProduct.id}`, '_blank')}
                    className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver en Catálogo
                  </button>

                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Reactivación */}
      {showConfirmModal && productToToggle && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmReactivation}
          title="Reactivar Producto"
          message={`¿Estás seguro de que quieres reactivar el producto "${productToToggle.nombre}"? El producto volverá a aparecer en el catálogo público y estará disponible para los compradores.`}
          confirmText="Reactivar"
          cancelText="Cancelar"
          type="success"
          loading={isUpdatingStatus}
        />
      )}

      {/* Modal de Desactivación con Notificación */}
      {showDeactivationModal && productToToggle && (
        <DeactivationModal
          isOpen={showDeactivationModal}
          onClose={() => setShowDeactivationModal(false)}
          onConfirm={confirmDeactivation}
          productName={productToToggle.nombre}
          vendorName={`${productToToggle.vendedor_nombre} ${productToToggle.vendedor_apellido}`}
          isLoading={isUpdatingStatus}
        />
      )}
    </div>
  );
};