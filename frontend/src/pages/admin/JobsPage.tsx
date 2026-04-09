import { useState, useMemo } from "react";
import { CanAccess } from "@/components/CanAccess";
import { MOCK_JOBS } from "@/lib/mockData";
import { Job, JobStatus, JobCategory } from "../../types"

const STATUS_STYLES: Record<JobStatus, { badge: string; dot: string; label: string }> = {
  active:  { badge: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary', label: 'Active' },
  closed:  { badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground', label: 'Closed' },
  flagged: { badge: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive', label: 'Flagged' },
};
const ALL_STATUSES: JobStatus[] = ['active', 'closed', 'flagged'];

const ALL_CATEGORIES: JobCategory[] = [
	'Frontend Dev', 'Backend Dev', 'Full Stack', 'Mobile Dev',
  'UI/UX Design', 'DevOps', 'Data Science', 'QA & Testing',
  'Content Writing', 'Marketing',
]

function formatBudget(job: Job) {
	return job.budgetType === 'hourly' ? `$${job.budget}/hr` : `$${job.budget.toLocaleString()}`;
}

function timeAgo(date: string) {
	const diff = Date.now() - new Date(date).getTime();
	const days = Math.floor(diff / 86400000);
	if (days === 0) return 'Today';
	if (days === 1) return '1 day ago';
	const months = Math.floor(days / 30);
	return `${months} month${months > 1 ? 's' : ''} ago`;
}

function StatCard({ label, value, sub, subColor, iconBg, icon }: {
	label: string; value: number | string; sub: string;
	subColor: string; iconBg: string; icon: React.ReactNode;
}) {
	return(
		<div className="bg-card border border-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
      <p className={`text-xs ${subColor}`}>{sub}</p>
    </div>
	)
}

function JobDrawer({ job, onClose, onDelete, onStatusChange }: {
	job: Job;
	onClose: () => void;
	onDelete: (id: string) => void;
	onStatusChange: (id: string, status: JobStatus) => void;
}) {
	const [ confirmDelete, setConfirmDelete ] = useState(false);
	const s = STATUS_STYLES[job.status];

	return(
		<div
			className="fixed inset-0 z-50 flex justify-end"
			style={{background: 'rgba(0,0,0,0.5)'}}
			onClick={onClose}>
			<div className="w-[480px] h-full bg-card border-l border-border overflow-y-auto flex flex-col"
				onClick={e => e.stopPropagation()}>

        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full border border-border">
                {job.category}
              </span>
            </div>
            <h2 className="text-base font-semibold text-foreground leading-snug">{job.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


				<div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-border">
          {[
            { label: 'Budget', value: formatBudget(job) },
            { label: 'Proposals', value: `${job.proposalCount} received` },
            { label: 'Posted', value: timeAgo(job.createdAt) },
            { label: 'Deadline', value: job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-3">Posted by</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {job.postedByAvatar}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{job.postedByName}</p>
              <p className="text-xs text-muted-foreground">Client</p>
            </div>
          </div>
        </div>

				<div className="px-6 py-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">Description</p>
          <p className="text-sm text-foreground leading-relaxed">{job.description}</p>
        </div>

        
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-3">Required skills</p>
          <div className="flex flex-wrap gap-2">
            {job.skills.map(skill => (
              <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-border text-foreground">
                {skill}
              </span>
            ))}
          </div>
        </div>

				<div className="px-6 py-4 mt-auto border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Change status</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ALL_STATUSES.map(status => {
              const st = STATUS_STYLES[status];
              return (
                <button
                  key={status}
                  onClick={() => onStatusChange(job.id, status)}
                  disabled={job.status === status}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    job.status === status ? `${st.badge} opacity-100 cursor-default` : 'bg-background border-border text-muted-foreground hover:border-border-hover'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </button>
              );
            })}
          </div>

          <CanAccess permission="jobs:delete">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { onDelete(job.id); onClose(); }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-destructive hover:bg-destructive/80 transition-colors"
                >
                  Confirm delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-muted-foreground bg-secondary border border-border hover:border-border-hover transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors"
              >
                Delete job
              </button>
            )}
          </CanAccess>
        </div>

			</div>

		</div>
	)
}

export const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<JobCategory | 'all'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function handleDelete(id: string) {
    setJobs(prev => prev.filter(j => j.id !== id));
    setDeleteConfirm(null);
  }

  function handleStatusChange(id: string, status: JobStatus) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    setSelectedJob(prev => prev?.id === id ? { ...prev, status } : prev);
  }

  const filtered = useMemo(() =>
    jobs.filter(j => {
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.postedByName.toLowerCase().includes(search.toLowerCase()) ||
                            j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || j.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || j.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    }),
  [jobs, search, statusFilter, categoryFilter]);

  const counts = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    flagged: jobs.filter(j => j.status === 'flagged').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  }), [jobs]);

  return (
    <div className="p-8">
			
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor, moderate, and manage all job postings on the platform.
        </p>
      </div>

    
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
        label="Total Jobs" value={counts.total}
          sub={`${counts.active} currently active`} subColor="text-primary"
          iconBg="bg-primary/10"
          icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>}
        />
        <StatCard
          label="Active" value={counts.active}
          sub="open for proposals" subColor="text-muted-foreground"
          iconBg="bg-blue-500/10"
          icon={<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Flagged" value={counts.flagged}
          sub="require review" subColor="text-destructive"
          iconBg="bg-destructive/10"
          icon={<svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" /></svg>}
        />
        <StatCard
          label="Closed" value={counts.closed}
          sub="completed or expired" subColor="text-muted-foreground"
          iconBg="bg-muted"
          icon={<svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="flex items-center gap-1 mb-5 bg-secondary border border-border rounded-lg p-1 w-fit">
        {(['all', ...ALL_STATUSES] as const).map(s => {
          const isActive = statusFilter === s;
          const count = s === 'all' ? jobs.length : jobs.filter(j => j.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-card text-foreground border border-border shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s !== 'all' && (
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[s as JobStatus].dot}`} />
              )}
              {s === 'all' ? 'All' : STATUS_STYLES[s as JobStatus].label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-secondary text-muted-foreground' : 'bg-background text-muted-foreground'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, client, or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as JobCategory | 'all')}
          className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        >
          <option value="all">All categories</option>
          {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="ml-auto text-sm font-semibold text-muted-foreground">{filtered.length} jobs</span>
      </div>

      
      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Job</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Proposals</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Posted</th>
              <th className="text-right px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(job => {
              const s = STATUS_STYLES[job.status];
              return (
                <tr
                  key={job.id}
                  className="hover:bg-secondary/30 transition-colors group cursor-pointer"
                  onClick={() => setSelectedJob(job)}>
                
                  <td className="px-6 py-4 max-w-[240px]">
                    <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-muted-foreground">{job.category}</span>
                      {job.skills.slice(0, 2).map(skill => (
                        <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{job.skills.length - 2}</span>
                      )}
                    </div>
                  </td>

                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                        {job.postedByAvatar}
                      </div>
                      <span className="text-sm text-foreground">{job.postedByName}</span>
                    </div>
                  </td>

                  
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">{formatBudget(job)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {job.budgetType === 'hourly' ? '/ hr' : 'fixed'}
                    </span>
                  </td>

                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold text-foreground`}>
                        {job.proposalCount}
                      </span>
                    </div>
                  </td>

                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>

                  
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {timeAgo(job.createdAt)}
                  </td>

            
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="View details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      <CanAccess permission="jobs:moderate">
                        {job.status !== 'flagged' && (
                          <button
                            onClick={() => handleStatusChange(job.id, 'flagged')}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                            title="Flag job"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
                            </svg>
                          </button>
                        )}
                        {job.status === 'flagged' && (
                          <button
                            onClick={() => handleStatusChange(job.id, 'active')}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Restore job"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                      </CanAccess>

                      <CanAccess permission="jobs:delete">
                        {deleteConfirm === job.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(job.id)} className="px-2 py-1 rounded text-xs font-medium text-white bg-destructive hover:bg-destructive/80 transition-colors">
                              Confirm
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(job.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete job"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </CanAccess>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-muted-foreground">No jobs match your filters.</p>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}