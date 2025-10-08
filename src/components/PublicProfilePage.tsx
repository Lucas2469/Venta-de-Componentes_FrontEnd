import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Star,
  Calendar,
  Package,
  ShoppingCart,
  Clock,
  MapPin,
  Award,
  TrendingUp,
  MessageCircle,
  Shield
} from "lucide-react";

interface PublicProfilePageProps {
  userId: string;
  onNavigate: (page: string) => void;
  onProductClick: (productId: number) => void;
}

interface UserProfile {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  tipo_usuario: string;
  creditos_disponibles: number;
  fecha_registro: string;
  calificacion_promedio: number;
  total_intercambios_vendedor: number;
  total_intercambios_comprador: number;
}

interface Rating {
  id: number;
  calificacion: number;
  comentario: string;
  fecha_creacion: string;
  calificador_nombre: string;
  calificador_apellido: string;
  tipo_calificacion: 'comprador_a_vendedor' | 'vendedor_a_comprador';
}

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  categoria_nombre: string;
  fecha_publicacion: string;
}

interface Schedule {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function PublicProfilePage({ userId, onNavigate, onProductClick }: PublicProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ratings' | 'products'>('ratings');

  const isSeller = profile && profile.creditos_disponibles > 0;

  useEffect(() => {
    fetchUserProfile();
    fetchUserRatings();
    fetchUserProducts();
    fetchUserSchedules();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data || data);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/calificaciones/usuario/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    }
  };

  const fetchUserProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/productos/vendedor/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo productos activos
        setProducts((data.data || data).filter((p: Product) => p.stock > 0));
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const fetchUserSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/schedules/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const sellerRatings = ratings.filter(r => r.tipo_calificacion === 'comprador_a_vendedor');
  const buyerRatings = ratings.filter(r => r.tipo_calificacion === 'vendedor_a_comprador');

  const avgSellerRating = sellerRatings.length > 0
    ? sellerRatings.reduce((sum, r) => sum + r.calificacion, 0) / sellerRatings.length
    : 0;

  const avgBuyerRating = buyerRatings.length > 0
    ? buyerRatings.reduce((sum, r) => sum + r.calificacion, 0) / buyerRatings.length
    : 0;

  const diasEmojis: Record<string, string> = {
    'lunes': '💼',
    'martes': '⚡',
    'miércoles': '🌟',
    'jueves': '🚀',
    'viernes': '🎉',
    'sábado': '☀️',
    'domingo': '🌞'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Botón volver */}
        <button
          onClick={() => onNavigate('catalog')}
          className="text-gray-600 hover:text-pink-600 mb-6 flex items-center space-x-2"
        >
          <span>← Volver</span>
        </button>

