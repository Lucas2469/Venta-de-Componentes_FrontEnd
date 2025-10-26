import React, { useState, useEffect } from "react";
import axios from "axios";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "./Toast";

const API_BASE = import.meta.env.VITE_API_URL;

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void;
  token?: string;
}

export function ResetPasswordPage({ onNavigate, token }: ResetPasswordPageProps) {
  const { showToast, ToastComponent } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [resetToken, setResetToken] = useState(token || "");

  useEffect(() => {
    // Obtener token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      setResetToken(urlToken);
    } else if (!token) {
      setTokenError(true);
      showToast('error', 'Error', 'Token de recuperación no válido');
    }
  }, [token]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Mínimo 6 caracteres');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      showToast('error', 'Error', 'Token de recuperación no válido');
      return;
    }

    if (!newPassword || !confirmPassword) {
      showToast('error', 'Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'Error', 'Las contraseñas no coinciden');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      showToast('error', 'Contraseña inválida', passwordErrors.join(', '));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token: resetToken,
        newPassword
      });

      if (response.data.success) {
        setPasswordChanged(true);
        showToast('success', 'Contraseña actualizada', 'Ya puedes iniciar sesión');

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          onNavigate('login');
        }, 3000);
      } else {
        showToast('error', 'Error', response.data.error || 'No se pudo actualizar la contraseña');
      }
    } catch (error: any) {
      console.error('Error en reset password:', error);

      if (error.response?.data?.error) {
        showToast('error', 'Error', error.response.data.error);

        // Si el token expiró o es inválido, mostrar error
        if (error.response.data.error.includes('expirado') || error.response.data.error.includes('inválido')) {
          setTokenError(true);
        }
      } else {
        showToast('error', 'Error', 'No se pudo actualizar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50 flex items-center justify-center p-4">
        <ToastComponent />

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Enlace inválido o expirado
            </h1>

            <p className="text-gray-600 mb-6">
              El enlace de recuperación no es válido o ha expirado. Los enlaces de recuperación solo son válidos por 1 hora.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => onNavigate('forgot-password')}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium"
              >
                Solicitar nuevo enlace
              </button>

              <button
                onClick={() => onNavigate('login')}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (passwordChanged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50 flex items-center justify-center p-4">
        <ToastComponent />

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Contraseña actualizada!
            </h1>

            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido cambiada exitosamente. Redirigiendo al login...
            </p>

            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium"
            >
              Ir al login ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50 flex items-center justify-center p-4">
      <ToastComponent />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-4">
              <Lock className="h-8 w-8 text-pink-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nueva contraseña
            </h1>
            <p className="text-gray-600">
              Ingresa tu nueva contraseña segura
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Requisitos de contraseña */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Requisitos de la contraseña:</strong>
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Mínimo 6 caracteres</li>
                <li>Usa una contraseña única y segura</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Actualizando...</span>
                </div>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>
            ¿Recordaste tu contraseña?{" "}
            <button
              onClick={() => onNavigate('login')}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
