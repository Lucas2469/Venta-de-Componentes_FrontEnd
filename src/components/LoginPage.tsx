import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, LogIn, Mail, Lock } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface LoginPageProps {
  onNavigateToRegistration: () => void;
  onLoginSuccess: (credentials?: { username: string; password: string }) => void;
}

export function LoginPage({ onNavigateToRegistration, onLoginSuccess }: LoginPageProps) {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    
    // Pass credentials to parent component
    onLoginSuccess({
      username: formData.emailOrUsername,
      password: formData.password
    });
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
    
    alert("Password reset link has been sent to your email!");
    setShowForgotPassword(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#ffffff' }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 mr-2" />
              <CardTitle className="text-2xl">Reset Password</CardTitle>
            </div>
            <CardDescription className="text-white/80">
              Enter your email or username to receive a reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your email or username"
                  value={formData.emailOrUsername}
                  onChange={(e) => handleInputChange("emailOrUsername", e.target.value)}
                  className={errors.emailOrUsername ? "border-red-500" : ""}
                />
                {errors.emailOrUsername && (
                  <Alert variant="destructive" className="p-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.emailOrUsername}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
                style={{ color: '#00adb5' }}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#ffffff' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
          <div className="flex items-center justify-center mb-2">
            <LogIn className="h-8 w-8 mr-2" />
            <CardTitle className="text-2xl">ELECTROMARKET</CardTitle>
          </div>
          <CardDescription className="text-white/80">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email or Username</Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="Enter your email or username"
                value={formData.emailOrUsername}
                onChange={(e) => handleInputChange("emailOrUsername", e.target.value)}
                className={errors.emailOrUsername ? "border-red-500" : ""}
              />
              {errors.emailOrUsername && (
                <Alert variant="destructive" className="p-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.emailOrUsername}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <Alert variant="destructive" className="p-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.password}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm hover:underline"
                style={{ color: '#00adb5' }}
              >
                Forgot password?
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToRegistration}
              className="hover:underline"
              style={{ color: '#00adb5' }}
            >
              Create one here
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}