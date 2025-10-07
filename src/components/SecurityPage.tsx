import React from "react";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Users, MapPin, CreditCard } from "lucide-react";

interface SecurityPageProps {
  onNavigate: (page: string) => void;
}

export function SecurityPage({ onNavigate }: SecurityPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-pink-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Seguridad en ELECTROMARKET
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tu seguridad es nuestra prioridad. Conoce las medidas que implementamos para protegerte.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Puntos de Encuentro Seguros */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-pink-100 p-3 rounded-xl">
                <MapPin className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Puntos de Encuentro Seguros
                </h2>
                <p className="text-gray-600 mb-4">
                  Solo permitimos encuentros en lugares públicos y seguros previamente verificados:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Lugares públicos:</strong> Centros comerciales, plazas principales, cafeterías reconocidas
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Horarios diurnos:</strong> Recomendamos encuentros entre 8:00 AM y 8:00 PM
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Zonas verificadas:</strong> Solo puedes agendar en puntos de encuentro aprobados por ELECTROMARKET
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sistema de Calificaciones */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Sistema de Calificaciones Bidireccional
                </h2>
                <p className="text-gray-600 mb-4">
                  Compradores y vendedores se califican mutuamente después de cada transacción:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Calificaciones verificadas:</strong> Solo usuarios con transacciones completadas pueden calificar
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Historial público:</strong> Revisa la reputación de otros usuarios antes de comprar o vender
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Retroalimentación honesta:</strong> Ayuda a la comunidad compartiendo tu experiencia
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Protección de Datos */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-pink-100 p-3 rounded-xl">
                <Lock className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Protección de Datos Personales
                </h2>
                <p className="text-gray-600 mb-4">
                  Cumplimos con las mejores prácticas de seguridad:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Encriptación de contraseñas:</strong> Usamos SHA-256 para proteger tus credenciales
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>No compartimos datos:</strong> Tu información personal nunca se vende a terceros
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Control de privacidad:</strong> Decides qué información es visible públicamente
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sistema de Créditos */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-purple-100 p-3 rounded-xl">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Sistema de Créditos Seguro
                </h2>
                <p className="text-gray-600 mb-4">
                  Los créditos evitan transacciones directas de dinero entre usuarios:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Compra verificada:</strong> Administradores revisan cada compra de créditos antes de aprobarla
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Sin transacciones directas:</strong> Los usuarios nunca intercambian dinero entre sí
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Historial completo:</strong> Auditoría completa de todos los movimientos de créditos
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Consejos de Seguridad */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-amber-200">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Consejos de Seguridad
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 font-bold">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Nunca compartas tu contraseña</strong> con nadie, ni siquiera con administradores
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 font-bold">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Revisa el perfil del vendedor</strong> antes de agendar una cita (calificaciones, transacciones)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 font-bold">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Lleva un acompañante</strong> a encuentros con personas nuevas
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 font-bold">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Inspecciona el producto</strong> antes de completar la transacción
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 font-bold">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Reporta comportamientos sospechosos</strong> a nuestro equipo de soporte
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Reportar Problemas */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
            <div className="flex items-start space-x-4">
              <div className="bg-pink-100 p-3 rounded-xl">
                <Eye className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  ¿Detectaste algo sospechoso?
                </h2>
                <p className="text-gray-600 mb-4">
                  Tu seguridad es nuestra prioridad. Si detectas comportamientos sospechosos, reporta inmediatamente:
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => onNavigate('help')}
                    className="bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    Reportar un Problema
                  </button>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Volver al Catálogo
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
