import type { Role, Permission } from '../types';

export const ROLE_HIERARCHY: Role[] = ['guest', 'user', 'moderator', 'admin'];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  guest: [
    'content:read',
  ],
  user: [
    'content:read', 'content:create', 'content:edit',
  ],
  moderator: [
    'content:read', 'content:create', 'content:edit', 'content:delete',
    'content:moderate',
    'users:read',
    'jobs:read', 'jobs:moderate',
  ],
  admin: [
    'users:read', 'users:create', 'users:edit', 'users:delete',
    'roles:read', 'roles:create', 'roles:edit', 'roles:delete',
    'content:read', 'content:create', 'content:edit', 'content:delete', 'content:moderate',
    'jobs:read', 'jobs:delete', 'jobs:moderate',
  ],
};

export const ROLE_META: Record<Role, { label: string; color: string; bg: string; description: string }> = {
  admin:     { label: 'Admin',     color: 'text-primary',          bg: 'bg-primary/10 border-primary/30',        description: 'Full system access' },
  moderator: { label: 'Moderator', color: 'text-foreground',       bg: 'bg-secondary border-border-hover',       description: 'Content & user oversight' },
  user:      { label: 'User',      color: 'text-muted-foreground', bg: 'bg-secondary border-border',             description: 'Standard platform access' },
  guest:     { label: 'Guest',     color: 'text-muted-foreground', bg: 'bg-background border-border',            description: 'Read-only access' },
};

export function getRoleRank(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role);
}
export function canAccessMinRole(userRole: Role, minRole: Role): boolean {
  return getRoleRank(userRole) >= getRoleRank(minRole);
}
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}