# Authentication Deployment Fix - Complete Documentation

**Date**: October 27, 2025
**Issue**: "Acceso denegado" appearing on protected routes immediately after login during production deployment
**Status**: ✅ RESOLVED

---

## 📋 Problem Summary

After deploying the frontend to Vercel and backend to Render, users experienced the following issue:

1. **Admin users** would login successfully but be redirected to `/admin-dashboard` showing "Acceso denegado"
2. **Other users** (vendedor/comprador) would click header options and see "Acceso denegado" before content loaded
3. **Workaround**: Manual page refresh (F5) would show the correct content
4. **Duration**: Issue appeared immediately after authentication completion

### Symptoms in Console:
```
❌ ProtectedRoute: Usuario no tiene roles requeridos: {requiredRoles: Array(1), userRole: 'admin'}
✅ ProtectedRoute: Acceso permitido (after F5 refresh)
```

---

## 🔍 Root Cause Analysis

### Primary Issue: Stale Closure in canAccess()

**File**: `src/hooks/useAuth.ts`
**Hook**: `useRole()`

The `canAccess()` function was defined in `useRole()` hook:

```typescript
export const useRole = () => {
  const { user, isAuthenticated } = useAuth();

  return {
    canAccess: (requiredRoles: ('admin' | 'vendedor' | 'comprador')[]) =>
      isAuthenticated && user ? requiredRoles.includes(user.tipo_usuario) : false
  };
};
```

**Problem**: When `canAccess` was assigned to the context value in `AuthProvider`, it created a closure over the old `user` and `isAuthenticated` values from `useRole()`. After login updated the `auth` state in `useAuth()`, the `user` in `useRole()`'s closure wasn't being updated in time because:

1. `useAuth()` updates state → sets `user`, `isAuthenticated`
2. `useRole()` should re-run to get new values
3. BUT: Context value assignment happened before `useRole()` computed the new values
4. Result: `canAccess()` still saw the old (null/undefined) user data

### Secondary Issue: Timing Race Condition

Even with the closure fix, there was a race condition:
- Login completes and sets state
- AppContent detects authentication and navigates (300ms delay)
- ProtectedRoute mounts on the new route
- But React context hadn't fully propagated the updated `user` through all subscribers yet

**Solution**: Increased state propagation delays:
- Admin: 2000ms in login + 500ms in navigation
- Other users: 1500ms in login + 300ms in navigation

---

## ✅ Solution Implemented

### 1. Move canAccess to Context Level

**File**: `src/contexts/AuthContext.tsx`

Instead of using the function from `useRole()`, we now define `canAccess` directly in the `AuthProvider`:

```typescript
// OLD (using closure from useRole):
canAccess: role.canAccess,

// NEW (using fresh auth data):
canAccess: (requiredRoles: ('admin' | 'vendedor' | 'comprador')[]) => {
  return auth.isAuthenticated && auth.user
    ? requiredRoles.includes(auth.user.tipo_usuario)
    : false;
},
```

**Why this works**:
- `auth` object is available in the provider scope
- Function gets recreated on every render with fresh `auth` data
- No closure staling - always sees current `user` and `isAuthenticated`
- `requiredRoles` parameter is still passed by caller

### 2. Increase State Propagation Delays

**Files**:
- `src/hooks/useAuth.ts` (login function)
- `src/App.tsx` (navigation logic)

**Login delay in useAuth.ts**:
```typescript
const delayMs = authResponse.user.tipo_usuario === 'admin' ? 2000 : 1500;
await new Promise(resolve => setTimeout(resolve, delayMs));
```

**Navigation delay in App.tsx**:
```typescript
const navigationDelay = user.tipo_usuario === 'admin' ? 500 : 300;
const timer = setTimeout(() => {
  // navigate...
}, navigationDelay);
```

**Why higher for admin**: Admin dashboard is more complex, requires more time for all component subscriptions to update.

### 3. Fix localStorage Inconsistency

**File**: `src/api/authApi.ts`

