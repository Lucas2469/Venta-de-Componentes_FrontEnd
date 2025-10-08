# 🔐 Sistema de Autenticación Frontend - ElectroMarket

## 📋 Resumen

Se ha implementado un sistema de autenticación completo en el frontend que se integra con el backend JWT. Incluye manejo de tokens, refresh automático, protección de rutas y gestión de estado.

## 🚀 Características Implementadas

### ✅ Servicios de Autenticación
- **AuthService**: Clase singleton para manejo de autenticación
- **Interceptores Axios**: Manejo automático de tokens y refresh
- **LocalStorage**: Persistencia de tokens y datos de usuario
- **Validación**: Validación de tokens y manejo de errores

### ✅ Hooks Personalizados
- **useAuth**: Hook principal para autenticación
- **useRole**: Hook para verificación de roles
- **usePermissions**: Hook para verificación de permisos

### ✅ Contexto de React
- **AuthProvider**: Provider del contexto de autenticación
- **useAuthContext**: Hook para usar el contexto
- **Componentes de Protección**: ProtectedRoute, AuthOnly, GuestOnly, etc.

### ✅ Componentes de Protección
- **ProtectedRoute**: Protege rutas basado en autenticación y roles
- **AuthOnly**: Muestra contenido solo a usuarios autenticados
- **GuestOnly**: Muestra contenido solo a usuarios no autenticados
- **RoleBased**: Muestra contenido basado en roles
- **PermissionBased**: Muestra contenido basado en permisos

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ElectroMarket
VITE_APP_VERSION=1.0.0
```

### Instalación

No se requieren dependencias adicionales. El sistema usa:
- React 18 con hooks
- Axios para requests HTTP
- LocalStorage para persistencia

## 📚 Uso de la API

### 1. Configurar el AuthProvider

```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Tu aplicación aquí */}
    </AuthProvider>
  );
}
```

### 2. Usar el Hook de Autenticación

```tsx
import { useAuth } from './hooks/useAuth';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Usuario logueado exitosamente
    } catch (error) {
      // Manejar error
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Formulario de login */}
    </form>
  );
}
```

### 3. Proteger Rutas

```tsx
import { ProtectedRoute } from './contexts/AuthContext';

