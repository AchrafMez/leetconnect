import type { Role, Permission } from '../types';

export const ROLE_HIERARCHY: Role[] = ['USER', 'MODERATOR', 'ADMIN'];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [
    'content:read', 'content:create', 'content:edit',
  ],
  MODERATOR: [
    'content:read', 'content:create', 'content:edit', 'content:delete',
    'content:moderate',
    'users:read',
  ],
  ADMIN: [
    'users:read', 'users:create', 'users:edit', 'users:delete',
    'roles:read', 'roles:create', 'roles:edit', 'roles:delete',
    'content:read', 'content:create', 'content:edit', 'content:delete', 'content:moderate',
  ],
};

export const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  ADMIN:     { label: 'Admin', color: 'text-primary', bg: 'border-primary/30' },
  MODERATOR: { label: 'Moderator', color: 'text-foreground', bg: 'border-border-hover',},
  USER:      { label: 'User', color: 'text-muted-foreground', bg: 'border-border', },
};

export const getRoleRank = (role: Role): number => {
  return ROLE_HIERARCHY.indexOf(role);
}
export const canAccessMinRole = (userRole: Role, minRole: Role): boolean => {
  return getRoleRank(userRole) >= getRoleRank(minRole);
}
export const hasPermission = (userRole: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}