        {/* Header del perfil */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full p-1">
              <div className="bg-white rounded-full p-6">
                <UserIcon className="h-24 w-24 text-pink-600" />
              </div>
            </div>

            {/* Información principal */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  {profile.nombre} {profile.apellido}
                </h1>
                {isSeller && (
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Vendedor Verificado</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 mb-4">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde {new Date(profile.fecha_registro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</span>
              </div>

              {/* Calificación general */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 inline-block">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{Number(profile.calificacion_promedio).toFixed(1)}</p>
                    <div className="flex space-x-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Number(profile.calificacion_promedio) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-gray-300 pl-3">
                    <p className="text-sm text-gray-600">Calificación General</p>
                    <p className="text-xs text-gray-500">{ratings.length} calificaciones totales</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4">
              {isSeller && (
                <div className="bg-pink-50 rounded-xl p-4 text-center border border-pink-200">
                  <Package className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-pink-600">{profile.total_intercambios_vendedor}</p>
                  <p className="text-xs text-gray-600">Ventas</p>
                </div>
              )}
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                <ShoppingCart className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{profile.total_intercambios_comprador}</p>
                <p className="text-xs text-gray-600">Compras</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Desglose de calificaciones */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Award className="h-6 w-6 text-yellow-600" />
                <span>Reputación Detallada</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Como vendedor */}
                {isSeller && (
                  <div className="border-2 border-pink-200 rounded-xl p-6 bg-gradient-to-br from-pink-50 to-white">
                    <div className="flex items-center space-x-2 mb-4">
                      <Package className="h-5 w-5 text-pink-600" />
                      <h3 className="font-bold text-gray-900">Como Vendedor</h3>
                    </div>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-pink-600 mb-2">
                        {avgSellerRating > 0 ? avgSellerRating.toFixed(1) : 'N/A'}
                      </p>
                      <div className="flex justify-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= avgSellerRating ? 'text-pink-500 fill-pink-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{sellerRatings.length} calificaciones</p>
                    </div>
                  </div>
                )}

                {/* Como comprador */}
                <div className="border-2 border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center space-x-2 mb-4">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    <h3 className="font-bold text-gray-900">Como Comprador</h3>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-purple-600 mb-2">
                      {avgBuyerRating > 0 ? avgBuyerRating.toFixed(1) : 'N/A'}
                    </p>
                    <div className="flex justify-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= avgBuyerRating ? 'text-purple-500 fill-purple-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{buyerRatings.length} calificaciones</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs: Calificaciones / Productos */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('ratings')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'ratings'
                      ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Calificaciones ({ratings.length})</span>
                  </div>
                </button>
                {isSeller && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === 'products'
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Productos ({products.length})</span>
                    </div>
                  </button>
                )}
              </div>

              <div className="p-6">
                {activeTab === 'ratings' && (
                  <div className="space-y-4">
                    {ratings.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No hay calificaciones aún</p>
                    ) : (
                      ratings.slice(0, 10).map((rating) => (
                        <div key={rating.id} className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {rating.calificador_nombre} {rating.calificador_apellido}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(rating.fecha_creacion).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= rating.calificacion ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {rating.comentario && (
                            <p className="text-gray-700 text-sm mt-2 italic">"{rating.comentario}"</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {rating.tipo_calificacion === 'comprador_a_vendedor' ? '📦 Como vendedor' : '🛒 Como comprador'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'products' && isSeller && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {products.length === 0 ? (
                      <p className="text-gray-500 text-center py-8 col-span-2">No hay productos activos</p>
                    ) : (
                      products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => onProductClick(product.id)}
                          className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 hover:shadow-lg transition-all text-left"
                        >
                          <h4 className="font-bold text-gray-900 mb-2">{product.nombre}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.descripcion}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-pink-600">Bs. {product.precio}</span>
                            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{product.categoria_nombre}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Horarios de atención (si es vendedor) */}
            {isSeller && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-teal-600" />
                  <span>Horarios de Atención</span>
                </h3>
                {schedules.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay horarios configurados</p>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((schedule) => (
                      <div key={schedule.id} className="border-l-4 border-teal-500 pl-3 py-2 bg-teal-50 rounded-r-lg">
                        <p className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{diasEmojis[schedule.dia_semana]}</span>
                          <span className="capitalize">{schedule.dia_semana}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {schedule.hora_inicio.slice(0, 5)} - {schedule.hora_fin.slice(0, 5)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-teal-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <span>Actividad</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total transacciones:</span>
                  <span className="font-bold text-gray-900">
                    {profile.total_intercambios_vendedor + profile.total_intercambios_comprador}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Productos activos:</span>
                  <span className="font-bold text-gray-900">{products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Calificaciones:</span>
                  <span className="font-bold text-gray-900">{ratings.length}</span>
                </div>
              </div>
            </div>

            {/* Confianza */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Nivel de Confianza</span>
              </h3>
              <div className="text-center">
                {Number(profile.calificacion_promedio) >= 4.5 ? (
                  <div>
                    <p className="text-4xl mb-2">🏆</p>
                    <p className="font-bold text-green-600">Usuario Excelente</p>
                    <p className="text-sm text-gray-600 mt-1">Alta reputación en la comunidad</p>
                  </div>
                ) : Number(profile.calificacion_promedio) >= 3.5 ? (
                  <div>
                    <p className="text-4xl mb-2">⭐</p>
                    <p className="font-bold text-blue-600">Usuario Confiable</p>
                    <p className="text-sm text-gray-600 mt-1">Buena reputación</p>
                  </div>
                ) : Number(profile.calificacion_promedio) > 0 ? (
                  <div>
                    <p className="text-4xl mb-2">👤</p>
                    <p className="font-bold text-yellow-600">Usuario en Desarrollo</p>
                    <p className="text-sm text-gray-600 mt-1">Construyendo reputación</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-4xl mb-2">🆕</p>
                    <p className="font-bold text-gray-600">Usuario Nuevo</p>
                    <p className="text-sm text-gray-600 mt-1">Sin calificaciones aún</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
