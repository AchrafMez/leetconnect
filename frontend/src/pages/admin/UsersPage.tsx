import { useState } from 'react';
import { CanAccess } from '../../components/CanAccess';
import { RoleBadge, StatusBadge } from '../../components/ui/RoleBadge';
import { MOCK_USERS } from '../../lib/mockData';
import { ROLE_META } from '../../lib/permissions';
import type { User, Role } from '../../types';
import { HiOutlineMagnifyingGlass, HiOutlineUserMinus } from 'react-icons/hi2';

const ALL_ROLES: Role[] = ['admin', 'moderator', 'user', 'guest'];

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  function handleRoleChange(userId: string, newRole: Role) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  }
  function handleStatusToggle(userId: string) {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
    ));
  }
  function handleDelete(userId: string) {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setDeleteConfirm(null);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage platform members and their access levels.</p>
      </div>

      
      <div className="grid grid-cols-4 gap-4 mb-8">
        {ALL_ROLES.map(role => {
          const count    = users.filter(u => u.role === role).length;
          const isActive = roleFilter === role;
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(prev => prev === role ? 'all' : role)}
              className={`p-4 border text-left transition-all ${
                isActive
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-card border-border hover:border-border-hover'
              }`}
            >
              <p className={`text-2xl font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>{count}</p>
              <p className={`text-xs mt-0.5 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {ROLE_META[role].label}s
              </p>
            </button>
          );
        })}
      </div>

      
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as Role | 'all')}
          className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        >
          <option value="all">All roles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
        </select>
        <span className="ml-auto text-sm font-semibold text-muted-foreground">{filtered.length} users</span>
      </div>

      
      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
              <th className="text-right px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-secondary/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <CanAccess permission="users:edit" fallback={<RoleBadge role={user.role} />}>
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value as Role)}
                      className="text-xs font-medium border rounded-full px-2.5 py-1 bg-foreground/10 text-foreground border-foreground/30 focus:outline-none cursor-pointer"
                    >
                      {ALL_ROLES.map(r => (
                        <option key={r} value={r} className="bg-card text-foreground">{ROLE_META[r].label}</option>
                      ))}
                    </select>
                  </CanAccess>
                </td>
                <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CanAccess permission="users:edit">
                      <button
                        onClick={() => handleStatusToggle(user.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.status === 'active'
                            ? 'text-amber-400 hover:bg-amber-400/10'
                            : 'text-primary hover:bg-primary/10'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </CanAccess>
                    <CanAccess permission="users:delete">
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(user.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-destructive hover:bg-destructive/80 transition-colors">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button
													title='delete user'
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <HiOutlineUserMinus className='w-4 h-4' />

                        </button>
                      )}
                    </CanAccess>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">No users match your search.</div>
        )}
      </div>
    </div>
  );
}