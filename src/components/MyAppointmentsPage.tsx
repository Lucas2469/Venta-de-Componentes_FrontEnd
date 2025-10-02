import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, Phone, Package, DollarSign, Calendar, CheckCircle, AlertCircle, XCircle, Star } from 'lucide-react';
import { appointmentApi, Appointment } from '../api/Appointment';
import { ratingApi, CreateRatingRequest } from '../api/Rating';
import { showToast } from './Toast';
import RatingModal from './RatingModal';

interface MyAppointmentsPageProps {
  currentUser: {
    id: number;
    nombre?: string;
    name?: string;
    tipo_usuario?: string;
    role?: string;
  };
}

const MyAppointmentsPage: React.FC<MyAppointmentsPageProps> = ({ currentUser }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

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
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  const isUpcoming = (dateString: string, timeString: string) => {
    const appointmentDate = new Date(`${dateString}T${timeString}`);
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
                      <span className="font-medium text-gray-900">{appointment.vendedor_nombre}</span>
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

                  {/* Precio */}
                  <div className="mb-4 flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-lg font-semibold text-green-600">
                      Bs {appointment.producto_precio ? Number(appointment.producto_precio).toFixed(2) : '0.00'}
                    </span>
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

                  {appointment.estado === 'completado' && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => handleRateVendor(appointment)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Calificar al Vendedor
                      </button>
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