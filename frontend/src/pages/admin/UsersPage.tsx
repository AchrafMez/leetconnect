import { useEffect, useState } from 'react';
import { CanAccess } from '../../components/CanAccess';
import { RoleBadge, StatusBadge } from '../../components/ui/RoleBadge';
import { ROLE_META } from '../../lib/permissions';
import type { Role } from '../../types';
import { HiOutlineMagnifyingGlass, HiOutlineUserMinus } from 'react-icons/hi2';
import { adminApi, User } from '@/lib/api';
import { Spin } from '@/components/ui/Spin';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';

const ALL_ROLES: Role[] = ['ADMIN', 'MODERATOR', 'USER'];

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [roleConfirm, setRoleConfirm] = useState<{ userId: string; newRole: Role } | null>(null);
	const debouncedSearch = useDebounce(search, 500);

	useEffect(() => {
		async function fetchUsers() {
			// setLoading(true);
			try {
				const params: any = {};
				if(debouncedSearch) params.search = debouncedSearch;
				if(roleFilter !== 'all') params.role = roleFilter;

				const data = await adminApi.getUsers(params);
				setUsers(data);
			} catch (error: any) {
				console.error("Failed to fetch users: ", error.message);
				setError(error.message || "Failed to fetch users");
			} finally {
				setLoading(false);
			}
		}
		fetchUsers();
	}, [debouncedSearch, roleFilter]);

	useEffect(() => {
		async function fetchAllUsers() {
			try {
				const data = await adminApi.getUsers();
				setAllUsers(data);
			} catch (error: any) {
				console.error('Failed to fetch users: ', error.message);
				setError(error.message || "Failed to fetch users");
			}
		}
		fetchAllUsers();
	}, [])

  async function handleRoleChange(userId: string, newRole: Role) {
		// Show confirmation modal when promoting to ADMIN
		if (newRole === 'ADMIN') {
			setRoleConfirm({ userId, newRole });
			return;
		}

		// For other roles, update immediately
		await applyRoleChange(userId, newRole);
  }

	async function applyRoleChange(userId: string, newRole: Role) {
		const previousUsers = users;
		const previousAllUsers = allUsers;
		
		setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole }: u));
		setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole }: u));

		try {
			const updated = await adminApi.updateUserRole(userId, newRole);
			setUsers(prev => prev.map(u => u.id === userId ? updated : u));
			setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
		} catch (error: any) {
			setUsers(previousUsers);
			setAllUsers(previousAllUsers);
			alert(error.message);
		}
	}
  async function handleStatusToggle(userId: string, currentStatus: string) {
		const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
		try {
			const updated = await adminApi.updateUserStatus(userId, newStatus);
			setUsers(prev => prev.map(u => u.id === userId ? updated : u));
			setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
		} catch (error: any) {
			alert(error.message);
		}
  }
  async function handleDelete(userId: string) {
		try {
			await adminApi.deleteUser(userId);
			setUsers(prev => prev.filter(u => u.id !== userId));
			setAllUsers(prev => prev.filter(u => u.id !== userId));
		} catch (error: any) {
			alert(error.message);
		}
    setDeleteConfirm(null);
  }

	if (loading) {
		return(<Spin />)
	}
  if (error) return <div className="p-8 text-destructive">{error}</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage platform members and their access levels.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {ALL_ROLES.map(role => {
          const count = allUsers.filter(u => u.role === role).length;
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
        <span className="ml-auto text-sm font-semibold text-muted-foreground">{users.length} users</span>
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
            {users.map(user => (
              <tr key={user.id} className="hover:bg-secondary/30 transition-colos group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0 overflow-hidden">
											{user.avatar ? (
												<img 
													src={user.avatar} 
													alt={`${user.firstname}'s avatar`} 
													className="w-full h-full object-cover"
													onError={(e) => { e.currentTarget.style.display = 'none'; }}
												/>
											) : (
												<span>{`${user.firstname[0]}${user.lastname[0]}`}</span>
											)}
										</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{`${user.firstname} ${user.lastname}`}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'ADMIN' ? (
                    <RoleBadge role={user.role} />
                  ) : (
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
                  )}
                </td>
                <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										{user.role !== 'ADMIN' && (
                    <CanAccess permission="users:edit">
                      <button
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.status === 'active'
                            ? 'text-amber-400 hover:bg-amber-400/10'
                            : 'text-primary hover:bg-primary/10'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </CanAccess>
										)}
										{user.role !== 'ADMIN' && (
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
										)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">No users match your search.</div>
        )}
      </div>

      {roleConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-2">Promote to Admin?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You're about to promote <span className="font-semibold text-foreground">{users.find(u => u.id === roleConfirm.userId)?.firstname} {users.find(u => u.id === roleConfirm.userId)?.lastname}</span> to <span className="font-semibold text-foreground">ADMIN</span>.
            </p>
            <p className="text-xs text-amber-400 mb-6 bg-amber-400/10 border border-amber-400/30 rounded p-3">
              ⚠️ Admins have full system access and can manage all users and settings. This action cannot be easily undone.
            </p>
            <div className="flex gap-3">
							<Button onClick={() => setRoleConfirm(null)}
									className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
								Cancel
							</Button>
							<Button className="bg-primary hover:bg-primary/50"
								onClick={() => {
									if(roleConfirm) {
										applyRoleChange(roleConfirm.userId, roleConfirm.newRole);
										setRoleConfirm(null);
									}
							}}>
								Confirm Promotion
							</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}