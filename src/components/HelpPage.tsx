import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MessageCircle,
  ShoppingCart,
  CreditCard,
  Calendar,
  Star,
  Package,
  Users,
  Shield
} from "lucide-react";

interface HelpPageProps {
  onNavigate: (page: string) => void;
}

export function HelpPage({ onNavigate }: HelpPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqCategories = [
    {
      title: "Para Compradores",
      icon: ShoppingCart,
      color: "pink",
      faqs: [
        {
          question: "¿Cómo compro un producto?",
          answer: "Para comprar un producto: 1) Navega al catálogo y selecciona el producto que te interese. 2) Revisa los detalles, el precio y la calificación del vendedor. 3) Haz clic en 'Agendar Cita' y selecciona una fecha y hora disponible del vendedor. 4) Confirma el agendamiento. El vendedor recibirá una notificación y deberá confirmar la cita. Una vez confirmada, podrán encontrarse en el punto de encuentro seguro acordado."
        },
        {
          question: "¿Dónde puedo ver mis citas agendadas?",
          answer: "Puedes ver todas tus citas agendadas en la sección 'Mis Citas' del menú principal. Allí verás el estado de cada cita (agendado, confirmado, completado, cancelado), la fecha, hora, punto de encuentro y los detalles del producto."
        },
        {
          question: "¿Qué pasa si el vendedor no confirma mi cita?",
          answer: "Si el vendedor no confirma tu cita antes de la fecha y hora programada, el sistema CANCELARÁ AUTOMÁTICAMENTE el agendamiento cada hora. Recibirás una notificación informándote de la cancelación automática. Luego podrás agendar con otro vendedor."
        },
        {
          question: "¿Cómo califico a un vendedor?",
          answer: "Después de completar una transacción, podrás calificar al vendedor en una escala de 1 a 5 estrellas y dejar un comentario sobre tu experiencia. Esto ayuda a otros compradores a tomar decisiones informadas. El vendedor también te calificará a ti."
        }
      ]
    },
    {
      title: "Para Vendedores",
      icon: Package,
      color: "purple",
      faqs: [
        {
          question: "¿Cómo publico un producto?",
          answer: "Para publicar un producto necesitas tener créditos disponibles (1 crédito = 1 unidad de stock). Ve a 'Crear Anuncio', completa los detalles del producto (nombre, descripción, precio, stock), selecciona la categoría y el punto de encuentro seguro, y publica. Los créditos se descontarán igual al stock que publiques."
        },
        {
          question: "¿Cómo compro créditos?",
          answer: "Ve a 'Comprar Créditos' en el menú principal. Selecciona el pack de créditos que desees, sube tu comprobante de pago (transferencia bancaria o depósito) y envía la solicitud. Un administrador revisará tu comprobante y aprobará tu compra en un máximo de 24 horas. Los créditos se acreditarán automáticamente a tu cuenta."
        },
        {
          question: "¿Cómo gestiono mis horarios de atención?",
          answer: "Ve a 'Mis Horarios' en el menú para configurar tus días y horarios de disponibilidad. Los compradores solo podrán agendar citas dentro de los horarios que configures. Puedes tener múltiples bloques de horarios por día (ejemplo: 9:00-12:00 y 14:00-18:00 los lunes)."
        },
        {
          question: "¿Cuándo se descuenta el stock de mi producto?",
          answer: "El stock se descuenta automáticamente cuando CONFIRMAS una cita con un comprador, no cuando la agendan. Esto te permite revisar cada solicitud antes de comprometer tu inventario. Una vez confirmado y descontado el stock, no hay forma de restaurarlo automáticamente."
        },
        {
          question: "¿Cuánto tiempo dura mi anuncio?",
          answer: "Los anuncios tienen una duración de 1 año desde la fecha de publicación. Pasado ese tiempo, se marcan automáticamente como 'expirados'. Si tu producto se agota (stock llega a 0), el anuncio se marca como 'agotado' automáticamente."
        }
      ]
    },
    {
      title: "Sistema de Créditos",
      icon: CreditCard,
      color: "teal",
      faqs: [
        {
          question: "¿Qué son los créditos y para qué sirven?",
          answer: "Los créditos son la moneda interna de ELECTROMARKET. Necesitas 1 crédito por cada unidad de stock que quieras publicar. Ejemplo: Si quieres publicar 10 Arduinos, necesitas 10 créditos. Los créditos evitan transacciones directas de dinero entre usuarios y permiten que administradores verifiquen cada compra."
        },
        {
          question: "¿Cuánto cuestan los créditos?",
          answer: "Ofrecemos diferentes packs de créditos: Pack Básico (10 créditos - Bs. 50), Pack Estándar (25 créditos - Bs. 100), Pack Pro (50 créditos - Bs. 175), Pack Premium (100 créditos - Bs. 300). Mientras más compras, más ahorras."
        },
        {
          question: "¿Cuánto tiempo tardan en aprobar mi compra?",
          answer: "Generalmente las compras se aprueban en menos de 24 horas. Un administrador revisará tu comprobante de pago manualmente. Recibirás una notificación cuando tu compra sea aprobada o rechazada. Si es rechazada, se te indicará el motivo."
        },
        {
          question: "¿Los créditos vencen?",
          answer: "No, los créditos NO vencen. Una vez acreditados en tu cuenta, permanecen disponibles indefinidamente hasta que decidas usarlos para publicar productos."
        }
      ]
    },
    {
      title: "Citas y Encuentros",
      icon: Calendar,
      color: "orange",
      faqs: [
        {
          question: "¿Dónde nos encontramos?",
          answer: "ELECTROMARKET solo permite encuentros en puntos seguros previamente verificados: centros comerciales, plazas principales, cafeterías reconocidas. Al agendar una cita, debes seleccionar uno de estos puntos de encuentro. NUNCA aceptes encuentros en lugares privados o aislados."
        },
        {
          question: "¿Las citas se cancelan automáticamente?",
          answer: "Sí, si un vendedor no confirma una cita antes de la fecha y hora programada, el sistema ejecuta un proceso automático CADA HORA que cancela todos los agendamientos no confirmados que ya pasaron su fecha. El comprador recibe una notificación automática de la cancelación y puede agendar con otro vendedor."
        }
      ]
    },
    {
      title: "Calificaciones y Reputación",
      icon: Star,
      color: "yellow",
      faqs: [
        {
          question: "¿Cómo funciona el sistema de calificaciones?",
          answer: "ELECTROMARKET usa un sistema bidireccional: compradores califican a vendedores Y vendedores califican a compradores. Solo puedes calificar después de completar una transacción. Las calificaciones son de 1 a 5 estrellas y puedes dejar comentarios opcionales."
        },
        {
          question: "¿Puedo eliminar una calificación negativa?",
          answer: "No, las calificaciones son permanentes y no pueden editarse ni eliminarse. Esto garantiza la transparencia del sistema. Sin embargo, puedes responder a calificaciones negativas explicando tu versión de los hechos."
        },
        {
          question: "¿Qué pasa si tengo calificaciones muy bajas?",
          answer: "Las calificaciones bajas afectan tu reputación y pueden hacer que otros usuarios sean menos propensos a interactuar contigo. Si tu promedio es muy bajo o recibes múltiples reportes, tu cuenta puede ser revisada por administradores y suspendida temporalmente."
        }
      ]
    },
    {
      title: "Seguridad y Privacidad",
      icon: Shield,
      color: "red",
      faqs: [
        {
          question: "¿Mis datos personales son seguros?",
          answer: "Sí. Encriptamos todas las contraseñas con SHA-256, no compartimos tu información con terceros, y cumplimos con las mejores prácticas de seguridad. Solo la información que decides hacer pública (nombre, calificaciones) es visible para otros usuarios."
        },
        {
          question: "¿Cómo reporto un comportamiento sospechoso?",
          answer: "Si detectas un perfil falso, comportamiento abusivo, o intentos de estafa, puedes reportarlo usando el formulario de contacto más abajo o enviando un correo a soporte@electromarket.bo con los detalles. Investigaremos todos los reportes."
        },
        {
          question: "¿Qué hago si olvidé mi contraseña?",
          answer: "Actualmente debes contactar a soporte para restablecer tu contraseña. Envía un correo a soporte@electromarket.bo desde tu correo registrado solicitando el restablecimiento. Estamos trabajando en una función de recuperación automática."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const getColorClasses = (color: string) => {
    const colors = {
      pink: "bg-pink-100 text-pink-600",
      purple: "bg-purple-100 text-purple-600",
      teal: "bg-teal-100 text-teal-600",
      orange: "bg-orange-100 text-orange-600",
      yellow: "bg-yellow-100 text-yellow-600",
      red: "bg-red-100 text-red-600"
    };
    return colors[color as keyof typeof colors] || colors.pink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-16 w-16 text-pink-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Centro de Ayuda
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más frecuentes sobre ELECTROMARKET
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg shadow-lg"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, catIndex) => {
            const Icon = category.icon;
            return (
              <section key={catIndex} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-3 rounded-xl ${getColorClasses(category.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                </div>

                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = catIndex * 1000 + faqIndex;
                    const isExpanded = expandedFaq === globalIndex;

                    return (
                      <div
                        key={faqIndex}
                        className="border border-gray-200 rounded-xl overflow-hidden hover:border-pink-300 transition-colors"
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : globalIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-pink-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 text-gray-600 leading-relaxed bg-gray-50">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Section */}
        <section className="mt-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3">¿No encontraste lo que buscabas?</h2>
            <p className="text-pink-100 text-lg">
              Nuestro equipo de soporte está aquí para ayudarte
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <Mail className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm text-pink-100">soporte@electromarket.bo</p>
              <p className="text-xs text-pink-200 mt-2">Respuesta en 24h</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <Phone className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Teléfono</h3>
              <p className="text-sm text-pink-100">+591 2 123-4567</p>
              <p className="text-xs text-pink-200 mt-2">Lun-Vie 9:00-18:00</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm text-pink-100">+591 7 123-4567</p>
              <p className="text-xs text-pink-200 mt-2">Respuesta inmediata</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-white text-pink-600 px-8 py-3 rounded-xl hover:bg-pink-50 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Volver al Catálogo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
