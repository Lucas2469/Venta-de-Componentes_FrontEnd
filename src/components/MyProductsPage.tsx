import React, { useState, useEffect } from "react";
import { Package, Plus, ArrowLeft } from "lucide-react";
import { User } from "./types";

interface MyProductsPageProps {
  currentUser: User;
  onNavigate: (page: string) => void;
  onProductClick: (productId: number) => void;
}

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: string;
  categoria_nombre: string;
  fecha_publicacion: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function MyProductsPage({ currentUser, onNavigate, onProductClick }: MyProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProducts();
  }, [currentUser.id]);

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/productos/vendedor/${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter(p => p.estado === 'activo' && p.stock > 0);
  const inactiveProducts = products.filter(p => p.estado !== 'activo' || p.stock === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('profile')}
            className="text-gray-600 hover:text-pink-600 mb-4 flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver a Mi Perfil</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center space-x-3">
                <Package className="h-10 w-10 text-pink-600" />
                <span>Mis Productos</span>
              </h1>
              <p className="text-gray-600 mt-2">Gestiona todos tus productos publicados</p>
            </div>
            <button
              onClick={() => onNavigate('create-ad')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Anuncio</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-gray-600 mb-1">Productos Activos</p>
            <p className="text-4xl font-bold text-green-600">{activeProducts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
            <p className="text-gray-600 mb-1">Productos Inactivos</p>
            <p className="text-4xl font-bold text-gray-600">{inactiveProducts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
            <p className="text-gray-600 mb-1">Total Publicados</p>
            <p className="text-4xl font-bold text-pink-600">{products.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tienes productos publicados</h3>
            <p className="text-gray-600 mb-6">Crea tu primer anuncio para comenzar a vender</p>
            <button
              onClick={() => onNavigate('create-ad')}
              className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Crear Anuncio
            </button>
          </div>
        ) : (
          <>
            {/* Productos activos */}
            {activeProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-8 bg-green-500 rounded"></div>
                  <span>Productos Activos ({activeProducts.length})</span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => onProductClick(product.id)}
                      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-pink-300 hover:shadow-xl transition-all text-left"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          Activo
                        </span>
                        <span className="text-sm text-gray-500">{product.categoria_nombre}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{product.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-pink-600">Bs. {product.precio}</span>
                        <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Publicado: {new Date(product.fecha_publicacion).toLocaleDateString('es-ES')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Productos inactivos */}
            {inactiveProducts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-8 bg-gray-500 rounded"></div>
                  <span>Productos Inactivos/Agotados ({inactiveProducts.length})</span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inactiveProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gray-50 rounded-xl shadow-lg p-6 border border-gray-200 opacity-75"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          {product.stock === 0 ? 'Agotado' : product.estado}
                        </span>
                        <span className="text-sm text-gray-500">{product.categoria_nombre}</span>
                      </div>
                      <h3 className="font-bold text-gray-700 text-lg mb-2">{product.nombre}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-600">Bs. {product.precio}</span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Publicado: {new Date(product.fecha_publicacion).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
