import React from "react";
import { useState, useEffect } from "react";
import { AlertCircle, LogIn, Mail, Eye, EyeOff } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "./Toast";

interface LoginPageProps {
  onNavigateToRegistration: () => void;
}

export function LoginPage({ onNavigateToRegistration }: LoginPageProps) {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirigir cuando el login sea exitoso y el usuario esté autenticado
  useEffect(() => {
    if (loginSuccess && isAuthenticated && !isLoading) {
      // Redirigir según el tipo de usuario CON REFRESH para garantizar que funcione
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.tipo_usuario === 'admin') {
        window.location.href = '/admin-dashboard';
      } else {
        window.location.href = '/catalog';
      }
    }
  }, [loginSuccess, isAuthenticated, isLoading]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoginSuccess(false);

    try {
      await login({
        email: formData.emailOrUsername,
        password: formData.password
      });

      // El login() hook ahora maneja el delay internamente
      // Solo marcamos como exitoso para que el useEffect navegue
      setLoginSuccess(true);
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Email o contraseña incorrectos');
      setLoginSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.emailOrUsername.trim()) {
      setErrors({ emailOrUsername: "Please enter your email or username" });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    showToast('success', 'Enlace enviado', 'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico');
    setShowForgotPassword(false);
    setFormData(prev => ({ ...prev, emailOrUsername: "" }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (showForgotPassword) {
    return (
      <>
        <ToastComponent />
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="text-center p-6" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-bold">Reset Password</h1>
            </div>
            <p className="text-white/80">
              Enter your email or username to receive a reset link
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">Email or Username</label>
                <input
                  id="emailOrUsername"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your email or username"
                  value={formData.emailOrUsername}
                  onChange={(e) => handleInputChange("emailOrUsername", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                    errors.emailOrUsername ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.emailOrUsername && (
                  <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">{errors.emailOrUsername}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                className="w-full py-3 px-4 rounded-lg font-medium transition-colors hover:bg-gray-100"
                onClick={() => setShowForgotPassword(false)}
                style={{ color: '#00adb5' }}
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <ToastComponent />
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="text-center p-6" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
          <div className="flex items-center justify-center mb-2">
            <LogIn className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">ELECTROMARKET</h1>
          </div>
          <p className="text-white/80">
            Sign in to your account
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">Email or Username</label>
              <input
                id="emailOrUsername"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your email or username"
                value={formData.emailOrUsername}
                onChange={(e) => handleInputChange("emailOrUsername", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  errors.emailOrUsername ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.emailOrUsername && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.emailOrUsername}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                    errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.password}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm hover:underline transition-colors"
                style={{ color: '#00adb5' }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToRegistration}
              className="hover:underline transition-colors"
              style={{ color: '#00adb5' }}
            >
              Create one here
            </button>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}