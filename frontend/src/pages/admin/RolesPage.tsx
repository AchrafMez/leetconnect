import { useState } from 'react';
import { MOCK_ROLES } from '../../lib/mockData';
import { ROLE_META, ROLE_PERMISSIONS } from '../../lib/permissions';
import { RoleBadge } from '../../components/ui/RoleBadge';
import type { Role, Permission } from '../../types';

const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: 'Users',   permissions: ['users:read','users:create','users:edit','users:delete'] },
  { label: 'Roles',   permissions: ['roles:read','roles:create','roles:edit','roles:delete'] },
  { label: 'Content', permissions: ['content:read','content:create','content:edit','content:delete','content:moderate'] },
];
const ROLES: Role[] = ['admin', 'moderator', 'user', 'guest'];
const PERMISSION_LABELS: Record<Permission, string> = {
  'users:read':'View users','users:create':'Create users','users:edit':'Edit users','users:delete':'Delete users',
  'roles:read':'View roles','roles:create':'Create roles','roles:edit':'Edit roles','roles:delete':'Delete roles',
  'content:read':'View content','content:create':'Create content','content:edit':'Edit content',
  'content:delete':'Delete content','content:moderate':'Moderate content',
};

export const RolesPage = () => {
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const permissions = ROLE_PERMISSIONS[selectedRole];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Roles & permissions</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of what each role can do on the platform.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        <div className="space-y-3">
          {ROLES.map(role => {
            const d = MOCK_ROLES.find(r => r.name === role)!;
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-4 border transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-card border-border hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <RoleBadge role={role} />
                  <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {d.userCount} {d.userCount === 1 ? 'user' : 'users'}
                  </span>
                </div>
                <p className={`text-xs ${isSelected ? 'text-primary/70' : 'text-muted-foreground'}`}>
                  {ROLE_META[role].description}
                </p>
                <p className={`text-xs font-medium mt-1.5 ${isSelected ? 'text-primary' : 'text-muted-foreground/40'}`}>
                  {ROLE_PERMISSIONS[role].length} permissions
                </p>
              </button>
            );
          })}
        </div>

        
        <div className="col-span-2 bg-card border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{ROLE_META[selectedRole].label} permissions</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ROLE_META[selectedRole].description}</p>
            </div>
            <span className="text-2xl font-bold text-primary">{permissions.length}</span>
          </div>

          <div className="divide-y divide-border">
            {PERMISSION_GROUPS.map(group => (
              <div key={group.label} className="px-6 py-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.permissions.map(perm => {
                    const granted = permissions.includes(perm);
                    return (
                      <div key={perm} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${granted ? 'bg-secondary text-foreground' : 'text-muted-foreground/30'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${granted ? 'bg-primary/10 border border-primary/30' : 'bg-background border border-border'}`}>
                          {granted
                            ? <svg className="w-2.5 h-2.5 text-primary" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                            : <svg className="w-2.5 h-2.5 text-muted-foreground/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          }
                        </span>
                        {PERMISSION_LABELS[perm]}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        
          <div className="px-6 py-4 border-t border-border bg-background/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All roles comparison</p>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground font-medium pb-2 pr-4">Permission</th>
                  {ROLES.map(r => (
                    <th key={r} className={`text-center pb-2 px-2 font-medium ${r === selectedRole ? 'text-primary' : 'text-muted-foreground/40'}`}>
                      {ROLE_META[r].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {PERMISSION_GROUPS.flatMap(g => g.permissions).map(perm => (
                  <tr key={perm}>
                    <td className="py-1.5 pr-4 text-muted-foreground">{PERMISSION_LABELS[perm]}</td>
                    {ROLES.map(r => {
                      const has = ROLE_PERMISSIONS[r].includes(perm);
                      return (
                        <td key={r} className="py-1.5 px-2 text-center">
                          {has
                            ? <span className={`font-bold ${r === selectedRole ? 'text-primary' : 'text-muted-foreground/40'}`}>✓</span>
                            : <span className="text-border-hover">–</span>
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}