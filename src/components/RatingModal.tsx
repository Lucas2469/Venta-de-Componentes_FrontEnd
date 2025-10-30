import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { showToast } from './Toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  targetUser: {
    id: number;
    nombre: string;
  };
  ratingType: 'comprador_a_vendedor' | 'vendedor_a_comprador';
  productName: string;
  fechaCita: string;
  horaCita: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetUser,
  ratingType,
  productName,
  fechaCita,
  horaCita
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para convertir fecha UTC a LOCAL (Bolivia UTC-4)
  const getLocalDate = (dateString: any) => {
    try {
      if (!dateString) return new Date();

      // Si es un Date object, convertir a string ISO
      let dateStr = dateString;
      if (dateString instanceof Date) {
        dateStr = dateString.toISOString().split('T')[0]; // Convertir a YYYY-MM-DD
      } else if (typeof dateString === 'string' && dateString.includes('T')) {
        // Si es ISO format (2025-10-30T00:00:00.000Z), extraer solo la parte de fecha
        dateStr = dateString.split('T')[0]; // Convertir a YYYY-MM-DD
      }

      // Parse the date string (YYYY-MM-DD)
      const parts = dateStr.split('-').map(Number);
      if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
        // Validación fallida, retornar fecha actual sin error
        return new Date();
      }

      const [year, month, day] = parts;

      // La fecha ya está en LOCAL en la BD, simplemente crear un Date object
      // 2025-10-30 en BD = 2025-10-30 en LOCAL
      const localDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      return localDate;
    } catch (error) {
      // Error al parsear, retornar fecha actual sin error
      return new Date();
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('error', 'Calificación requerida', 'Debes seleccionar al menos una estrella');
      return;
    }

    if (isSubmitting) {
      console.log('⏸️ Ya se está enviando una calificación, ignorando clic adicional');
      return; // Prevenir doble envío
    }

    setIsSubmitting(true);
    try {
      console.log('📤 Enviando calificación desde modal:', { rating, comment });
      await onSubmit(rating, comment);
      // Reset form SOLO SI fue exitoso
      setRating(0);
      setComment('');
      // NO llamar a showToast aquí, ya se hace en RatingSystemManager
    } catch (error) {
      console.error('❌ Error en handleSubmit del modal:', error);
      // NO mostrar toast aquí, ya se maneja en RatingSystemManager
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return 'Selecciona una calificación';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Calificar {ratingType === 'comprador_a_vendedor' ? 'Vendedor' : 'Comprador'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Producto:</span> {productName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">{ratingType === 'comprador_a_vendedor' ? 'Vendedor' : 'Comprador'}:</span> {targetUser.nombre}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Fecha del encuentro:</span> {getLocalDate(fechaCita).toLocaleDateString('es-BO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Hora:</span> {horaCita}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Rating Stars */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              ¿Cómo fue tu experiencia? <span className="text-red-500">*</span>
            </p>
            <div className="flex justify-center space-x-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="p-1 transition-all duration-200 transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-600">
              {getRatingText(hoveredRating || rating)}
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia con otros usuarios..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                rating === 0 || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;