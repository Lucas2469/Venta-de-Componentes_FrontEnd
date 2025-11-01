import React, { useState, useEffect, useCallback } from 'react';
import RatingModal from './RatingModal';
import { getPendingRatings, createRating, checkPendingRatingsAlert, PendingRating } from '../api/ratings';
import { showToast } from './Toast';
import { Bell } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

interface RatingSystemManagerProps {
  isActive: boolean; // Para pausar/activar el sistema
}

const RatingSystemManager: React.FC<RatingSystemManagerProps> = ({
  isActive = true
}) => {
  const { user } = useAuthContext();
  const currentUserId = user?.id || 0;
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentRating, setCurrentRating] = useState<PendingRating | null>(null);
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  const [pendingAlert, setPendingAlert] = useState<{
    hasPendingRatings: boolean;
    count: number;
    oldestMinutes: number;
  }>({ hasPendingRatings: false, count: 0, oldestMinutes: 0 });
  const [showPendingAlert, setShowPendingAlert] = useState(false);

  // Cargar calificaciones pendientes
  const loadPendingRatings = useCallback(async () => {
    if (!isActive || !currentUserId) return;

    try {
      console.log('🔄 Cargando calificaciones pendientes para usuario:', currentUserId);
      const ratings = await getPendingRatings(currentUserId);
      console.log(`📊 Calificaciones pendientes encontradas: ${ratings.length}`);
      setPendingRatings(ratings);

      // Si hay calificaciones pendientes, mostrar la primera automáticamente SOLO si no hay modal abierto
      if (ratings.length > 0 && !showRatingModal && !currentRating) {
        const firstPending = ratings[0];
        console.log('📝 Primera calificación pendiente:', {
          agendamiento_id: firstPending.agendamiento_id,
          producto: firstPending.producto_nombre,
          minutes_since_meeting: firstPending.minutes_since_meeting
        });

        // Solo mostrar si han pasado más de 0 minutos (para pruebas - originalmente 20 min)
        if (firstPending.minutes_since_meeting >= 0) {
          console.log('✅ Mostrando modal de calificación automáticamente');
          setCurrentRating(firstPending);
          setShowRatingModal(true);
        }
      } else if (showRatingModal) {
        console.log('⏸️ Ya hay un modal abierto, no se muestra otro');
      }
    } catch (error) {
      console.error('❌ Error loading pending ratings:', error);
    }
  }, [currentUserId, isActive, showRatingModal, currentRating]);

  // Verificar alertas de calificaciones pendientes
  const checkAlerts = useCallback(async () => {
    if (!isActive || !currentUserId) return;

    try {
      const alert = await checkPendingRatingsAlert(currentUserId);
      setPendingAlert(alert);

      // Mostrar alerta visual si hay calificaciones muy antiguas (más de 1 hora)
      if (alert.hasPendingRatings && alert.oldestMinutes > 60) {
        setShowPendingAlert(true);
      }
    } catch (error) {
      console.error('Error checking rating alerts:', error);
    }
  }, [currentUserId, isActive]);

  // Efecto para cargar datos periódicamente
  useEffect(() => {
    if (!isActive) return;

    // Cargar inmediatamente al montar
    loadPendingRatings();
    checkAlerts();

    // Configurar intervalo para verificar cada 30 segundos (en lugar de 2 minutos)
    // Esto asegura que el modal aparezca casi inmediatamente cuando llega la hora de la cita
    const interval = setInterval(() => {
      loadPendingRatings();
      checkAlerts();
    }, 30 * 1000); // 30 segundos (antes era 2 * 60 * 1000)

    return () => clearInterval(interval);
  }, [loadPendingRatings, checkAlerts, isActive]);

  // Manejar envío de calificación
  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!currentRating) return;

    try {
      // Determinar el tipo de calificación basado en quien puede calificar
      const isVendorRating = currentRating.can_rate_buyer && currentUserId === currentRating.vendedor_id;
      const tipoCalificacion: 'vendedor_a_comprador' | 'comprador_a_vendedor' = isVendorRating ? 'vendedor_a_comprador' : 'comprador_a_vendedor';
      const calificadoId = isVendorRating ? currentRating.comprador_id : currentRating.vendedor_id;

      const ratingData = {
        producto_id: currentRating.producto_id,
        agendamiento_id: currentRating.agendamiento_id,
        calificador_id: currentUserId,
        calificado_id: calificadoId,
        tipo_calificacion: tipoCalificacion,
        calificacion: rating,
        comentario: comment || null,
      };

      console.log('📤 Enviando calificación:', ratingData);
      await createRating(ratingData);
      console.log('✅ Calificación enviada exitosamente');

      // Eliminar el agendamiento actual de la lista de pendientes INMEDIATAMENTE
      const currentAgendamientoId = currentRating.agendamiento_id;
      setPendingRatings(prevPendings =>
        prevPendings.filter(r => r.agendamiento_id !== currentAgendamientoId)
      );

      showToast('success', 'Calificación enviada', 'Gracias por tu calificación');

      // Cerrar el modal actual
      setShowRatingModal(false);
      setCurrentRating(null);

      // Recargar calificaciones pendientes después de un delay
      setTimeout(() => {
        loadPendingRatings();
        checkAlerts();
      }, 1000);

    } catch (error: any) {
      console.error('❌ Error submitting rating:', error);
      console.error('📋 Error details:', error.response?.data);

      // Obtener mensaje específico del backend
      const backendMessage = error.response?.data?.message || 'Error al enviar la calificación';

      // Si ya calificó, mostrar mensaje específico
      if (backendMessage.includes('Ya has calificado')) {
        showToast('warning', 'Ya calificado', 'Ya has enviado tu calificación para este encuentro');

        // Eliminar de la lista de pendientes si ya calificó
        const currentAgendamientoId = currentRating.agendamiento_id;
        setPendingRatings(prevPendings =>
          prevPendings.filter(r => r.agendamiento_id !== currentAgendamientoId)
        );

        // Cerrar el modal
        setShowRatingModal(false);
        setCurrentRating(null);

        // Recargar pendientes para actualizar la lista
        setTimeout(() => {
          loadPendingRatings();
          checkAlerts();
        }, 500);
      } else {
        showToast('error', 'Error', backendMessage);
      }

      throw error;
    }
  };

  // Manejar cierre del modal
  const handleCloseModal = () => {
    console.log('🚪 Cerrando modal de calificación (cancelado por usuario)');
    setShowRatingModal(false);
    setCurrentRating(null);

    // NOTA: Ya NO mostramos automáticamente el siguiente modal
    // El usuario puede hacer refresh o esperar el próximo intervalo (2 min)
    // Esto evita abrumar al usuario con múltiples modales
  };

  // Función para abrir manualmente la calificación de un agendamiento específico
  const openRatingFor = (agendamientoId: number) => {
    const rating = pendingRatings.find(r => r.agendamiento_id === agendamientoId);
    if (rating) {
      setCurrentRating(rating);
      setShowRatingModal(true);
    }
  };

  // Componente de alerta para calificaciones pendientes
  const PendingRatingsAlert = () => {
    if (!showPendingAlert || !pendingAlert.hasPendingRatings) return null;

    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 shadow-lg z-50 max-w-sm">
        <div className="flex items-start">
          <Bell className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800">
              Calificaciones Pendientes
            </h4>
            <p className="text-xs text-yellow-700 mt-1">
              Tienes {pendingAlert.count} calificación{pendingAlert.count !== 1 ? 'es' : ''} pendiente{pendingAlert.count !== 1 ? 's' : ''}.
              La más antigua es de hace {Math.floor(pendingAlert.oldestMinutes / 60)} hora{Math.floor(pendingAlert.oldestMinutes / 60) !== 1 ? 's' : ''}.
            </p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  if (pendingRatings.length > 0) {
                    setCurrentRating(pendingRatings[0]);
                    setShowRatingModal(true);
                  }
                  setShowPendingAlert(false);
                }}
                className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
              >
                Calificar Ahora
              </button>
              <button
                onClick={() => setShowPendingAlert(false)}
                className="text-xs text-yellow-600 hover:text-yellow-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Alerta de calificaciones pendientes */}
      <PendingRatingsAlert />

      {/* Modal de calificación */}
      {showRatingModal && currentRating && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={handleCloseModal}
          onSubmit={handleRatingSubmit}
          targetUser={{
            id: currentRating.can_rate_buyer ? currentRating.comprador_id : currentRating.vendedor_id,
            nombre: currentRating.can_rate_buyer ? currentRating.comprador_nombre : currentRating.vendedor_nombre
          }}
          ratingType={currentRating.can_rate_buyer ? 'vendedor_a_comprador' : 'comprador_a_vendedor'}
          productName={currentRating.producto_nombre}
          fechaCita={currentRating.fecha_cita}
          horaCita={currentRating.hora_cita}
        />
      )}
    </>
  );
};

export default RatingSystemManager;