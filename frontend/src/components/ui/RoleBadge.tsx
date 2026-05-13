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
  status: 'active' | 'suspended';
}

interface JobStatusBadgeProps {
	jobStatus: 'active' | 'flagged' | 'closed'
}

export function JobStatusBadge({ jobStatus }: JobStatusBadgeProps) {
  const styles = {
    active:    'bg-primary/15 text-primary border-primary/15',
    flagged: 'bg-destructive/15 text-destructive border-destructive/15',
    closed:   'text-muted-foreground border-border bg-secondary/15',
  };
  const dotStyles = {
    active:    'bg-primary',
    flagged: 'bg-destructive',
    closed:   'bg-muted-foreground',
  };
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full text-xs px-2 py-1 font-medium ${styles[jobStatus]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[jobStatus]}`} />
      {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
    </span>
  );
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active:    'bg-primary/15 text-primary border-primary/15',
    suspended: 'bg-destructive/15 text-destructive border-destructive/15',
  };
  const dotStyles = {
    active:    'bg-primary',
    suspended: 'bg-destructive',
  };
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full text-xs px-2 py-1 font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