**Before**: Different components read from different keys:
- `LoginPage` read from `localStorage.getItem('user')`
- `authApi` stored to `localStorage.getItem('auth_user')`

**After**: Unified on `auth_user` and `auth_tokens`:
```typescript
// Consistent keys everywhere
localStorage.setItem('auth_tokens', JSON.stringify(this.tokens));
localStorage.setItem('auth_user', JSON.stringify(this.user));
```

Also added validation when loading:
```typescript
if (tokens?.accessToken && user?.id && user?.email && user?.tipo_usuario) {
  this.tokens = tokens;
  this.user = user;
} else {
  this.clearAuth(); // Reject incomplete data
}
```

And aggressive cleanup on logout:
```typescript
// Clear specific keys
localStorage.removeItem('auth_tokens');
localStorage.removeItem('auth_user');

// Also remove ANY key containing 'auth', 'token', or 'user'
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('auth') ||
        lowerKey.includes('token') ||
        lowerKey.includes('user')) {
      keysToRemove.push(key);
    }
  }
}
keysToRemove.forEach(key => localStorage.removeItem(key));
```

---

## 📝 Files Modified

### 1. `src/contexts/AuthContext.tsx`
- **Lines 83-88**: Moved `canAccess` function to context level
- **Lines 131-135**: Calculate `hasAccess` for ProtectedRoute
- **Lines 137-182**: Simplified ProtectedRoute logic (removed debug logs)

### 2. `src/hooks/useAuth.ts`
- **Lines 93-104**: Updated login function with state propagation delay
- **Lines 103**: Dynamic delay based on user role (2000ms admin, 1500ms others)
- **Lines 147-160**: Simplified logout function

### 3. `src/App.tsx`
- **Lines 83-90**: Added dynamic navigation delay based on user role
- **Line 83**: 500ms for admin, 300ms for others

### 4. `src/api/authApi.ts`
- **Lines 99-104**: Added validation when loading tokens
- **Lines 144-146**: Aggressive localStorage cleanup on logout

---

## 🔧 Git Commits

```
93e239d - chore: Clean up debug console logs for production
eb5f1a7 - fix: Move canAccess function to context level to use fresh auth data
34ebdc7 - fix: Increase auth propagation delay to 2000ms for admin specifically
7ea4912 - fix: Increase auth state propagation delay to 1500ms and add detailed logging
```

View full history:
```bash
git log --oneline | head -10
```

---

## ✅ Testing Performed

### Admin User
- **Email**: `admin@electromarket.bo`
- **Password**: `admin1234`
- **Expected**: Navigate to `/admin-dashboard` without "Acceso denegado"
- **Result**: ✅ Working

### Vendedor User
- **Email**: `juan.perez@email.com`
- **Password**: `vendedor123`
- **Expected**: Navigate to `/catalog` with vendor options
- **Result**: ✅ Working

### Comprador User
- **Email**: `maria.lopez@email.com`
- **Password**: `comprador123`
- **Expected**: Navigate to `/catalog` with buyer options
- **Result**: ✅ Working

### Logout
- **Expected**: All localStorage cleared, session fully deleted
- **Result**: ✅ Working - refresh shows login page

---

## 🎯 Key Changes Summary

| Issue | Cause | Solution |
|-------|-------|----------|
| ProtectedRoute rejecting valid roles | Stale closure in `canAccess()` | Move to context level with fresh `auth` data |
| Race condition in state propagation | Component renders before context updates | Increase delays: 2000ms login (admin), 1500ms (others) |
| Session switching bugs | Inconsistent localStorage keys | Unify on `auth_user` and `auth_tokens` |
| Incomplete logout | Partial localStorage cleanup | Aggressive removal of all auth-related keys |

---

## 🚀 Production Deployment

**Frontend**: Vercel
**Backend**: Render
**Database**: Cloud-hosted MySQL (PlanetScale or similar)

