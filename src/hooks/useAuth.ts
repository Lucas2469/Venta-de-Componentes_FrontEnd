import { useState, useEffect, useCallback } from 'react';
import { authService, User, LoginCredentials, RegisterData, ChangePasswordData } from '../api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Inicializar estado de autenticación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();

        if (isAuthenticated && user) {
          // Primero actualizar el estado con el usuario del localStorage
          // Esto evita el "Acceso denegado" durante la verificación del token
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          // Luego verificar si el token sigue siendo válido (en background)
          try {
            const isValid = await authService.verifyToken();
            if (!isValid) {
              // Token inválido, limpiar autenticación
              await authService.logout();
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
              });
            }
          } catch (verifyError) {
            // Si falla la verificación, mantener el usuario por ahora
            // El interceptor de axios manejará la expiración del token
            console.warn('Token verification failed, but keeping user logged in', verifyError);
          }
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Error inicializando autenticación'
        });
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const authResponse = await authService.login(credentials);

      // Actualizar usuario primero pero mantener isLoading: true
      setState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: true, // Mantener loading para evitar "Acceso denegado" prematuramente
        error: null
      });

      // Esperar a que el contexto se propague antes de cambiar isLoading a false
      // Aumentado a 2000ms para admin, 1500ms para otros usuarios
      const delayMs = authResponse.user.tipo_usuario === 'admin' ? 2000 : 1500;
      await new Promise(resolve => setTimeout(resolve, delayMs));

      setState(prev => ({
        ...prev,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error en login'
      }));
      throw error;
    }
  }, []);

  // Registro
  const register = useCallback(async (userData: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const authResponse = await authService.register(userData);
      setState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error en registro'
      }));
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.logout();
      // Limpiar localStorage completamente para evitar datos corruptos o viejos
      localStorage.clear();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error during logout:', error);
      // Incluso si hay error, limpiar localStorage y estado local
      localStorage.clear();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, []);

  // Cambiar contraseña
  const changePassword = useCallback(async (passwordData: ChangePasswordData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.changePassword(passwordData);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error cambiando contraseña'
      }));
      throw error;
    }
  }, []);

  // Refrescar perfil
  const refreshProfile = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await authService.getProfile();
      setState(prev => ({
        ...prev,
        user,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error obteniendo perfil'
      }));
    }
  }, [state.isAuthenticated]);

  // Actualizar usuario
  const updateUser = useCallback((userData: Partial<User>) => {
    authService.updateUser(userData);
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null
    }));
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 🔄 SINCRONIZACIÓN AUTOMÁTICA DE CRÉDITOS
  // Verifica créditos cada 30 segundos y actualiza automáticamente
  useEffect(() => {
    // Solo sincronizar si hay un usuario autenticado
    if (!state.isAuthenticated || !state.user) {
      return;
    }

    const syncCredits = async () => {
      try {
        const updatedUser = await authService.getProfile();

        // Usar setState con función para obtener el estado más reciente
        setState(prev => {
          // Actualizar si cambiaron créditos O tipo_usuario
          if (prev.user && (
            updatedUser.creditos_disponibles !== prev.user.creditos_disponibles ||
            updatedUser.tipo_usuario !== prev.user.tipo_usuario
          )) {
            // También actualizar en localStorage
            authService.updateUser({
              creditos_disponibles: updatedUser.creditos_disponibles,
              tipo_usuario: updatedUser.tipo_usuario
            });

            return {
              ...prev,
              user: {
                ...prev.user,
                creditos_disponibles: updatedUser.creditos_disponibles,
                tipo_usuario: updatedUser.tipo_usuario
              }
            };
          }
          return prev; // No cambiar estado si no hay cambios
        });
      } catch (error) {
        console.error('Error sincronizando créditos:', error);
        // No mostrar error al usuario, es una sincronización en background
      }
    };

    // Ejecutar inmediatamente al montar (después de 1 segundo)
    const immediateTimer = setTimeout(syncCredits, 1000);

    // Configurar intervalo de 30 segundos
    const interval = setInterval(syncCredits, 30000); // 30 segundos

    // Limpiar timers al desmontar
    return () => {
      clearTimeout(immediateTimer);
      clearInterval(interval);
    };
  }, [state.isAuthenticated, state.user?.id]); // Solo depender de autenticación y userId

  return {
    ...state,
    login,
    register,
    logout,
    changePassword,
    refreshProfile,
    clearError,
    updateUser
  };
};

// Hook para verificar roles específicos
export const useRole = () => {
  const { user, isAuthenticated } = useAuth();

  return {
    isAdmin: () => isAuthenticated && user?.tipo_usuario === 'admin',
    isVendor: () => isAuthenticated && user?.tipo_usuario === 'vendedor',
    isBuyer: () => isAuthenticated && user?.tipo_usuario === 'comprador',
    hasRole: (role: 'admin' | 'vendedor' | 'comprador') => 
      isAuthenticated && user?.tipo_usuario === role,
    canAccess: (requiredRoles: ('admin' | 'vendedor' | 'comprador')[]) =>
      isAuthenticated && user ? requiredRoles.includes(user.tipo_usuario) : false
  };
};

// Hook para verificar permisos
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  return {
    canCreateProducts: () => isAuthenticated && (user?.tipo_usuario === 'vendedor' || user?.tipo_usuario === 'admin'),
    canManageUsers: () => isAuthenticated && user?.tipo_usuario === 'admin',
    canViewAdminPanel: () => isAuthenticated && user?.tipo_usuario === 'admin',
    canBuyCredits: () => isAuthenticated && user?.tipo_usuario !== 'admin',
    canScheduleAppointments: () => isAuthenticated && user?.tipo_usuario !== 'admin',
    canRateUsers: () => isAuthenticated && user?.tipo_usuario !== 'admin',
    hasCredits: (requiredCredits: number = 1) => 
      isAuthenticated && (user?.creditos_disponibles || 0) >= requiredCredits
  };
};
