import React from "react";
import { useState } from "react";
import { AlertCircle, User } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface RegistrationPageProps {
  onNavigateToLogin: () => void;
}

export function RegistrationPage({ onNavigateToLogin }: RegistrationPageProps) {
  const { register, isLoading, error, clearError } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "El apellido debe tener al menos 2 caracteres";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El celular es requerido";
    } else if (!/^\+591[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = "El celular debe tener formato +591XXXXXXXX";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Por favor ingresa un correo válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Por favor confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    clearError();
    
    try {
      await register({
        nombre: formData.firstName,
        apellido: formData.lastName,
        email: formData.email,
        telefono: formData.phone,
        password: formData.password,
        tipo_usuario: 'comprador'
      });
      
      // Redirigir al catálogo después del registro exitoso
      navigate('/catalog');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="text-center p-6" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
          <div className="flex items-center justify-center mb-2">
            <User className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">ELECTROMARKET</h1>
          </div>
          <p className="text-white/80">
            Crea tu cuenta para comenzar a comprar o vender
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                    errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.firstName && (
                  <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                    errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.lastName && (
                  <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Celular</label>
              <input
                id="phone"
                type="tel"
                placeholder="+591XXXXXXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.phone}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Crea una contraseña"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.password}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.confirmPassword && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="hover:underline transition-colors"
              style={{ color: '#00adb5' }}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}