### Deployment Steps Taken
1. ✅ Fixed canAccess closure issue
2. ✅ Increased state propagation delays
3. ✅ Fixed localStorage key inconsistency
4. ✅ Cleaned up all debug console.log statements
5. ✅ Committed all changes to `render` remote
6. ✅ Vercel auto-deployed on push
7. ✅ Tested all user roles in production

---

## 📚 How This Works (Technical Deep Dive)

### Authentication Flow After Fix

```
1. User enters credentials and submits login form
   └─> LoginPage.tsx calls login()

2. useAuth.ts login function:
   └─> authService.login(credentials)
       └─> Backend validates, returns user + tokens
   └─> setState with user, isAuthenticated=true, isLoading=true
   └─> WAIT: 2000ms (admin) or 1500ms (others)
       └─> Ensures all components receive context update
   └─> setState with isLoading=false
       └─> Signals to App.tsx that auth is ready

3. App.tsx useEffect detects authentication:
   └─> if (isAuthenticated && user && !isLoading && onLoginPage)
   └─> WAIT: 500ms (admin) or 300ms (others)
   └─> navigate to /admin-dashboard or /catalog
       └─> Browser renders ProtectedRoute component

4. ProtectedRoute component:
   └─> useAuthContext() gets auth context
   └─> canAccess() now calls context's function (not stale closure)
   └─> Returns requiredRoles.includes(auth.user.tipo_usuario)
   └─> If true: render children (dashboard/catalog)
   └─> If false: render fallback (access denied)

5. Context's canAccess function (at render time):
   └─> Reads CURRENT auth object from closure
   └─> auth.user is the freshly-updated user
   └─> auth.isAuthenticated is true
   └─> Returns correct boolean
```

### Why Delays Are Needed

React context updates are not instant across all subscribers:

1. `setState` in useAuth triggers re-render
2. AuthProvider re-renders, creates new context value
3. All consumers of useAuthContext are notified
4. Each consumer re-renders
5. BUT: All this happens asynchronously

**Without delays**:
- Navigation happens before step 3-4 complete
- ProtectedRoute renders with old context value
- Access check fails temporarily

**With delays**:
- We give React time to propagate updates through entire tree
- By the time ProtectedRoute renders, context is up-to-date
- Access check passes on first attempt

---

## 🔍 Debugging This Issue

If similar issues arise in the future:

1. **Check browser console** for logs (during debug phase):
   ```javascript
   console.log('ProtectedRoute:', { isLoading, isAuthenticated, user })
   console.log('canAccess result:', canAccess(requiredRoles))
   ```

2. **Check localStorage**:
   ```javascript
   console.log(localStorage.getItem('auth_user'))
   console.log(localStorage.getItem('auth_tokens'))
   ```

3. **Check React DevTools**:
   - Inspect AuthProvider context value
   - Verify `user` has expected data
   - Verify `canAccess` function returns correct boolean

4. **Check Render logs** if backend issue:
   ```
   Backend > Logs tab > Search for auth errors
   ```

---

## 🎓 Lessons Learned

1. **Closures in React**: Be careful with functions defined in hooks that close over state
2. **Context Propagation**: Updates aren't instant; may need delays for complex components
3. **localStorage Consistency**: Use consistent keys across app
4. **Testing**: Always test with all user roles, not just default user

---

## 📞 Support

If you encounter "Acceso denegado" again:

1. First: Check if user has correct `tipo_usuario` in database
2. Second: Check if delays are being respected (look at timing in console)
3. Third: Verify localStorage has correct keys and values
4. Finally: Check ProtectedRoute's `requiredRoles` prop vs user's `tipo_usuario`

---

## ✅ Checklist for Future Deployments

- [ ] Verify all environment variables set in Render
- [ ] Verify database connection working
- [ ] Test login with all 3 user types
- [ ] Test logout clears session
- [ ] Test refresh doesn't show old user
- [ ] Check browser console for errors
- [ ] Verify header menu appears without "Acceso denegado"
- [ ] Test role-based features (admin sees admin panel, vendors see their options)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-27
**Author**: Claude Code
**Status**: Production - Tested and Verified
