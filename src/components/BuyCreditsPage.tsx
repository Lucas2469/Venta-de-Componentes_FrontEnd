import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Upload,
  Check,
  Star,
  Zap,
  FileImage,
  RefreshCw
} from "lucide-react";
import { SuccessModal } from "./reusables/SuccessModal";
import { useAuthContext } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface BuyCreditsPageProps {
  onBack: () => void;
}

export function BuyCreditsPage({ onBack }: BuyCreditsPageProps) {
  const { user: currentUser, refreshProfile } = useAuthContext();
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [proofImage, setProofImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creditPackages, setCreditPackages] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Función para actualizar créditos manualmente
  const handleRefreshCredits = async () => {
    console.log('🔄 Actualizando créditos manualmente...');
    await refreshProfile();
  };

  // Obtener los paquetes de créditos desde el backend
  useEffect(() => {
    fetch(`${API_BASE}/api/packs`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((p: any) => ({
          id: String(p.id),
          name: p.nombre,
          credits: Number(p.cantidad_creditos),
          price: Number(p.precio),
          qrCodeUrl: p.qr_imagen_url ? `${API_BASE}${p.qr_imagen_url}` : "",
          description: p.descripcion || "",
          popular: Boolean(p.popular),
          bonus: Number(p.bonus_creditos || 0),
        }));
        setCreditPackages(mapped);
        // Opcional: seleccionar el primero
        // if (mapped.length) setSelectedPackage(mapped[0].id);
      })
      .catch(err => console.error("Error cargando packs:", err));
  }, []);


  // Encontrar el paquete seleccionado
  const selectedPkg = creditPackages.find(pkg => pkg.id === selectedPackage);

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

    if (!selectedPkg) {
      alert("Por favor selecciona un paquete");
      return;
    }
    if (!proofImage) {
      alert("Por favor sube el comprobante de pago");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileInput = document.getElementById('proof-upload') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (!file) throw new Error("No se encontró el archivo");

      const formData = new FormData();
      // Usar el ID del usuario logueado
      const userId = currentUser?.id ? currentUser.id.toString() : "2";
      formData.append("usuario_id", userId);
      formData.append("pack_creditos_id", selectedPkg.id);
      formData.append("comprobante_pago", file); // ← nada más; el backend deriva todo

      const response = await fetch(`${API_BASE}/api/creditos/comprar`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Error en la solicitud");

      await response.json();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      alert("Hubo un error al enviar la solicitud, intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Limpiar formulario
    setSelectedPackage("");
    setProofImage("");
    // Volver al catálogo
    onBack();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-pink-800">
              Comprar Créditos
            </h1>
            <p className="text-gray-600 mt-2">
              Obtén créditos para publicar y promocionar tus anuncios
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Usuario actual:</p>
            <div className="text-sm font-medium text-gray-800">
              {currentUser?.nombre} {currentUser?.apellido}
            </div>
            <p className="text-sm text-gray-600">Créditos actuales:</p>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-pink-800">
                {currentUser?.creditos_disponibles || 0}
              </div>
              <button
                type="button"
                onClick={handleRefreshCredits}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1"
                title="Actualizar créditos ahora"
              >
                <RefreshCw className="h-3 w-3" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Credit Packages */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Selecciona un Paquete</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creditPackages.map((pkg) => (
                  <div key={pkg.id} className="relative">
                    <input
                      type="radio"
                      name="package"
                      value={pkg.id}
                      id={pkg.id}
                      checked={selectedPackage === pkg.id}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="absolute top-4 left-4 z-10 h-4 w-4 text-pink-800 border-gray-300 focus:ring-pink-500"
                    />
                    <label htmlFor={pkg.id} className="cursor-pointer block">
                      <div className={`h-full bg-white border rounded-lg transition-all duration-200 hover:shadow-lg ${
                        selectedPackage === pkg.id
                          ? 'ring-2 ring-pink-800 bg-blue-50'
                          : 'border-gray-200 hover:shadow-md'
                      }`}>
                        <div className="text-center relative p-6">
                          {pkg.popular && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Más Popular
                            </div>
                          )}
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                          {pkg.description && (
                            <p className="text-xs text-gray-500 mt-2">{pkg.description}</p>
                          )}
                          <div className="text-3xl font-bold text-pink-800">
                            {pkg.credits}
                          </div>
                          <p className="text-sm text-gray-600">créditos</p>
                        </div>
                        <div className="text-center p-6 pt-0">
                          <div className="text-2xl font-bold mb-2">
                            Bs {pkg.price}
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            Bs {(pkg.price / pkg.credits).toFixed(2)} por crédito
                          </p>
                          <div className="text-xs text-gray-500">
                            {pkg.bonus > 0 && (
                              <p className="text-green-600 font-medium">
                                ¡{pkg.bonus} créditos extra gratis!
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          {selectedPackage && selectedPkg && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Instrucciones de Pago</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumen de tu compra:</h4>
                  <div className="flex justify-between items-center">
                    <span>{selectedPkg.name}</span>
                    <span className="font-bold">Bs {selectedPkg.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Créditos a recibir:</span>
                    <span className="font-bold">{selectedPkg.credits + (selectedPkg.bonus || 0)}</span>
                  </div>
                  {selectedPkg.bonus > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Incluye bonus:</span>
                      <span className="font-bold">+{selectedPkg.bonus} créditos</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Pasos para completar tu pago:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="bg-pink-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Realiza el pago por QR</p>
                        <p className="text-gray-600">Escanea el código QR con tu app bancaria</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-pink-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Guarda el comprobante</p>
                        <p className="text-gray-600">Captura de pantalla del comprobante de pago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-pink-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
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
                  {selectedPkg.qrCodeUrl ? (
                    <img
                      src={selectedPkg.qrCodeUrl}
                      alt={`Código QR Bs ${selectedPkg.price}`}
                      className="w-48 h-48 mx-auto rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                      <FileImage className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Código QR<br />Bs {selectedPkg.price}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Proof */}
          {selectedPackage && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Comprobante de Pago</span>
                </h3>
              </div>
              <div className="p-6">
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
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
            >
              Volver al Catálogo
            </button>
            <button
              type="submit"
              disabled={!selectedPkg || !proofImage || isSubmitting}
              className="flex-1 px-4 py-2 bg-pink-800 text-white rounded-md hover:bg-pink-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>

        {/* Information Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="p-4">
            <h4 className="font-medium text-blue-800 mb-2">Información importante:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tu solicitud será revisada en un máximo de 24 horas</li>
              <li>• Los créditos se acreditarán una vez verificado el pago</li>
              <li>• Los créditos no caducan y pueden usarse en cualquier momento</li>
              <li>• Para dudas o problemas, contacta nuestro soporte</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="¡Solicitud Enviada!"
        message="Tu solicitud fue enviada correctamente y será revisada en las próximas 24 horas. Te notificaremos cuando esté aprobada."
        buttonText="Entendido"
      />
    </div>
  );
}