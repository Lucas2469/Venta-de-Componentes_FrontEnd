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
      const ratings = await getPendingRatings(currentUserId);
      setPendingRatings(ratings);

      // Si hay calificaciones pendientes, mostrar la primera automáticamente
      if (ratings.length > 0 && !showRatingModal) {
        const firstPending = ratings[0];
        // Solo mostrar si han pasado más de 0 minutos (para pruebas - originalmente 20 min)
        if (firstPending.minutes_since_meeting >= 0) {
          setCurrentRating(firstPending);
          setShowRatingModal(true);
        }
      }
    } catch (error) {
      console.error('Error loading pending ratings:', error);
    }
  }, [currentUserId, isActive, showRatingModal]);

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

    // Cargar inmediatamente
    loadPendingRatings();
    checkAlerts();

    // Configurar intervalo para verificar cada 2 minutos
    const interval = setInterval(() => {
      loadPendingRatings();
      checkAlerts();
    }, 2 * 60 * 1000); // 2 minutos

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

      await createRating(ratingData);

      showToast('success', 'Calificación enviada', 'Gracias por tu calificación');

      // Recargar calificaciones pendientes
      setTimeout(() => {
        loadPendingRatings();
        checkAlerts();
      }, 1000);

    } catch (error: any) {
      console.error('Error submitting rating:', error);
      const message = error.response?.data?.message || 'Error al enviar la calificación';
      showToast('error', 'Error', message);
      throw error;
    }
  };

  // Manejar cierre del modal
  const handleCloseModal = () => {
    setShowRatingModal(false);
    setCurrentRating(null);

    // Si hay más calificaciones pendientes, mostrar la siguiente después de un delay
    setTimeout(() => {
      const remainingRatings = pendingRatings.filter(r => r.agendamiento_id !== currentRating?.agendamiento_id);
      if (remainingRatings.length > 0) {
        const nextRating = remainingRatings[0];
        if (nextRating.minutes_since_meeting >= 20) {
          setCurrentRating(nextRating);
          setShowRatingModal(true);
        }
      }
    }, 5000); // Esperar 5 segundos antes de mostrar la siguiente
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
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 shadow-lg z-40 max-w-sm">
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
        />
      )}
    </>
  );
};

export default RatingSystemManager;