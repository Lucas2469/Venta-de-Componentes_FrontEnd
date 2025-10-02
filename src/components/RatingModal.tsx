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
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetUser,
  ratingType,
  productName
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      // Reset form
      setRating(0);
      setComment('');
      onClose();
      showToast('success', 'Calificación enviada', 'Gracias por tu calificación');
    } catch (error) {
      showToast('error', 'Error', 'No se pudo enviar la calificación');
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
          <p className="text-sm text-gray-600 mt-2">
            Producto: <span className="font-medium">{productName}</span>
          </p>
          <p className="text-sm text-gray-600">
            {ratingType === 'comprador_a_vendedor' ? 'Vendedor' : 'Comprador'}: <span className="font-medium">{targetUser.nombre}</span>
          </p>
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