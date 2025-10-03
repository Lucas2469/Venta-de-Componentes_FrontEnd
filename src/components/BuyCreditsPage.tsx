import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { 
  CreditCard, 
  Upload, 
  Check, 
  Star, 
  Zap,
  FileImage
} from "lucide-react";
import { mockCreditPackages } from "./mockData";

interface BuyCreditsPageProps {
  onBack: () => void;
  currentUser?: any;
}

export function BuyCreditsPage({ onBack, currentUser }: BuyCreditsPageProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [proofImage, setProofImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProofImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) {
      alert("Por favor selecciona un paquete");
      return;
    }
    if (!proofImage) {
      alert("Por favor sube el comprobante de pago");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);

    alert("Tu solicitud de créditos ha sido enviada para revisión. Te notificaremos una vez sea aprobada.");
    onBack();
  };

  const selectedPkg = mockCreditPackages.find(p => p.id === selectedPackage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#9d0045' }}>
              Comprar Créditos
            </h1>
            <p className="text-gray-600 mt-2">
              Obtén créditos para publicar y promocionar tus anuncios
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Créditos actuales:</p>
            <div className="text-2xl font-bold" style={{ color: '#9d0045' }}>
              {currentUser?.credits || 0}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Credit Packages */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Selecciona un Paquete</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockCreditPackages.map((pkg) => (
                    <div key={pkg.id} className="relative">
                      <RadioGroupItem 
                        value={pkg.id} 
                        id={pkg.id}
                        className="absolute top-4 left-4 z-10"
                      />
                      <label htmlFor={pkg.id} className="cursor-pointer">
                        <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
                          selectedPackage === pkg.id 
                            ? 'ring-2 ring-electromarket-maroon bg-blue-50' 
                            : 'hover:shadow-md'
                        }`}>
                          <CardHeader className="text-center relative">
                            {pkg.popular && (
                              <Badge 
                                className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-electromarket-teal text-white"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Más Popular
                              </Badge>
                            )}
                            <CardTitle className="text-xl mb-2">{pkg.name}</CardTitle>
                            <div className="text-3xl font-bold" style={{ color: '#9d0045' }}>
                              {pkg.credits}
                            </div>
                            <p className="text-sm text-gray-600">créditos</p>
                          </CardHeader>
                          <CardContent className="text-center">
                            <div className="text-2xl font-bold mb-2">
                              Bs {pkg.price}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              Bs {(pkg.price / pkg.credits).toFixed(2)} por crédito
                            </p>
                            <div className="text-xs text-gray-500">
                              {pkg.bonus && (
                                <p className="text-green-600 font-medium">
                                  ¡{pkg.bonus} créditos extra gratis!
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          {selectedPackage && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Instrucciones de Pago</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumen de tu compra:</h4>
                  <div className="flex justify-between items-center">
                    <span>{selectedPkg?.name}</span>
                    <span className="font-bold">Bs {selectedPkg?.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Créditos a recibir:</span>
                    <span className="font-bold">{selectedPkg?.credits}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Pasos para completar tu pago:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="bg-electromarket-maroon text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Realiza el pago por QR</p>
                        <p className="text-gray-600">Escanea el código QR con tu app bancaria</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-electromarket-maroon text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Guarda el comprobante</p>
                        <p className="text-gray-600">Captura de pantalla del comprobante de pago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-electromarket-maroon text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Sube el comprobante</p>
                        <p className="text-gray-600">Adjunta la imagen del comprobante abajo</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="text-center bg-white p-6 border rounded-lg">
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Código QR<br />
                        Bs {selectedPkg?.price}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Proof */}
          {selectedPackage && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Comprobante de Pago</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="proof-upload"
                    />
                    <label htmlFor="proof-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        Haz clic aquí para subir tu comprobante
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Formatos permitidos: JPG, PNG, JPEG
                      </p>
                    </label>
                  </div>

                  {proofImage && (
                    <div className="text-center">
                      <img
                        src={proofImage}
                        alt="Comprobante"
                        className="max-w-sm mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-green-600 mt-2 flex items-center justify-center">
                        <Check className="h-4 w-4 mr-1" />
                        Comprobante cargado correctamente
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Volver al Catálogo
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
              disabled={!selectedPackage || !proofImage || isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>

        {/* Information Box */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-800 mb-2">Información importante:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tu solicitud será revisada en un máximo de 24 horas</li>
              <li>• Los créditos se acreditarán una vez verificado el pago</li>
              <li>• Los créditos no caducan y pueden usarse en cualquier momento</li>
              <li>• Para dudas o problemas, contacta nuestro soporte</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}