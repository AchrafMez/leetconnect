import { useEffect, useState } from 'react';
import { RoleBadge } from '../../components/ui/RoleBadge';
import { HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';
import { adminApi, type RoleConfig } from '@/lib/api';
import { Spin } from '@/components/ui/Spin';

const PERMISSION_LABELS: Record<string, string> = {
  'users:read':       'View users',
  'users:create':     'Create users',
  'users:edit':       'Edit users',
  'users:delete':     'Delete users',
  'roles:read':       'View roles',
  'roles:create':     'Create roles',
  'roles:edit':       'Edit roles',
  'roles:delete':     'Delete roles',
  'content:read':     'View content',
  'content:create':   'Create content',
  'content:edit':     'Edit content',
  'content:delete':   'Delete content',
  'content:moderate': 'Moderate content',
};

const PERMISSION_GROUPS = [
  { label: 'Users', prefix: 'users:' },
  { label: 'Roles', prefix: 'roles:' },
  { label: 'Content', prefix: 'content:' },
];

export const RolesPage = () => {
	const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');
	
	useEffect(() => {
		async function fetchPermissions() {
			try {
				const data = await adminApi.getRoles();
				setRoles(data);
				if(data.length > 0) setSelectedId(data[0]!.id);
			} catch (error: any) {
				console.error('Failed to fetch permissions: ', error.message);
				setError(error.message || 'Failed to fetch roles');
			} finally {
				setLoading(false);
			}
		}
		
		fetchPermissions();
	}, []);
	
	if(loading) {
		return(<Spin />);
	}
	if(error) return <div className="p-8 text-destructive">{error}</div>;
	if(!roles.length) return null;

	const selectedRole = roles.find(r => r.id === selectedId) ?? roles[0];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Roles & permissions</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of what each role can do on the platform.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        <div className="space-y-3">
          {roles.map(role => {
						const isSelected = selectedId === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedId(role.id)}
                className={`w-full text-left p-4 border transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-card border-border hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <RoleBadge role={role.id as any} />
                  <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                  </span>
                </div>
                <p className={`text-xs ${isSelected ? 'text-primary/70' : 'text-muted-foreground'}`}>
                  {role.description}
                </p>
                <p className={`text-xs font-medium mt-1.5 ${isSelected ? 'text-primary' : 'text-muted-foreground/40'}`}>
                  {role.permissions.length} permissions
                </p>
              </button>
            );
          })}
        </div>

        <div className="col-span-2 bg-card border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedRole?.label} permissions</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedRole?.description}</p>
            </div>
            <span className="text-2xl font-bold text-primary">{selectedRole?.permissions.length}</span>
          </div>

          <div className="divide-y divide-border">
            {PERMISSION_GROUPS.map(group => {
              const allGroupPerms = Object.keys(PERMISSION_LABELS).filter(p =>
                p.startsWith(group.prefix)
              );

              return (
                <div key={group.label} className="px-6 py-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {allGroupPerms.map(perm => {
                      const granted = selectedRole?.permissions.includes(perm);
                      return (
                        <div
                          key={perm}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                            granted ? 'bg-secondary text-foreground' : 'text-muted-foreground/30'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            granted
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-background border border-border'
                          }`}>
                            {granted
                              ? <HiOutlineCheck className="w-2.5 h-2.5 text-primary" />
                              : <HiOutlineXMark className="w-2.5 h-2.5 text-muted-foreground/30" />
                            }
                          </span>
                          {PERMISSION_LABELS[perm] ?? perm}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-border bg-background/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              All roles comparison
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground font-medium pb-2 pr-4">Permission</th>
                  {roles.map(r => (
                    <th
                      key={r.id}
                      className={`text-center pb-2 px-2 font-medium ${
                        r.id === selectedId ? 'text-primary' : 'text-muted-foreground/40'
                      }`}
                    >
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {Object.keys(PERMISSION_LABELS).map(perm => (
                  <tr key={perm}>
                    <td className="py-1.5 pr-4 text-muted-foreground">
                      {PERMISSION_LABELS[perm]}
                    </td>
                    {roles.map(r => {
                      const has = r.permissions.includes(perm);
                      return (
                        <td key={r.id} className="py-1.5 px-2 text-center">
                          {has
                            ? <span className={`font-bold ${r.id === selectedId ? 'text-primary' : 'text-muted-foreground/40'}`}>✓</span>
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