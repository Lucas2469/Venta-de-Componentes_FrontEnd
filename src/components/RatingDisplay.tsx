import React from 'react';
import { Star, MessageCircle } from 'lucide-react';

interface Rating {
  id: number;
  calificacion: number;
  comentario: string | null;
  fecha_comentario: string;
  calificador_nombre: string;
  calificador_apellido: string;
  tipo_calificacion: 'comprador_a_vendedor' | 'vendedor_a_comprador';
}

interface RatingDisplayProps {
  ratings: Rating[];
  currentUserRole: 'comprador' | 'vendedor';
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  ratings,
  currentUserRole,
  className = ''
}) => {
  // Filtrar calificaciones según el rol del usuario actual
  const relevantRatings = ratings.filter(rating => {
    if (currentUserRole === 'comprador') {
      // Si soy comprador, mostrar calificaciones que me dieron los vendedores
      return rating.tipo_calificacion === 'vendedor_a_comprador';
    } else {
      // Si soy vendedor, mostrar calificaciones que me dieron los compradores
      return rating.tipo_calificacion === 'comprador_a_vendedor';
    }
  });

  // Componente para mostrar estrellas
  const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'h-4 w-4' }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium text-gray-700 ml-2">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Obtener texto descriptivo de la calificación
  const getRatingText = (rating: number) => {
    if (rating === 5) return 'Excelente';
    if (rating === 4) return 'Bueno';
    if (rating === 3) return 'Regular';
    if (rating === 2) return 'Malo';
    if (rating === 1) return 'Muy malo';
    return '';
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (relevantRatings.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <Star className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-sm text-gray-600">
          Aún no hay calificaciones
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 flex items-center">
        <Star className="h-4 w-4 mr-2 text-yellow-400" />
        Calificaciones Recibidas ({relevantRatings.length})
      </h4>

      {relevantRatings.map((rating) => (
        <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Header de la calificación */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <StarRating rating={rating.calificacion} />
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getRatingText(rating.calificacion)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Por <span className="font-medium">
                  {rating.calificador_nombre} {rating.calificador_apellido}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {formatDate(rating.fecha_comentario)}
              </p>
            </div>
          </div>

          {/* Comentario si existe */}
          {rating.comentario && (
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <div className="flex items-start">
                <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  "{rating.comentario}"
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Componente para mostrar resumen de calificaciones
export const RatingSummary: React.FC<{
  averageRating: number | string | null | undefined;
  totalRatings: number;
  className?: string;
}> = ({ averageRating, totalRatings, className = '' }) => {
  // Convertir y validar averageRating
  const numericRating = (() => {
    if (typeof averageRating === 'number' && !isNaN(averageRating)) {
      return averageRating;
    }
    if (typeof averageRating === 'string') {
      const parsed = parseFloat(averageRating);
      return !isNaN(parsed) ? parsed : 0;
    }
    return 0;
  })();

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Calificación Promedio
          </h3>
          <div className="flex items-center space-x-3">
            <StarRating rating={numericRating} />
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {numericRating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">
                {totalRatings} calificación{totalRatings !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingDisplay;