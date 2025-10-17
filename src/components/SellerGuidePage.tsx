import React, { useState } from "react";
import {
  BookOpen,
  CreditCard,
  Clock,
  Package,
  Calendar,
  Star,
  Shield,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface SellerGuidePageProps {
  onNavigate: (page: string) => void;
}

export function SellerGuidePage({ onNavigate }: SellerGuidePageProps) {
  const [activeSection, setActiveSection] = useState<string | null>("start");

  const sections = [
    {
      id: "start",
      title: "Cómo empezar a vender",
      icon: TrendingUp,
      color: "pink",
      content: [
        {
          step: "1",
          title: "Compra créditos",
          description: "Para publicar productos necesitas créditos. 1 crédito = 1 unidad de stock. Ve a 'Comprar Créditos', selecciona un pack, sube tu comprobante de pago (transferencia/depósito) y espera la aprobación (máximo 24 horas).",
          tip: "💡 Tip: Compra packs grandes para ahorrar. Los créditos nunca vencen."
        },
        {
          step: "2",
          title: "Configura tus horarios de atención",
          description: "Ve a 'Mis Horarios' y establece los días y horas en que estarás disponible para encuentros. Los compradores SOLO podrán agendar dentro de estos horarios. Puedes tener múltiples bloques por día (ej: 9:00-12:00 y 14:00-18:00).",
          tip: "⚠️ Importante: Sin horarios configurados, nadie podrá agendar citas contigo."
        },
        {
          step: "3",
          title: "Crea tu primer anuncio",
          description: "Ve a 'Crear Anuncio', completa todos los campos (nombre, descripción, precio, stock, categoría), selecciona un punto de encuentro seguro y publica. Los créditos se descontarán inmediatamente según el stock que publiques.",
          tip: "🚨 Revisa TODO antes de publicar: NO puedes editar después. Si quieres cambiar algo, deberás eliminar el anuncio y volver a crearlo (gastando créditos nuevamente)."
        },
        {
          step: "4",
          title: "Espera agendamientos",
          description: "Los compradores verán tu anuncio en el catálogo y podrán agendar citas. Recibirás notificaciones por cada solicitud de agendamiento. Revisa la solicitud y confírmala si puedes cumplir con la cita.",
          tip: "✅ Responde rápido: Los compradores valoran vendedores que confirman pronto."
        }
      ]
    },
    {
      id: "credits",
      title: "Sistema de Créditos",
      icon: CreditCard,
      color: "purple",
      content: [
        {
          step: "💰",
          title: "¿Cuántos créditos necesito?",
          description: "Necesitas 1 crédito por cada unidad de stock. Ejemplo: Si quieres publicar 15 Arduinos, necesitas 15 créditos. Si publicas 5 resistencias y 10 LEDs en anuncios separados, necesitas 15 créditos en total.",
          tip: ""
        },
        {
          step: "📦",
          title: "Packs disponibles",
          description: "Pack Básico: 10 créditos (Bs. 50) | Pack Estándar: 25 créditos (Bs. 100) | Pack Pro: 50 créditos (Bs. 175) | Pack Premium: 100 créditos (Bs. 300). Mientras más compras, más ahorras.",
          tip: "💡 Los packs grandes tienen mejor precio por crédito."
        },
        {
          step: "⏳",
          title: "Proceso de aprobación",
          description: "Un administrador revisará manualmente tu comprobante de pago. Las compras se aprueban generalmente en menos de 24 horas. Recibirás una notificación cuando se apruebe o rechace (con motivo si es rechazada).",
          tip: "📸 Asegúrate de que el comprobante sea legible y muestre claramente el monto."
        },
        {
          step: "♾️",
          title: "Los créditos NO vencen",
          description: "Una vez acreditados en tu cuenta, los créditos permanecen disponibles indefinidamente. Úsalos cuando quieras sin preocuparte por fechas de expiración.",
          tip: ""
        }
      ]
    },
    {
      id: "appointments",
      title: "Gestión de Agendamientos",
      icon: Calendar,
      color: "teal",
      content: [
        {
          step: "🔔",
          title: "Notificaciones de agendamiento",
          description: "Cuando un comprador agenda una cita contigo, recibirás una notificación inmediata. Ve a 'Mis Citas como Vendedor' para ver los detalles: producto, cantidad, fecha, hora, punto de encuentro y datos del comprador.",
          tip: ""
        },
        {
          step: "✅",
          title: "Confirmar agendamientos = descuenta stock",
          description: "IMPORTANTE: El stock de tu producto se descuenta SOLO cuando CONFIRMAS el agendamiento, no cuando el comprador lo agenda. Esto te permite revisar cada solicitud antes de comprometer tu inventario. Confirma solo si estás seguro de poder cumplir.",
          tip: "⚠️ Una vez confirmado, el stock NO se puede restaurar automáticamente."
        },
        {
          step: "⏰",
          title: "Cancelación automática",
          description: "Si NO confirmas un agendamiento antes de la fecha y hora programada, el sistema lo CANCELA AUTOMÁTICAMENTE cada hora. El comprador recibe una notificación de la cancelación automática. Esto protege a los compradores de vendedores inactivos.",
          tip: "🚨 Revisa tus notificaciones frecuentemente para no perder ventas."
        },
        {
          step: "✔️",
          title: "Marcar como completado",
          description: "Después del encuentro exitoso, marca la transacción como 'Completado' en 'Mis Citas como Vendedor'. Esto permite que ambos (vendedor y comprador) se califiquen mutuamente.",
          tip: ""
        }
      ]
    },
    {
      id: "inventory",
      title: "Gestión de Inventario",
      icon: Package,
      color: "orange",
      content: [
        {
          step: "📉",
          title: "Cuándo se descuenta el stock",
          description: "El stock se descuenta automáticamente cuando CONFIRMAS una cita, no cuando la agendan. Cada confirmación descuenta 1 unidad de stock del producto correspondiente.",
          tip: ""
        },
        {
          step: "🚫",
          title: "Productos agotados",
          description: "Cuando el stock de un producto llega a 0, el anuncio se marca automáticamente como 'agotado' y desaparece del catálogo. Los compradores ya no podrán agendar citas para ese producto.",
          tip: ""
        },
        {
          step: "📅",
          title: "Expiración de anuncios",
          description: "Los anuncios expiran automáticamente después de 1 AÑO desde la fecha de publicación. Los anuncios expirados se marcan como 'expirados' y se ocultan del catálogo. Si quieres seguir vendiendo ese producto, deberás crear un nuevo anuncio.",
          tip: ""
        },
        {
          step: "❌",
          title: "Eliminar anuncios",
          description: "Puedes eliminar anuncios activos en cualquier momento desde 'Mis Productos'. Sin embargo, los créditos gastados NO se reembolsan. Solo elimina si realmente no quieres vender más ese producto.",
          tip: "⚠️ No hay reembolso de créditos al eliminar anuncios."
        }
      ]
    },
    {
      id: "ratings",
      title: "Sistema de Calificaciones",
      icon: Star,
      color: "yellow",
      content: [
        {
          step: "⭐",
          title: "Calificación promedio",
          description: "Tu calificación promedio (1-5 estrellas) es visible para todos los compradores en el catálogo. Una buena calificación aumenta la confianza y tus posibilidades de venta. Mantén un promedio alto siendo puntual, honesto y profesional.",
          tip: ""
        },
        {
          step: "🔄",
          title: "Sistema bidireccional",
          description: "Después de completar una transacción, TÚ calificas al comprador Y el comprador te califica a TI. Ambas calificaciones son importantes para mantener un marketplace confiable.",
          tip: ""
        },
        {
          step: "🔒",
          title: "Calificaciones permanentes",
          description: "Las calificaciones NO pueden editarse ni eliminarse después de publicadas. Esto garantiza transparencia. Si recibes una calificación negativa, concéntrate en mejorar para futuras transacciones.",
          tip: "💡 Responde profesionalmente a críticas para demostrar tu compromiso."
        }
      ]
    },
    {
      id: "best-practices",
      title: "Buenas Prácticas",
      icon: CheckCircle,
      color: "green",
      content: [
        {
          step: "⚡",
          title: "Responde rápido",
          description: "Los compradores prefieren vendedores que confirman agendamientos rápidamente. Revisa tus notificaciones varias veces al día y responde lo antes posible.",
          tip: ""
        },
        {
          step: "✅",
          title: "Solo confirma si puedes cumplir",
          description: "No confirmes agendamientos si no estás seguro de poder cumplir. Las cancelaciones de último minuto afectan tu reputación y la experiencia del comprador.",
          tip: ""
        },
        {
          step: "⏰",
          title: "Sé puntual",
          description: "Llega al punto de encuentro a la hora acordada. La puntualidad es clave para una buena calificación. Si llegas tarde, comunícalo al comprador por adelantado.",
          tip: ""
        },
        {
          step: "🔍",
          title: "Verifica el producto antes de entregar",
          description: "Asegúrate de que el producto esté en perfectas condiciones antes del encuentro. Lleva el producto exacto que describiste en el anuncio para evitar malentendidos.",
          tip: ""
        },
        {
          step: "📝",
          title: "Descripciones detalladas",
          description: "Al crear anuncios, escribe descripciones completas y precisas. Incluye especificaciones técnicas, estado del producto (nuevo/usado), y cualquier detalle relevante. Recuerda: NO puedes editar después de publicar.",
          tip: "🚨 Revisa bien antes de publicar: no hay edición posterior."
        },
        {
          step: "📸",
          title: "Fotos de calidad",
          description: "Usa fotos claras y bien iluminadas de los productos. Las fotos de calidad generan más confianza y aumentan tus posibilidades de venta.",
          tip: ""
        }
      ]
    },
    {
      id: "security",
      title: "Consejos de Seguridad",
      icon: Shield,
      color: "red",
      content: [
        {
          step: "📍",
          title: "Solo puntos de encuentro verificados",
          description: "NUNCA aceptes encuentros fuera de los puntos seguros del sistema (centros comerciales, plazas principales, cafeterías reconocidas). Estos lugares son públicos, con cámaras de seguridad y tránsito constante de personas.",
          tip: "🚨 Rechaza cualquier solicitud de encuentro en lugares privados."
        },
        {
          step: "💳",
          title: "No compartas datos bancarios",
          description: "El sistema de créditos existe para que NO haya transacciones directas de dinero entre usuarios. NUNCA compartas tu número de cuenta, CBU, o datos bancarios con compradores.",
          tip: ""
        },
        {
          step: "🚩",
          title: "Reporta comportamientos sospechosos",
          description: "Si un comprador te pide encontrarte en otro lugar, quiere pagar fuera del sistema, o tiene comportamiento extraño, repórtalo inmediatamente a soporte@electromarket.bo con todos los detalles.",
          tip: ""
        },
        {
          step: "👥",
          title: "Lleva acompañante si es necesario",
          description: "Si es tu primera venta o el producto es de alto valor, considera llevar un acompañante al punto de encuentro para mayor seguridad.",
          tip: ""
        }
      ]
    },
    {
      id: "faq",
      title: "Preguntas Frecuentes",
      icon: BookOpen,
      color: "blue",
      content: [
        {
          step: "❓",
          title: "¿Puedo tener múltiples horarios por día?",
          description: "SÍ. Puedes configurar varios bloques de horarios para el mismo día. Ejemplo: Lunes 9:00-12:00 y Lunes 14:00-18:00. Esto te da flexibilidad para pausas o compromisos personales.",
          tip: ""
        },
        {
          step: "❓",
          title: "¿Puedo cambiar el precio o descripción después de publicar?",
          description: "NO. Una vez publicado un anuncio, NO puedes editarlo. Si necesitas cambiar algo (precio, descripción, punto de encuentro), debes eliminar el anuncio completo y crear uno nuevo. IMPORTANTE: Al eliminar, NO recuperas los créditos gastados, deberás usar créditos nuevos para republicar.",
          tip: "🚨 Revisa TODO cuidadosamente antes de publicar. No hay edición posterior y no hay reembolso de créditos."
        },
        {
          step: "❓",
          title: "¿Qué pasa si no confirmo a tiempo?",
          description: "Si no confirmas un agendamiento antes de la fecha y hora programada, el sistema lo CANCELA AUTOMÁTICAMENTE cada hora. El comprador recibe una notificación y puede agendar con otro vendedor. Esto puede afectar tu reputación si sucede frecuentemente.",
          tip: ""
        },
        {
          step: "❓",
          title: "¿Puedo vender productos de cualquier categoría?",
          description: "Sí, siempre que sean componentes electrónicos, Arduino, Raspberry Pi, sensores, módulos, herramientas, etc. El sistema está diseñado para electrónica. Productos fuera de estas categorías pueden ser eliminados por administradores.",
          tip: ""
        },
        {
          step: "❓",
          title: "¿Qué pasa si un comprador no llega al encuentro?",
          description: "Si el comprador no llega, puedes marcar el agendamiento como cancelado y calificarlo negativamente. Sin embargo, el stock YA FUE DESCONTADO cuando confirmaste, por lo que NO se restaura automáticamente. Deberás contactar a soporte si necesitas ayuda.",
          tip: "💡 Confirma solo compradores con buena calificación para reducir este riesgo."
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      pink: { bg: "bg-pink-100", text: "text-pink-600", border: "border-pink-300", gradient: "from-pink-500 to-rose-500" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-300", gradient: "from-purple-500 to-indigo-500" },
      teal: { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-300", gradient: "from-teal-500 to-cyan-500" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-300", gradient: "from-orange-500 to-amber-500" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600", border: "border-yellow-300", gradient: "from-yellow-500 to-orange-500" },
      green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-300", gradient: "from-green-500 to-emerald-500" },
      red: { bg: "bg-red-100", text: "text-red-600", border: "border-red-300", gradient: "from-red-500 to-pink-500" },
      blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-300", gradient: "from-blue-500 to-indigo-500" }
    };
    return colors[color as keyof typeof colors] || colors.pink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-pink-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Guía del Vendedor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Todo lo que necesitas saber para vender exitosamente en ELECTROMARKET
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => onNavigate('buy-credits')}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-pink-300 transition-all hover:shadow-xl group"
          >
            <CreditCard className="h-8 w-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900 mb-2">Comprar Créditos</h3>
            <p className="text-sm text-gray-600">Comienza a vender comprando tu primer pack de créditos</p>
            <ArrowRight className="h-5 w-5 text-pink-600 mt-3 ml-auto" />
          </button>

          <button
            onClick={() => onNavigate('mis-horarios')}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-purple-300 transition-all hover:shadow-xl group"
          >
            <Clock className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900 mb-2">Configurar Horarios</h3>
            <p className="text-sm text-gray-600">Define tus días y horarios de atención</p>
            <ArrowRight className="h-5 w-5 text-purple-600 mt-3 ml-auto" />
          </button>

          <button
            onClick={() => onNavigate('create-ad')}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-teal-300 transition-all hover:shadow-xl group"
          >
            <Package className="h-8 w-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900 mb-2">Crear Anuncio</h3>
            <p className="text-sm text-gray-600">Publica tu primer producto</p>
            <ArrowRight className="h-5 w-5 text-teal-600 mt-3 ml-auto" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Índice de Contenidos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {sections.map((section) => {
              const Icon = section.icon;
              const colors = getColorClasses(section.color);
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? `${colors.border} bg-gradient-to-r ${colors.gradient} text-white shadow-lg scale-105`
                      : `border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50`
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : colors.text}`} />
                  <span className={`text-sm font-medium text-left ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {section.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sections Content */}
        <div className="space-y-8">
          {sections
            .filter((section) => activeSection === null || activeSection === section.id)
            .map((section) => {
              const Icon = section.icon;
              const colors = getColorClasses(section.color);

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                >
                  <div className="flex items-center space-x-4 mb-8">
                    <div className={`p-4 rounded-xl ${colors.bg}`}>
                      <Icon className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item, index) => (
                      <div
                        key={index}
                        className={`border-l-4 ${colors.border} pl-6 py-4 bg-gradient-to-r from-gray-50 to-transparent rounded-r-xl`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-700 leading-relaxed mb-3">{item.description}</p>
                            {item.tip && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-900 font-medium">{item.tip}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-br from-pink-600 via-purple-600 to-teal-600 rounded-2xl shadow-2xl p-10 text-white text-center">
          <Users className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar a vender?</h2>
          <p className="text-lg text-pink-100 mb-6 max-w-2xl mx-auto">
            Únete a cientos de vendedores exitosos en ELECTROMARKET. Configura tu cuenta en minutos y comienza a generar ventas hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('buy-credits')}
              className="bg-white text-pink-600 px-8 py-4 rounded-xl hover:bg-pink-50 transition-colors font-bold shadow-xl hover:shadow-2xl text-lg"
            >
              Comprar Créditos Ahora
            </button>
            <button
              onClick={() => onNavigate('help')}
              className="bg-white/10 backdrop-blur text-white border-2 border-white px-8 py-4 rounded-xl hover:bg-white/20 transition-colors font-bold text-lg"
            >
              Ir al Centro de Ayuda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
