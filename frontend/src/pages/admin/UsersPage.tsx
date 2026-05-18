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
import { useAuth } from '@/context/userContext';
import Avatar from '@/components/ui/Avatar';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem
} from '@/components/ui/select';

const ALL_ROLES: Role[] = ['ADMIN', 'MODERATOR', 'USER'];

export const UsersPage = () => {
	const { user } = useAuth();
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
			try {
				const params: any = {};
				if(debouncedSearch) params.search = debouncedSearch;
				if(roleFilter !== 'all') params.role = roleFilter;

				const data = await adminApi.getUsers(params);
				setUsers(data);
			} catch (error: any) {
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
				<Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value as Role | 'all')}>
					<SelectTrigger className="w-[180px] bg-input border-border text-muted-foreground">
						<SelectValue placeholder="Select a role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All roles</SelectItem>
						{ALL_ROLES.map(r => (
							<SelectItem key={r} value={r}>
								{ROLE_META[r].label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
            {users.map(u => (
              <tr key={u.id} className="hover:bg-secondary/30 transition-colos group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
										<Avatar
											name={[u.firstname, u.lastname].filter(Boolean).join(' ')}
											image={u.avatar}
											size='xs'>
										</Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{`${u.firstname} ${u.lastname}`}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {u.role === 'ADMIN' || user?.id === u.id ? (
                    <RoleBadge role={u.role} />
                  ) : (
                    <CanAccess permission="users:edit" fallback={<RoleBadge role={u.role} />}>
                      <Select value={u.role} onValueChange={(value: string) => handleRoleChange(u.id, value as Role)}>
                        <SelectTrigger className="h-6 text-xs font-medium border rounded-full px-1.5 py-0 bg-foreground/10 text-foreground border-foreground/30 focus:outline-none cursor-pointer w-fit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_ROLES.map(r => (
                            <SelectItem key={r} value={r}>
                              {ROLE_META[r].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CanAccess>
                  )}
                </td>
                <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										{u.role !== 'ADMIN' && user?.id !== u.id && (
                    <CanAccess permission="users:edit">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.status)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          u.status === 'active'
                            ? 'text-amber-400 hover:bg-amber-400/10'
                            : 'text-primary hover:bg-primary/10'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </CanAccess>
										)}
										{u.role !== 'ADMIN' && user?.id !== u.id && (
											<CanAccess permission="users:delete">
												{deleteConfirm === u.id ? (
													<div className="flex items-center gap-1">
														<button onClick={() => handleDelete(u.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-destructive hover:bg-destructive/80 transition-colors">Confirm</button>
														<button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
													</div>
												) : (
													<button
														title='delete user'
														onClick={() => setDeleteConfirm(u.id)}
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
							<Button className="bg-primary hover:bg-primary/80"
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