import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { 
  Upload, 
  X, 
  Plus, 
  Clock, 
  DollarSign, 
  Package, 
  FileText, 
  Image as ImageIcon,
  Calendar
} from "lucide-react";
import { mockCategories } from "./mockData";

interface CreateAdPageProps {
  onBack: () => void;
}

interface WeeklySchedule {
  [key: string]: string[];
}

const DAYS_OF_WEEK = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' }
];

export function CreateAdPage({ onBack }: CreateAdPageProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    category: ""
  });

  const [images, setImages] = useState<string[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: []
  });
  const [newTimeForDay, setNewTimeForDay] = useState<{[key: string]: string}>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTimeForDay = (day: string) => {
    const time = newTimeForDay[day];
    if (time && !weeklySchedule[day].includes(time)) {
      setWeeklySchedule(prev => ({
        ...prev,
        [day]: [...prev[day], time].sort()
      }));
      setNewTimeForDay(prev => ({ ...prev, [day]: "" }));
    }
  };

  const removeTimeFromDay = (day: string, time: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: prev[day].filter(t => t !== time)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    }
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = "La cantidad debe ser mayor a 0";
    }
    if (!formData.category) {
      newErrors.category = "Selecciona una categoría";
    }

    if (images.length === 0) {
      newErrors.images = "Debes subir al menos una imagen";
    }
    const hasSchedule = Object.values(weeklySchedule).some(times => times.length > 0);
    if (!hasSchedule) {
      newErrors.schedule = "Debes agregar al menos un horario en cualquier día";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would submit the ad
      alert("Anuncio creado exitosamente y enviado para revisión.");
      onBack();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#9d0045' }}>
            Crear Nuevo Anuncio
          </h1>
          <Button variant="outline" onClick={onBack}>
            Volver al Catálogo
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Información Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Anuncio *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Arduino UNO R3 Original con Cable USB"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu componente electrónico en detalle: estado, especificaciones, compatibilidad..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Precio (Bs) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="25"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Imágenes *</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      Haz clic aquí para subir imágenes
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Puedes subir múltiples imágenes (máx. 5)
                    </p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.images && (
                  <p className="text-red-500 text-sm">{errors.images}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Horarios de Disponibilidad *</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <Label>Horarios de disponibilidad por día *</Label>
                <div className="mt-4 space-y-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{day.label}</h4>
                        <Badge variant="secondary">
                          {weeklySchedule[day.key].length} horarios
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2 mb-3">
                        <Input
                          type="time"
                          placeholder="Agregar horario"
                          value={newTimeForDay[day.key] || ""}
                          onChange={(e) => setNewTimeForDay(prev => ({ 
                            ...prev, 
                            [day.key]: e.target.value 
                          }))}
                        />
                        <Button 
                          type="button" 
                          onClick={() => addTimeForDay(day.key)}
                          disabled={!newTimeForDay[day.key]}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {weeklySchedule[day.key].length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {weeklySchedule[day.key].map((time) => (
                            <div 
                              key={time} 
                              className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full"
                            >
                              <span className="text-sm">{time}</span>
                              <button
                                type="button"
                                onClick={() => removeTimeFromDay(day.key, time)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {errors.schedule && (
                  <p className="text-red-500 text-sm mt-1">{errors.schedule}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost Information */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <DollarSign className="h-5 w-5" />
                <span>Información de Costos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700">
              <p>
                • Publicar este anuncio costará <strong>5 créditos</strong>
              </p>
              <p>
                • El anuncio estará activo hasta que sea vendido o lo desactives
              </p>
              <p>
                • Puedes renovar el anuncio pagando 3 créditos adicionales
              </p>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
            >
              Crear Anuncio (5 Créditos)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}