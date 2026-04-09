import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role, Permission } from '../types';

interface CanAccessProps {
  children: ReactNode;
  fallback?: ReactNode;
  role?: Role;
  roles?: Role[];
  permission?: Permission;
  minRole?: Role;
}

export function CanAccess({ children, fallback = null, role, roles, permission, minRole }: CanAccessProps) {
  const { hasRole, hasPermission, canAccess } = useAuth();

  let allowed = true;

  if (role) allowed = allowed && hasRole(role);
  if (roles) allowed = allowed && hasRole(roles);
  if (permission) allowed = allowed && hasPermission(permission);
  if (minRole) allowed = allowed && canAccess(minRole);

  return allowed ? <>{children}</> : <>{fallback}</>;
}


interface ProtectedRouteProps {
  children: ReactNode;
  role?: Role;
  roles?: Role[];
  permission?: Permission;
  minRole?: Role;
  redirectTo?: string;
}

export function ProtectedRoute({ children, role, roles, permission, minRole, redirectTo = '/403'}: ProtectedRouteProps) {
  const { user, isLoading, hasRole, hasPermission, canAccess } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let allowed = true;
  if (role) allowed = allowed && hasRole(role);
  if (roles) allowed = allowed && hasRole(roles);
  if (permission) allowed = allowed && hasPermission(permission);
  if (minRole)allowed = allowed && canAccess(minRole);

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}