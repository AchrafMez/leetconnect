import { useAuth } from '../../context/userContext';
import { CanAccess } from '../../components/CanAccess';
import { JobStatusBadge, RoleBadge, StatusBadge } from '../../components/ui/RoleBadge';
import type { Role, Job } from '../../types';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBookmarkSlash,
				 HiOutlineCheckCircle,
				 HiOutlineMinusCircle,
				 HiOutlineShieldCheck,
				 HiOutlineUsers } from 'react-icons/hi2'
import { useEffect, useState } from 'react';
import { adminApi, User } from '@/lib/api';
import { Spin } from '@/components/ui/Spin';
import { StatCard } from '@/components/ui/StatCard';
import Avatar from '@/components/ui/Avatar';

const ROLES: Role[] = ['ADMIN', 'MODERATOR', 'USER'];

export const DashboardPage = () => {
  const { user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	function manageUser() {navigate('/admin/users');}
	function manageJobs() {navigate('/admin/jobs');}

	useEffect(() => {
		async function fetchDashboardData() {
			try {
				setLoading(true);
				const [fetchedUsers, fetchedJobs] = await Promise.all([
					adminApi.getUsers(),
					adminApi.getJobs()
				])
				setUsers(fetchedUsers);
				setJobs(fetchedJobs);
			} catch(error: any) {
				console.error("Failed to fetch dashboard data: ", error);
				setError(error.message || "Faled to fetch dashboard data");
			} finally {
				setLoading(false);
			}
		}
		fetchDashboardData();
	}, [])

	const recentJobs = [...jobs].sort((a, b) => {
		if(a.status === 'flagged' && b.status !== 'flagged') return -1;
		if(b.status === 'flagged' && a.status !== 'flagged') return 1;
		return 0;
	}).slice(0, 5);

	const flaggedCount = jobs.filter(j => j.status === 'flagged').length;

	if (loading){
		return(<Spin />)
	}
  if (error) return <div className="text-destructive">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.username}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your platform today.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
				<StatCard 
					label='Total Users'
					value={users.length}
					sub={`↑ ${users.filter(x => x.status === 'active').length} active`}
					iconBg='bg-primary/10'
					icon={<HiOutlineUsers className="h-5 w-5 text-primary" />} />
				
				<StatCard 
					label='Active'
					value={users.filter(x => x.status === 'active').length}
					sub={`${Math.round((users.filter(x => x.status === 'active').length / users.length) * 100)}% of total`}
					subColor= 'text-amber-400'
    			iconBg= 'bg-blue-500/10'
    			icon= {<HiOutlineCheckCircle className="w-5 h-5 text-blue-400" />} />
				
				<StatCard 
					label= 'Roles'
    			value= '3'
    			sub=  'admin · mod · user'
    			subColor= 'text-muted-foreground'
    			iconBg= 'bg-purple-500/10'
    			icon= {<HiOutlineShieldCheck className="w-5 h-5 text-purple-400" />} />
				
				<StatCard 
					label= 'Suspended'
    			value= {users.filter(x => x.status === 'suspended').length}
    			sub= 'accounts restricted'
    			subColor= 'text-muted-foreground'
    			iconBg= 'bg-destructive/10'
    			icon= {<HiOutlineMinusCircle className="w-5 h-5 text-destructive" />} />
      </div>

      <CanAccess minRole="MODERATOR">
        <div className="bg-card border border-border overflow-hidden mb-6">
          <div className="px-6 py-4 flex items-center justify-between border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Users</h2>
            <a href="/admin/users" className="text-xs text-primary hover:text-primary-light font-medium transition-colors">
              View all
            </a>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.slice(0, 5).map(u => (
                <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-3.5">
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
                  <td className="px-6 py-3.5"><RoleBadge role={u.role} /></td>
                  <td className="px-6 py-3.5 text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-3.5">
										<StatusBadge status={u.status} />
                  </td>
                  <td className="px-6 py-3.5 text-right">
										<CanAccess permission='users:edit'>
											<button onClick={manageUser} className="text-xs text-muted-foreground hover:text-primary font-medium transition-colors">
                      	Manage
                    	</button>

										</CanAccess>
										{/* {u.role === 'ADMIN'  && (
										)} */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CanAccess>

			<CanAccess minRole="MODERATOR">
			 <div className='bg-card border border-border overflow-hidden mb-6'>
				<div className='px-6 py-4 flex items-center justify-between border-b border-border'>
					<div className='flex items-center gap-3'>
						<h2 className='text-sm font-semibold text-foreground'>Recent Jobs</h2>
						{flaggedCount > 0 && (
							<span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                {flaggedCount} flagged
              </span>
						)}
					</div>
					<button onClick={manageJobs} className="text-xs text-primary hover:text-primary-light font-medium transition-colors">View all</button>
				</div>
				<table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Job</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Proposals</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentJobs.map(job => {
                const budget = job.budgetType === 'hourly' ? `$${job.budget}/hr` : `$${job.budget.toLocaleString()}`;
                return (
                  <tr key={job.id}
                    	className={`hover:bg-secondary/40 transition-colors ${job.status === 'flagged' ? 'bg-destructive/5' : ''}`}>
                    <td className="px-6 py-3.5 max-w-[220px]">
                      <div className="flex items-center gap-2">
                        {job.status === 'flagged' && (
                          <HiOutlineBookmarkSlash className="w-3.5 h-3.5 text-destructive shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.category}</p>
                        </div>
                      </div>
                    </td>
 
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
												<Avatar
													name={[job.createdBy.firstname, job.createdBy.lastname].filter(Boolean).join(' ')}
													image={job.createdBy.avatar}
													size='xs'>
												</Avatar>
                        <span className="text-sm text-foreground">{job.postedByName}</span>
                      </div>
                    </td>
 
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-medium text-foreground">{budget}</span>
                    </td>
 
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground">
                          {job.proposals}
                        </span>
                      </div>
                    </td>
 
                    <td className="px-6 py-3.5">
											<JobStatusBadge jobStatus={job.status}/>
                    </td>
 
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={manageJobs}
                        className={`text-xs font-medium transition-colors ${
                          job.status === 'flagged' ? 'text-destructive hover:text-destructive/80' : 'text-muted-foreground hover:text-primary'
                        }`}>
                        {job.status === 'flagged' ? 'Review' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
			 </div>
			</CanAccess>

      <CanAccess minRole="MODERATOR">
        <div className="bg-card border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-5">Users by role</h2>
          <div className="space-y-3">
            {ROLES.map(role => {
              const count = users.filter(u => u.role === role).length;
              const pct = count > 0 ? Math.round((count / users.length) * 100) : 0;
              return (
                <div key={role} className="flex items-center gap-4">
                  <div className="w-24 shrink-0"><RoleBadge role={role} size="sm" /></div>
                  <div className="flex-1 bg-background rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%`, opacity: role === 'ADMIN' ? 1 : role === 'MODERATOR' ? 0.75 : role === 'USER' ? 0.5 : 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right tabular-nums">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </CanAccess>
    </div>
  );
}