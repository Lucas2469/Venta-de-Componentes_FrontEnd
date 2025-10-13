import React, { useState } from "react";
import axios from "axios";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { useToast } from "./Toast";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { showToast, ToastComponent } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast('error', 'Error', 'Por favor ingresa tu email');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('error', 'Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: email.toLowerCase().trim()
      });

      if (response.data.success) {
        setEmailSent(true);
        showToast('success', 'Email enviado', 'Revisa tu bandeja de entrada');
      } else {
        showToast('error', 'Error', response.data.error || 'No se pudo enviar el email');
      }
    } catch (error: any) {
      console.error('Error en forgot password:', error);
      // Mostrar mensaje genérico por seguridad
      setEmailSent(true);
      showToast('info', 'Solicitud procesada', 'Si el email existe, recibirás un correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50 flex items-center justify-center p-4">
      <ToastComponent />

      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => onNavigate('login')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al login</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!emailSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-pink-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-gray-600">
                  No te preocupes, te enviaremos un enlace para recuperarla
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Enviar enlace de recuperación</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success message */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Revisa tu email!
                </h1>
                <p className="text-gray-600 mb-6">
                  Si el email <strong>{email}</strong> existe en nuestro sistema, recibirás un correo con instrucciones para recuperar tu contraseña.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>¿No recibes el correo?</strong>
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Revisa tu carpeta de spam o correo no deseado</li>
                    <li>Verifica que el email sea correcto</li>
                    <li>El enlace expira en 1 hora</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Intentar con otro email
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className="w-full mt-3 text-pink-600 hover:text-pink-700 py-3 font-medium"
                >
                  Volver al login
                </button>
              </div>
            </>
          )}
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
