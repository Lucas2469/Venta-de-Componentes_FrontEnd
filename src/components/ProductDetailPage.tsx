import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { ArrowLeft, Star, MapPin, Eye, Calendar as CalendarIcon, MessageCircle, Shield, User, Clock } from "lucide-react";
import { Product, MeetingPoint } from "./types";
import { mockProducts, mockMeetingPoints } from "./mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onContactSeller: (productId: string, date: Date, time: string) => void;
}

export function ProductDetailPage({ productId, onBack, onContactSeller }: ProductDetailPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const product = mockProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al catálogo
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Producto no encontrado</h2>
          <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  const availableMeetingPoints = mockMeetingPoints.filter(mp => 
    product.meetingPoints.includes(mp.id)
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Mapeo de números de día a nombres de días
  const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  
  const handleContactSeller = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }
    onContactSeller(productId, selectedDate, selectedTime);
    setShowConfirmDialog(false);
  };

  const isValidDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    // Verificar si el vendedor está disponible en ese día de la semana
    const dayName = dayNames[date.getDay()];
    const daySchedule = product.weeklySchedule[dayName];
    return daySchedule && daySchedule.length > 0;
  };

  const getAvailableTimesForDate = (date: Date | undefined): string[] => {
    if (!date) return [];
    const dayName = dayNames[date.getDay()];
    return product.weeklySchedule[dayName] || [];
  };

  const availableTimes = getAvailableTimesForDate(selectedDate);

  // Reset time when date changes
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={onBack} variant="outline" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al catálogo
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={product.images[selectedImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index 
                      ? 'border-[#9d0045]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.title} - imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <div className="flex items-center space-x-1 text-gray-500">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{product.views} vistas</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <div className="text-4xl font-bold mb-4" style={{ color: '#9d0045' }}>
              ${product.price}
            </div>
          </div>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información del Vendedor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{product.sellerName}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStars(product.sellerRating)}
                    <span className="text-sm text-gray-600 ml-2">({product.sellerRating})</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Vendedor verificado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>

          {/* Horarios de Disponibilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Horarios de Disponibilidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(product.weeklySchedule).map(([day, times]) => (
                  <div key={day} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium capitalize mb-2">{day}</div>
                    {times.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {times.map(time => (
                          <Badge key={time} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No disponible</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meeting Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Punto de Encuentro</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableMeetingPoints.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">{availableMeetingPoints[0].name}</div>
                      <div className="text-sm text-blue-700">{availableMeetingPoints[0].address}</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Se usará automáticamente al contactar al vendedor
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Button */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogTrigger asChild>
              <Button 
                className="w-full py-3 text-lg"
                style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contactar Vendedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agendar Encuentro</DialogTitle>
                <DialogDescription>
                  Selecciona fecha y horario para contactar al vendedor
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Fecha de encuentro</Label>
                  <p className="text-xs text-gray-600 mb-2">
                    Solo puedes seleccionar fechas en días que el vendedor esté disponible
                  </p>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => !isValidDate(date)}
                    className="rounded-md border"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <Label className="text-sm font-medium">
                      Horario disponible para {dayNames[selectedDate.getDay()]}
                    </Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecciona un horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {availableMeetingPoints.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700">Punto de encuentro:</Label>
                    <div className="mt-1">
                      <div className="font-medium">{availableMeetingPoints[0].name}</div>
                      <div className="text-sm text-gray-600">{availableMeetingPoints[0].address}</div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleContactSeller}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full"
                  style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Confirmar y Contactar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}