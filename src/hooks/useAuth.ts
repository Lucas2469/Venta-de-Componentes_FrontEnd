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
          // Verificar si el token sigue siendo válido
          const isValid = await authService.verifyToken();
          if (isValid) {
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            // Token inválido, limpiar autenticación
            await authService.logout();
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
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
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error during logout:', error);
      // Incluso si hay error, limpiar el estado local
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
      isAuthenticated && user && requiredRoles.includes(user.tipo_usuario)
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
