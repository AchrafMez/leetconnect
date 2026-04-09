import type { Role } from '../../types';
import { ROLE_META } from '../../lib/permissions';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md';
}

export const RoleBadge = ({ role, size = 'md' }: RoleBadgeProps) => {
  const meta = ROLE_META[role];
  return (
    <span className={`
      inline-flex items-center border rounded-full font-medium tracking-wide
      ${meta.bg} ${meta.color}
      ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}
    `}>
      {meta.label}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'active' | 'suspended' | 'pending';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active:    'bg-primary/10 text-primary border-primary/20',
    suspended: 'bg-destructive/10 text-destructive border-destructive/20',
    pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  const dotStyles = {
    active:    'bg-primary',
    suspended: 'bg-destructive',
    pending:   'bg-amber-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full text-xs px-2.5 py-1 font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}