import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, usePermissions } from '../hooks/useAuth';
import { User } from '../api/authApi';

// Tipos para el contexto
interface AuthContextType {
  // Estado de autenticación
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones de autenticación
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    password: string;
    tipo_usuario?: 'comprador' | 'vendedor';
  }) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;

  // Roles y permisos
  isAdmin: () => boolean;
  isVendor: () => boolean;
  isBuyer: () => boolean;
  hasRole: (role: 'admin' | 'vendedor' | 'comprador') => boolean;
  canAccess: (requiredRoles: ('admin' | 'vendedor' | 'comprador')[]) => boolean;
  canCreateProducts: () => boolean;
  canManageUsers: () => boolean;
  canViewAdminPanel: () => boolean;
  canBuyCredits: () => boolean;
  canScheduleAppointments: () => boolean;
  canRateUsers: () => boolean;
  hasCredits: (requiredCredits?: number) => boolean;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const role = useRole();
  const permissions = usePermissions();

  const contextValue: AuthContextType = {
    // Estado de autenticación
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,

    // Acciones de autenticación
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    changePassword: auth.changePassword,
    refreshProfile: auth.refreshProfile,
    clearError: auth.clearError,
    updateUser: auth.updateUser,

    // Roles
    isAdmin: role.isAdmin,
    isVendor: role.isVendor,
    isBuyer: role.isBuyer,
    hasRole: role.hasRole,
    canAccess: role.canAccess,

    // Permisos
    canCreateProducts: permissions.canCreateProducts,
    canManageUsers: permissions.canManageUsers,
    canViewAdminPanel: permissions.canViewAdminPanel,
    canBuyCredits: permissions.canBuyCredits,
    canScheduleAppointments: permissions.canScheduleAppointments,
    canRateUsers: permissions.canRateUsers,
    hasCredits: permissions.hasCredits
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Componente de protección de rutas
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: ('admin' | 'vendedor' | 'comprador')[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallback = <div>Acceso denegado</div>
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, canAccess } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Acceso Requerido
          </h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder a esta página
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  if (requiredRoles && !canAccess(requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Componente para mostrar contenido solo a usuarios autenticados
interface AuthOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AuthOnly: React.FC<AuthOnlyProps> = ({
  children,
  fallback = null
}) => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

// Componente para mostrar contenido solo a usuarios no autenticados
interface GuestOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const GuestOnly: React.FC<GuestOnlyProps> = ({
  children,
  fallback = null
}) => {
  const { isAuthenticated } = useAuthContext();
  return !isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

// Componente para mostrar contenido basado en roles
interface RoleBasedProps {
  children: ReactNode;
  roles: ('admin' | 'vendedor' | 'comprador')[];
  fallback?: ReactNode;
}

export const RoleBased: React.FC<RoleBasedProps> = ({
  children,
  roles,
  fallback = null
}) => {
  const { canAccess } = useAuthContext();
  return canAccess(roles) ? <>{children}</> : <>{fallback}</>;
};

// Componente para mostrar contenido basado en permisos
interface PermissionBasedProps {
  children: ReactNode;
  permission: keyof Pick<AuthContextType, 
    'canCreateProducts' | 'canManageUsers' | 'canViewAdminPanel' | 
    'canBuyCredits' | 'canScheduleAppointments' | 'canRateUsers'
  >;
  fallback?: ReactNode;
}

export const PermissionBased: React.FC<PermissionBasedProps> = ({
  children,
  permission,
  fallback = null
}) => {
  const auth = useAuthContext();
  const hasPermission = auth[permission]();
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};
