import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, Phone, Package, DollarSign, Calendar, CheckCircle, AlertCircle, XCircle, Star } from 'lucide-react';
import { appointmentApi, Appointment } from '../api/Appointment';
import { ratingApi, CreateRatingRequest } from '../api/Rating';
import { getRatingsWithAppointmentDetails } from '../api/ratings';
import { showToast } from './Toast';
import RatingModal from './RatingModal';
import RatingDisplay, { RatingSummary } from './RatingDisplay';
import { useAuthContext } from '../contexts/AuthContext';

interface MyAppointmentsPageProps {
}

const MyAppointmentsPage: React.FC<MyAppointmentsPageProps> = () => {
  const { user: currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
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
      const response = await appointmentApi.getBuyerAppointments(userId, filter || undefined);

      console.log('fetchAppointments (buyer) response:', { success: response.success, dataLength: response.data?.length });
      if (response.data && response.data.length > 0) {
        console.log('First appointment structure:', response.data[0]);
        console.log('First appointment fecha_cita:', { value: response.data[0].fecha_cita, type: typeof response.data[0].fecha_cita });
      }

      if (response.success) {
        setAppointments(response.data);
      } else {
        showToast(response.error || 'Error al cargar mis citas', 'error');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error al cargar mis citas:', error);
      showToast('Error al cargar mis citas', 'error');
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

  // Función para abrir modal de calificación
  const handleRateVendor = (appointment: Appointment) => {
    setRatingAppointment(appointment);
    setShowRatingModal(true);
  };

  // Función para enviar calificación
  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!ratingAppointment) return;

    const ratingData: CreateRatingRequest = {
      producto_id: ratingAppointment.producto_id,
      agendamiento_id: ratingAppointment.id,
      calificador_id: parseInt(currentUser.id.toString()),
      calificado_id: ratingAppointment.vendedor_id,
      tipo_calificacion: 'comprador_a_vendedor',
      calificacion: rating,
      comentario: comment || undefined
    };

    try {
      await ratingApi.createRating(ratingData);
      setShowRatingModal(false);
      setRatingAppointment(null);
      // Recargar citas para actualizar estado
      fetchAppointments();
    } catch (error: any) {
      throw error; // El modal manejará el error
    }
  };

  const getStatusConfig = (estado: string) => {
    const statusConfig = {
      agendado: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Esperando Confirmación',
        icon: AlertCircle,
        description: 'El vendedor aún no ha confirmado tu cita'
      },
      confirmado: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Confirmado',
        icon: CheckCircle,
        description: 'Cita confirmada - Prepárate para el encuentro'
      },
      completado: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Completado',
        icon: CheckCircle,
        description: 'Intercambio realizado exitosamente'
      },
      cancelado: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Cancelado',
        icon: XCircle,
        description: 'Esta cita ha sido cancelada'
      }
    };

    return statusConfig[estado as keyof typeof statusConfig] || statusConfig.agendado;
  };

  const getStatusBadge = (estado: string) => {
    const config = getStatusConfig(estado);
    const IconComponent = config.icon;

    return (
      <div className={`px-3 py-2 text-sm font-medium rounded-lg border ${config.color} flex items-center`}>
        <IconComponent className="h-4 w-4 mr-2" />
        {config.label}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    // 🔴 LOG VISIBLE - Testing if code is deployed
    console.error('❌ TESTING formatDate called with:', dateString);

    // Validar que la fecha existe y está en formato correcto
    if (!dateString || typeof dateString !== 'string') {
      console.error('❌ formatDate: dateString is invalid', { dateString, type: typeof dateString });
      return 'Fecha no especificada';
    }

    // Parsear la fecha sin convertirla a UTC
    // dateString viene como "YYYY-MM-DD" del backend
    const parts = dateString.split('-');

    if (parts.length !== 3) {
      console.error('❌ formatDate: Invalid format - expected 3 parts, got:', { parts, inputValue: dateString });
      return 'Fecha inválida';
    }

    const [year, month, day] = parts.map(Number);

    // Validar que los números sean válidos
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
      console.error('❌ formatDate: Invalid numbers', { year, month, day, inputValue: dateString });
      return 'Fecha inválida';
    }

    const date = new Date(year, month - 1, day); // month es 0-indexed en Date

    // Validar que la fecha es válida
    if (isNaN(date.getTime())) {
      console.error('❌ formatDate: Invalid date object from input:', dateString);
      return 'Fecha inválida';
    }

    const formatted = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return formatted;
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  const isUpcoming = (dateString: string, timeString: string) => {
    // Validar que la fecha y hora existen
    if (!dateString || !timeString) {
      return false;
    }

    // Parsear la fecha sin convertirla a UTC
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      return false;
    }

    const [year, month, day] = parts.map(Number);

    // Validar que los números sean válidos
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
      return false;
    }

    const appointmentDate = new Date(year, month - 1, day);

    // Agregar la hora
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) {
      return false;
    }

    const [hours, minutes] = timeParts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    appointmentDate.setHours(hours, minutes, 0, 0);

    // Validar que la fecha es válida
    if (isNaN(appointmentDate.getTime())) {
      return false;
    }

    return appointmentDate > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mis citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
          <p className="mt-2 text-gray-600">Seguimiento de tus agendamientos y encuentros</p>
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
              Todas
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
              Confirmadas
            </button>
            <button
              onClick={() => setFilter('completado')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filter === 'completado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Completadas
            </button>
          </div>
        </div>

        {/* Lista de citas */}
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
            <p className="text-gray-600">
              {filter ? `No tienes citas ${filter === 'agendado' ? 'pendientes' : filter}` : 'Aún no has agendado ninguna cita'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Explora productos y agenda una cita con los vendedores
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {appointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.estado);
              const upcoming = isUpcoming(appointment.fecha_cita, appointment.hora_cita);

              return (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  {/* Header con producto y estado */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {appointment.producto_nombre}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Package className="h-4 w-4 mr-1" />
                        <span>ID: {appointment.producto_id}</span>
                      </div>
                    </div>
                    {getStatusBadge(appointment.estado)}
                  </div>

                  {/* Estado description */}
                  <div className="mb-4 text-sm text-gray-600">
                    {statusConfig.description}
                  </div>

                  {/* Información del vendedor */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-600 mr-2" />
                      <button
                        onClick={() => navigate(`/user/${appointment.vendedor_id}`)}
                        className="font-medium text-gray-900 hover:text-pink-600 hover:underline transition-colors"
                      >
                        {appointment.vendedor_nombre}
                      </button>
                    </div>
                    {appointment.vendedor_telefono && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-600">{appointment.vendedor_telefono}</span>
                      </div>
                    )}
                  </div>

                  {/* Fecha y hora */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">{formatDate(appointment.fecha_cita)}</span>
                      {upcoming && appointment.estado === 'confirmado' && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Próxima
                        </span>
                      )}
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

                  {/* Timeline de estados */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      Agendado: {new Date(appointment.fecha_agendamiento).toLocaleString('es-ES')}
                    </div>
                    {appointment.fecha_confirmacion && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Confirmado: {new Date(appointment.fecha_confirmacion).toLocaleString('es-ES')}
                      </div>
                    )}
                    {appointment.fecha_completado && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                        Completado: {new Date(appointment.fecha_completado).toLocaleString('es-ES')}
                      </div>
                    )}
                  </div>

                  {/* Información adicional según estado */}
                  {appointment.estado === 'agendado' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>Tip:</strong> El vendedor recibirá una notificación y podrá confirmar tu cita pronto.
                      </p>
                    </div>
                  )}

                  {appointment.estado === 'confirmado' && upcoming && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ <strong>¡Cita confirmada!</strong> No olvides llegar puntual al punto de encuentro.
                      </p>
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
                          {/* Calificación que dí al vendedor */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-xs text-blue-600 font-medium mb-1">Mi calificación al vendedor</div>
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
                              <button
                                onClick={() => handleRateVendor(appointment)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Calificar vendedor
                              </button>
                            )}
                          </div>

                          {/* Calificación que me dio el vendedor */}
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-xs text-green-600 font-medium mb-1">Calificación del vendedor</div>
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
                              <span className="text-sm text-gray-500">Pendiente</span>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            id: ratingAppointment.vendedor_id,
            nombre: ratingAppointment.vendedor_nombre || 'Vendedor'
          }}
          ratingType="comprador_a_vendedor"
          productName={ratingAppointment.producto_nombre || 'Producto'}
        />
      )}
    </div>
  );
};

export default MyAppointmentsPage;