function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/" element={<HomePage />} />
      
      {/* Ruta protegida - requiere autenticación */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      {/* Ruta protegida - requiere rol específico */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <AdminPage />
        </ProtectedRoute>
      } />
      
      {/* Ruta protegida - múltiples roles */}
      <Route path="/vendor" element={
        <ProtectedRoute requiredRoles={['vendedor', 'admin']}>
          <VendorPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

### 4. Mostrar Contenido Condicional

```tsx
import { AuthOnly, GuestOnly, RoleBased, PermissionBased } from './contexts/AuthContext';

function Header() {
  return (
    <header>
      {/* Solo para usuarios autenticados */}
      <AuthOnly>
        <UserMenu />
      </AuthOnly>
      
      {/* Solo para usuarios no autenticados */}
      <GuestOnly>
        <LoginButton />
      </GuestOnly>
      
      {/* Solo para administradores */}
      <RoleBased roles={['admin']}>
        <AdminPanel />
      </RoleBased>
      
      {/* Solo para usuarios que pueden crear productos */}
      <PermissionBased permission="canCreateProducts">
        <CreateProductButton />
      </PermissionBased>
    </header>
  );
}
```

### 5. Verificar Roles y Permisos

```tsx
import { useRole, usePermissions } from './hooks/useAuth';

function ProductPage() {
  const { isAdmin, isVendor, hasRole } = useRole();
  const { canCreateProducts, hasCredits } = usePermissions();

  return (
    <div>
      {isAdmin() && <AdminControls />}
      {isVendor() && <VendorControls />}
      {canCreateProducts() && <CreateButton />}
      {hasCredits(5) && <BuyCreditsButton />}
    </div>
  );
}
```

## 🔄 Flujo de Autenticación

### 1. Login
```tsx
const { login } = useAuth();

await login({
  email: 'usuario@example.com',
  password: 'password123'
});
```

### 2. Registro
```tsx
const { register } = useAuth();

await register({
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@example.com',
  password: 'password123',
  tipo_usuario: 'comprador'
});
```

### 3. Logout
```tsx
const { logout } = useAuth();

await logout();
```

### 4. Cambiar Contraseña
```tsx
const { changePassword } = useAuth();

await changePassword({
  currentPassword: 'oldpassword',
  newPassword: 'newpassword123'
});
```

## 🛡️ Protección Automática

### Interceptores Axios
- **Request**: Agrega automáticamente el token JWT a todas las requests
- **Response**: Maneja automáticamente el refresh de tokens cuando expiran
- **Error**: Redirige al login cuando el refresh falla

### Persistencia
- **Tokens**: Se guardan en localStorage
- **Usuario**: Se guarda en localStorage
- **Auto-login**: Se restaura la sesión al recargar la página

### Validación
- **Token**: Se verifica la validez del token al inicializar
- **Expiración**: Se maneja automáticamente la expiración
- **Refresh**: Se renuevan los tokens automáticamente

## 🎯 Componentes Disponibles

### AuthProvider
Provee el contexto de autenticación a toda la aplicación.

### ProtectedRoute
Protege rutas basado en autenticación y roles.

```tsx
<ProtectedRoute requiredRoles={['admin']}>
  <AdminPage />
</ProtectedRoute>
```

### AuthOnly
Muestra contenido solo a usuarios autenticados.

```tsx
<AuthOnly fallback={<LoginPrompt />}>
  <UserContent />
</AuthOnly>
```

### GuestOnly
Muestra contenido solo a usuarios no autenticados.

```tsx
<GuestOnly fallback={<UserMenu />}>
  <LoginForm />
</GuestOnly>
```

### RoleBased
Muestra contenido basado en roles.

```tsx
<RoleBased roles={['admin', 'vendedor']}>
  <AdminOrVendorContent />
</RoleBased>
```

### PermissionBased
Muestra contenido basado en permisos.

```tsx
<PermissionBased permission="canCreateProducts">
  <CreateProductButton />
</PermissionBased>
```

## 🔧 Configuración Avanzada

### Personalizar Interceptores

```tsx
// En authApi.ts
private setupAxiosInterceptors(): void {
  axios.interceptors.request.use(
    (config) => {
      // Personalizar requests
      return config;
    }
  );
  
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Personalizar manejo de errores
      return Promise.reject(error);
    }
  );
}
```

### Personalizar Persistencia

```tsx
// Cambiar de localStorage a sessionStorage
private saveTokensToStorage(): void {
  if (this.tokens && this.user) {
    sessionStorage.setItem('auth_tokens', JSON.stringify(this.tokens));
    sessionStorage.setItem('auth_user', JSON.stringify(this.user));
  }
}
```

### Personalizar Validación

```tsx
// En useAuth.ts
const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.get('/api/auth/verify');
    return response.data.valid;
  } catch {
    return false;
  }
};
```

## 🐛 Debugging

### Verificar Estado de Autenticación

```tsx
import { useAuth } from './hooks/useAuth';

function DebugComponent() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  
  return (
    <div>
      <p>Autenticado: {isAuthenticated ? 'Sí' : 'No'}</p>
      <p>Cargando: {isLoading ? 'Sí' : 'No'}</p>
      <p>Usuario: {user?.email || 'Ninguno'}</p>
      <p>Error: {error || 'Ninguno'}</p>
    </div>
  );
}
```

### Logs de Desarrollo

```tsx
// En authApi.ts
private setupAxiosInterceptors(): void {
  axios.interceptors.request.use(
    (config) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Request:', config.url);
      }
      return config;
    }
  );
}
```

## 🚨 Consideraciones de Seguridad

1. **Tokens**: Se almacenan en localStorage (considera httpOnly cookies en producción)
2. **HTTPS**: Usar siempre en producción
3. **Validación**: Validar todos los inputs del usuario
4. **Sanitización**: Sanitizar datos antes de mostrar
5. **CORS**: Configurar correctamente en el backend

## 📝 Próximos Pasos

1. ✅ Implementar refresh automático de tokens
2. ✅ Agregar manejo de errores global
3. ✅ Implementar notificaciones toast
4. ✅ Agregar loading states
5. ✅ Implementar logout automático por inactividad

## 🆘 Troubleshooting

### Error: "Token inválido"
- Verificar que el JWT_SECRET sea correcto en el backend
- Verificar que el token no haya expirado
- Limpiar localStorage y volver a hacer login

### Error: "Usuario no encontrado"
- Verificar que el usuario exista en la base de datos
- Verificar que el usuario esté activo
- Verificar la conexión con el backend

### Error: "CORS"
- Verificar configuración de CORS en el backend
- Verificar que la URL de la API sea correcta
- Verificar que el frontend esté en un origen permitido

---

**🎉 ¡Sistema de autenticación frontend implementado exitosamente!**

Para más información, consulta los archivos:
- `src/api/authApi.ts` - Servicio de autenticación
- `src/hooks/useAuth.ts` - Hooks de autenticación
- `src/contexts/AuthContext.tsx` - Contexto de React
- `src/config/api.ts` - Configuración de la API
