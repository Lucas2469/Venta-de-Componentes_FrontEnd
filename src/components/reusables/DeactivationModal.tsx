import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export interface DeactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (titulo: string, mensaje: string) => Promise<void>;
  productName: string;
  vendorName: string;
  isLoading?: boolean;
}

export const DeactivationModal: React.FC<DeactivationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  vendorName,
  isLoading = false
}) => {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errors, setErrors] = useState<{titulo?: string; mensaje?: string}>({});

  // Limpiar formulario cuando se abre el modal y prellenar título con nombre del producto
  React.useEffect(() => {
    if (isOpen) {
      setTitulo(`Desactivación de Producto: ${productName}`); // Pre-llenado automático con nombre del producto
      setMensaje('');
      setErrors({});
    }
  }, [isOpen, productName]);

  const validateForm = (): boolean => {
    const newErrors: {titulo?: string; mensaje?: string} = {};

    if (!titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (titulo.trim().length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }

    if (!mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio';
    } else if (mensaje.trim().length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onConfirm(titulo.trim(), mensaje.trim());
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Desactivar Producto</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Producto a desactivar:</h4>
            <p className="text-gray-700 font-medium">{productName}</p>
            <p className="text-sm text-gray-600 mt-1">Vendedor: {vendorName}</p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm">
              <strong>⚠️ Importante:</strong> Al desactivar este producto, se enviará una notificación
              al vendedor explicando el motivo. El producto dejará de aparecer en el catálogo público.
            </p>
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
              Mensaje explicativo *
            </label>
            <textarea
              id="mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={isLoading}
              placeholder="Explique detalladamente el motivo de la desactivación del producto..."
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none ${
                errors.mensaje ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              maxLength={500}
            />
            {errors.mensaje && (
              <p className="text-red-600 text-sm mt-1">{errors.mensaje}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">{mensaje.length}/500 caracteres</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !titulo.trim() || !mensaje.trim()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Desactivando...</span>
                </>
              ) : (
                <span>Desactivar Producto</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};