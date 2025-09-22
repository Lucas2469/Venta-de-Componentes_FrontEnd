<<<<<<< HEAD
import React from "react";
=======
>>>>>>> AnettG
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle, MessageCircle, Calendar, MapPin, ExternalLink } from "lucide-react";
import { mockMeetingPoints } from "./mockData";

interface ContactConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  sellerName: string;
  selectedDate: Date;
  meetingPointId: string;
}

export function ContactConfirmationModal({ 
  isOpen, 
  onClose, 
  productTitle, 
  sellerName,
  selectedDate,
  meetingPointId 
}: ContactConfirmationModalProps) {
  
  const meetingPoint = mockMeetingPoints.find(mp => mp.id === meetingPointId);
  
  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    const message = `Hola ${sellerName}, estoy interesado en tu producto "${productTitle}". Me gustaría encontrarnos el ${selectedDate.toLocaleDateString('es-ES')} en ${meetingPoint?.name}. ¿Está disponible?`;
    return encodeURIComponent(message);
  };

  const whatsappUrl = `https://wa.me/?text=${generateWhatsAppMessage()}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <DialogTitle>¡Contacto Confirmado!</DialogTitle>
          </div>
          <DialogDescription>
            Tu solicitud de encuentro ha sido preparada. Ahora puedes contactar directamente al vendedor.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Meeting Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900">Detalles del encuentro:</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">{meetingPoint?.name}</div>
                  <div className="text-gray-600">{meetingPoint?.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Próximos pasos:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Contacta al vendedor por WhatsApp</li>
              <li>Confirma la fecha y hora exacta</li>
              <li>Verifica el estado del producto</li>
              <li>Acuerden el método de pago</li>
            </ol>
          </div>

          {/* Safety Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Consejos de seguridad:</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Reúnanse en lugares públicos y seguros</li>
              <li>Verifiquen el producto antes de pagar</li>
              <li>Mantengan la comunicación a través de la app</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button 
              className="w-full"
              style={{ backgroundColor: '#25D366', color: '#ffffff' }}
              onClick={() => window.open(whatsappUrl, '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar por WhatsApp
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>

          {/* Contact Info */}
          <div className="text-center text-xs text-gray-500">
            Al contactar al vendedor, te comprometes a cumplir con nuestros términos de uso y políticas de seguridad.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}