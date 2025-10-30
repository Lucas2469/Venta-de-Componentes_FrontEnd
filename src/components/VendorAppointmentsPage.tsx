import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, Phone, Package, DollarSign, Calendar, CheckCircle, X, Star, AlertTriangle } from 'lucide-react';
import { appointmentApi, Appointment } from '../api/Appointment';
import { ratingApi, CreateRatingRequest } from '../api/Rating';
import { getRatingsWithAppointmentDetails } from '../api/ratings';
import { showToast } from './Toast';
import RatingModal from './RatingModal';
import RatingDisplay, { RatingSummary } from './RatingDisplay';
import { useAuthContext } from '../contexts/AuthContext';

interface VendorAppointmentsPageProps {
}

const VendorAppointmentsPage: React.FC<VendorAppointmentsPageProps> = () => {
  const { user: currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [expandedAppointment, setExpandedAppointment] = useState<number | null>(null);
  const [appointmentRatings, setAppointmentRatings] = useState<{[key: number]: any}>({});

  // Estados para el modal de calificación
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingAppointment, setRatingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Convertir currentUser.id (string) a número para la API
      const userId = parseInt(currentUser.id.toString());
      const response = await appointmentApi.getVendorAppointments(userId, filter || undefined);

      if (response.success) {
        setAppointments(response.data);
      } else {
        showToast('error', response.error || 'Error al cargar agendamientos');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error al cargar agendamientos:', error);
      showToast('error', 'Error al cargar agendamientos');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar calificaciones de un agendamiento específico
  const loadAppointmentRatings = async (appointmentId: number) => {
    try {
      const ratingsData = await getRatingsWithAppointmentDetails(appointmentId);
      setAppointmentRatings(prev => ({
        ...prev,
        [appointmentId]: ratingsData
      }));
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  // Función para expandir/contraer detalles de cita
  const toggleExpanded = async (appointmentId: number) => {
    if (expandedAppointment === appointmentId) {
      setExpandedAppointment(null);
    } else {
      setExpandedAppointment(appointmentId);
      // Cargar calificaciones si no están cargadas
      if (!appointmentRatings[appointmentId]) {
        await loadAppointmentRatings(appointmentId);
      }
    }
  };

  const handleConfirm = async (appointmentId: number) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (!appointment) return;

    setConfirmingId(appointmentId);
    try {
      const response = await appointmentApi.confirmAppointment(appointmentId, parseInt(currentUser.id.toString()));

      if (response.success) {
        showToast('success', '¡Agendamiento confirmado!', 'La cita ha sido confirmada. Podrás calificar al comprador después del encuentro.');

        await fetchAppointments();
      } else {
        showToast('error', 'Error', response.error || 'Error al confirmar agendamiento');
      }
    } catch (error) {
      console.error('Error al confirmar agendamiento:', error);
      showToast('error', 'Error', 'Error al confirmar agendamiento');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReject = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedAppointmentId || !rejectReason.trim()) {
      showToast('error', 'Motivo requerido', 'Debes proporcionar un motivo para rechazar la cita');
      return;
    }

    setRejectingId(selectedAppointmentId);
    try {
      // Actualizar estado a cancelado con motivo
      const response = await appointmentApi.rejectAppointment(selectedAppointmentId, rejectReason);

      if (response.success) {
        showToast('success', 'Cita rechazada', 'La cita ha sido rechazada y se notificó al comprador');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedAppointmentId(null);
        await fetchAppointments();
      } else {
        showToast('error', 'Error', response.error || 'No se pudo rechazar la cita');
      }
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'No se pudo rechazar la cita');
    } finally {
      setRejectingId(null);
    }
  };

  // Función para abrir modal de calificación al comprador
  const handleRateBuyer = (appointment: Appointment) => {
    setRatingAppointment(appointment);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!ratingAppointment) return;

    const ratingData: CreateRatingRequest = {
      producto_id: ratingAppointment.producto_id,
      agendamiento_id: ratingAppointment.id,
      calificador_id: parseInt(currentUser.id.toString()),
      calificado_id: ratingAppointment.comprador_id,
      tipo_calificacion: 'vendedor_a_comprador',
      calificacion: rating,
      comentario: comment || undefined
    };

    try {
      await ratingApi.createRating(ratingData);
      setShowRatingModal(false);
      setRatingAppointment(null);
      // No mostrar toast aquí, ya se muestra en el modal
    } catch (error: any) {
      throw error; // El modal manejará el error
    }
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      agendado: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      confirmado: { color: 'bg-green-100 text-green-800', label: 'Confirmado' },
      completado: { color: 'bg-blue-100 text-blue-800', label: 'Completado' },
      cancelado: { color: 'bg-red-100 text-red-800', label: 'Cancelado' }
    };

    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig.agendado;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    // Parsear la fecha sin convertirla a UTC
    // dateString viene como "YYYY-MM-DD" del backend
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month es 0-indexed en Date

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando agendamientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Agendamientos</h1>
          <p className="mt-2 text-gray-600">Gestiona las citas de tus productos</p>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filter === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('agendado')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filter === 'agendado'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('confirmado')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filter === 'confirmado'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Confirmados
            </button>
            <button
              onClick={() => setFilter('completado')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filter === 'completado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Completados
            </button>
          </div>
        </div>

        {/* Lista de agendamientos */}
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay agendamientos</h3>
            <p className="text-gray-600">
              {filter ? `No tienes agendamientos ${filter === 'agendado' ? 'pendientes' : filter}` : 'Aún no tienes agendamientos'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Header con producto y estado */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {appointment.producto_nombre}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Package className="h-4 w-4 mr-1" />
                      <span>Producto ID: {appointment.producto_id}</span>
                    </div>
                  </div>
                  {getStatusBadge(appointment.estado)}
                </div>

                {/* Información del comprador */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 text-gray-600 mr-2" />
                    <button
                      onClick={() => navigate(`/user/${appointment.comprador_id}`)}
                      className="font-medium text-gray-900 hover:text-pink-600 hover:underline transition-colors"
                    >
                      {appointment.comprador_nombre}
                    </button>
                  </div>
                  {appointment.comprador_telefono && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-gray-600">{appointment.comprador_telefono}</span>
                    </div>
                  )}
                </div>

                {/* Fecha y hora */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">{formatDate(appointment.fecha_cita)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-gray-600">{formatTime(appointment.hora_cita)}</span>
                  </div>
                </div>

                {/* Punto de encuentro */}
                <div className="mb-4">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{appointment.punto_encuentro_nombre}</div>
                      <div className="text-sm text-gray-600">{appointment.punto_encuentro_direccion}</div>
                      {appointment.punto_encuentro_referencias && (
                        <div className="text-xs text-gray-500 mt-1">{appointment.punto_encuentro_referencias}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cantidad, Precio Unitario y Total */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        Cantidad: <span className="font-semibold text-gray-900">{appointment.cantidad_solicitada || 1}</span>
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Unitario: <span className="font-semibold text-gray-900">Bs {appointment.producto_precio ? Number(appointment.producto_precio).toFixed(2) : '0.00'}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-xl font-bold text-green-600">
                      Total: Bs {appointment.producto_precio ? (Number(appointment.producto_precio) * (appointment.cantidad_solicitada || 1)).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 mb-4">
                  <div>Agendado: {new Date(appointment.fecha_agendamiento).toLocaleString('es-ES')}</div>
                  {appointment.fecha_confirmacion && (
                    <div>Confirmado: {new Date(appointment.fecha_confirmacion).toLocaleString('es-ES')}</div>
                  )}
                </div>

                {/* Acciones */}
                {appointment.estado === 'agendado' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(appointment.id)}
                      disabled={confirmingId === appointment.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {confirmingId === appointment.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmar Cita
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(appointment.id)}
                      disabled={rejectingId === appointment.id}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {rejectingId === appointment.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                {appointment.estado === 'confirmado' && (
                  <div className="space-y-3">
                    <div className="text-center text-green-600 font-medium">
                      ✓ Cita confirmada
                    </div>
                    <div className="text-center text-blue-600 text-sm">
                      <Star className="h-4 w-4 mx-auto mb-1" />
                      Se completará automáticamente cuando ambos se califiquen
                    </div>
                  </div>
                )}

                {appointment.estado === 'cancelado' && (
                  <div className="text-center text-red-600 font-medium">
                    ✗ Cita cancelada
                    {appointment.motivo_cancelacion && (
                      <div className="text-sm text-gray-600 mt-1">
                        Motivo: {appointment.motivo_cancelacion}
                      </div>
                    )}
                  </div>
                )}

                {/* Sección de calificaciones para citas completadas */}
                {appointment.estado === 'completado' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Calificaciones</h4>
                      <button
                        onClick={() => toggleExpanded(appointment.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {expandedAppointment === appointment.id ? 'Ocultar detalles' : 'Ver detalles'}
                      </button>
                    </div>

                    {/* Vista compacta de calificaciones */}
                    {expandedAppointment === appointment.id && appointmentRatings[appointment.id] && appointmentRatings[appointment.id].calificaciones && Object.keys(appointmentRatings[appointment.id].calificaciones).length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Calificación que dí al comprador */}
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-xs text-green-600 font-medium mb-1">Mi calificación al comprador</div>
                          {appointmentRatings[appointment.id].calificaciones?.vendedor_a_comprador ? (
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= appointmentRatings[appointment.id].calificaciones.vendedor_a_comprador.calificacion
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">
                                {appointmentRatings[appointment.id].calificaciones.vendedor_a_comprador.calificacion}/5
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRateBuyer(appointment)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              Calificar comprador
                            </button>
                          )}
                        </div>

                        {/* Calificación que me dio el comprador */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium mb-1">Calificación del comprador</div>
                          {appointmentRatings[appointment.id].calificaciones?.comprador_a_vendedor ? (
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= appointmentRatings[appointment.id].calificaciones.comprador_a_vendedor.calificacion
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">
                                {appointmentRatings[appointment.id].calificaciones.comprador_a_vendedor.calificacion}/5
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Pendiente</span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Rechazar Cita</h2>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                <p className="text-gray-700">¿Estás seguro de rechazar esta cita?</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explica por qué rechazas esta cita..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {rejectReason.length}/300 caracteres
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={rejectingId !== null}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectReason.trim() || rejectingId !== null}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    !rejectReason.trim() || rejectingId !== null
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {rejectingId !== null ? 'Rechazando...' : 'Rechazar Cita'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calificación */}
      {showRatingModal && ratingAppointment && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingAppointment(null);
          }}
          onSubmit={handleRatingSubmit}
          targetUser={{
            id: ratingAppointment.comprador_id,
            nombre: ratingAppointment.comprador_nombre || 'Comprador'
          }}
          ratingType="vendedor_a_comprador"
          productName={ratingAppointment.producto_nombre || 'Producto'}
        />
      )}
    </div>
  );
};

export default VendorAppointmentsPage;