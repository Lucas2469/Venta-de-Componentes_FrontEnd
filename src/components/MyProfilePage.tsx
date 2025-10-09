import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Star,
  CreditCard,
  Package,
  ShoppingCart,
  Clock,
  Edit2,
  Save,
  X,
  Shield,
  TrendingUp,
  Award,
  History,
  Eye,
  EyeOff
} from "lucide-react";
import { User } from "./types";
import { useToast } from "./Toast";
import { useAuthContext } from "../contexts/AuthContext";

interface MyProfilePageProps {
  onNavigate: (page: string) => void;
}

interface CreditHistory {
  id: number;
  tipo_movimiento: 'ingreso' | 'egreso';
  cantidad: number;
  concepto: string;
  saldo_anterior: number;
  saldo_nuevo: number;
  fecha_movimiento: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function MyProfilePage({ onNavigate }: MyProfilePageProps) {
  const { user: currentUser, updateUser } = useAuthContext();
  const { showToast, ToastComponent } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creditHistory, setCreditHistory] = useState<CreditHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [totalRatingsReceived, setTotalRatingsReceived] = useState(0);

  const [formData, setFormData] = useState({
    nombre: currentUser?.nombre || '',
    apellido: currentUser?.apellido || '',
    email: currentUser?.email || '',
    telefono: currentUser?.telefono || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const isAdmin = currentUser?.tipo_usuario === 'admin';
  const isSeller = !isAdmin && (currentUser?.creditos_disponibles || 0) > 0;

  // Cargar historial de créditos y calificaciones
  useEffect(() => {
    if (!isAdmin) {
      fetchCreditHistory();
    }
    fetchTotalRatings();
  }, [currentUser?.id]);

  const fetchCreditHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE}/api/historial-creditos/${currentUser?.id}`);
      if (response.ok) {
        const data = await response.json();
        setCreditHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar historial de créditos:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchTotalRatings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/calificaciones/usuario/${currentUser?.id}`);
      if (response.ok) {
        const data = await response.json();
        setTotalRatingsReceived((data.data || []).length);
      }
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/${currentUser?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast('success', 'Perfil actualizado', 'Tus datos se guardaron correctamente');

        // Actualizar usuario en el estado global
        updateUser({
          ...currentUser,
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono
        });

        setIsEditing(false);
      } else {
        showToast('error', 'Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showToast('error', 'Error de conexión', 'Intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Error', 'Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('error', 'Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/${currentUser?.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        showToast('success', 'Contraseña actualizada', 'Tu contraseña se cambió correctamente');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowChangePassword(false);
      } else {
        const data = await response.json();
        showToast('error', 'Error', data.error || 'No se pudo cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      showToast('error', 'Error de conexión', 'Intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      nombre: currentUser?.nombre || '',
      apellido: currentUser?.apellido || '',
      email: currentUser?.email || '',
      telefono: currentUser?.telefono || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      <ToastComponent />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('catalog')}
            className="text-gray-600 hover:text-pink-600 mb-4 flex items-center space-x-2"
          >
            <span>← Volver al catálogo</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información personal */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <UserIcon className="h-6 w-6 text-pink-600" />
                  <span>Información Personal</span>
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser?.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser?.apellido}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser?.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Teléfono</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser?.telefono || 'No registrado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde</span>
                  </label>
                  <p className="text-gray-900 font-medium">
                    {currentUser?.fecha_registro
                      ? new Date(currentUser.fecha_registro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'No disponible'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Tipo de cuenta</span>
                  </label>
                  <p className="text-gray-900 font-medium">
                    {isAdmin ? '👑 Administrador' : isSeller ? '💼 Vendedor' : '🛒 Comprador'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cambiar contraseña */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="w-full flex justify-between items-center"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <span>Cambiar Contraseña</span>
                </h2>
                <span className="text-purple-600">{showChangePassword ? '▼' : '▶'}</span>
              </button>

              {showChangePassword && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              )}
            </div>

            {/* Historial de créditos (solo no-admin) */}
            {!isAdmin && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <History className="h-6 w-6 text-teal-600" />
                  <span>Historial de Créditos</span>
                </h2>

                {loadingHistory ? (
                  <p className="text-gray-500 text-center py-8">Cargando historial...</p>
                ) : creditHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay movimientos de créditos</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {creditHistory.map((item) => (
                      <div
                        key={item.id}
                        className={`border-l-4 ${item.tipo_movimiento === 'ingreso' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} p-4 rounded-r-lg`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{item.concepto}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(item.fecha_movimiento).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${item.tipo_movimiento === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                              {item.tipo_movimiento === 'ingreso' ? '+' : '-'}{item.cantidad}
                            </p>
                            <p className="text-sm text-gray-600">
                              Saldo: {item.saldo_nuevo}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna derecha - Estadísticas */}
          <div className="space-y-6">
            {/* Créditos disponibles (solo no-admin) */}
            {!isAdmin && (
              <div className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Créditos Disponibles</h3>
                  <CreditCard className="h-6 w-6" />
                </div>
                <p className="text-5xl font-bold mb-4">{currentUser?.creditos_disponibles || 0}</p>
                <button
                  onClick={() => onNavigate('buy-credits')}
                  className="w-full bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium"
                >
                  Comprar más créditos
                </button>
              </div>
            )}

            {/* Calificación */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Calificación Promedio</h3>
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-900 mb-2">
                  {currentUser?.rating ? Number(currentUser?.rating).toFixed(1) : '0.0'}
                </p>
                <div className="flex justify-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Number(currentUser?.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Basado en {currentUser?.totalTransactions || 0} transacciones
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <span>Estadísticas</span>
              </h3>
              <div className="space-y-4">
                {isSeller && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-pink-600" />
                      <span className="text-gray-700">Total ventas</span>
                    </div>
                    <span className="font-bold text-gray-900">{currentUser?.totalTransactions || 0}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-700">Total compras</span>
                  </div>
                  <span className="font-bold text-gray-900">{currentUser?.total_intercambios_comprador || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-gray-700">Calificaciones recibidas</span>
                  </div>
                  <span className="font-bold text-gray-900">{totalRatingsReceived}</span>
                </div>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
              <div className="space-y-2">
                {isSeller && (
                  <>
                    <button
                      onClick={() => onNavigate('my-products')}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-gray-700 group-hover:text-pink-600">Mis Productos</span>
                      <Package className="h-5 w-5 text-gray-400 group-hover:text-pink-600" />
                    </button>
                    <button
                      onClick={() => onNavigate('vendor-appointments')}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-gray-700 group-hover:text-purple-600">Mis Citas (Vendedor)</span>
                      <Calendar className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                    </button>
                    <button
                      onClick={() => onNavigate('mis-horarios')}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-gray-700 group-hover:text-teal-600">Mis Horarios</span>
                      <Clock className="h-5 w-5 text-gray-400 group-hover:text-teal-600" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => onNavigate('my-appointments')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-between group"
                >
                  <span className="text-gray-700 group-hover:text-orange-600">Mis Citas (Comprador)</span>
                  <ShoppingCart className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
