import React from 'react';
import { AlertTriangle, CheckCircle, X, AlertCircle, Info } from 'lucide-react';

export type ModalType = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  loading = false
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
          iconBg: 'bg-red-100',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          titleColor: 'text-red-900'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-8 w-8 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          titleColor: 'text-yellow-900'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          iconBg: 'bg-green-100',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          titleColor: 'text-green-900'
        };
      case 'info':
        return {
          icon: <Info className="h-8 w-8 text-blue-600" />,
          iconBg: 'bg-blue-100',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          titleColor: 'text-blue-900'
        };
      default:
        return {
          icon: <AlertCircle className="h-8 w-8 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          titleColor: 'text-yellow-900'
        };
    }
  };

  const { icon, iconBg, confirmBg, titleColor } = getIconAndColors();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200 scale-100">
        {/* Header con icono */}
        <div className="p-6 pb-4">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${titleColor} mb-2`}>
                {title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-3 p-6 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2 text-sm font-medium text-white ${confirmBg} rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};