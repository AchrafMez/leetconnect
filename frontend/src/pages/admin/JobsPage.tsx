import { useState, useMemo } from "react";
import { CanAccess } from "@/components/CanAccess";
import { MOCK_JOBS } from "@/lib/mockData";
import { Job, JobStatus, JobCategory } from "../../types"
import { HiOutlineBookmark, HiOutlineBookmarkSlash, HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineEye, HiOutlineMagnifyingGlass, HiOutlineTrash, HiOutlineXMark } from "react-icons/hi2";

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
            <HiOutlineXMark className="w-5 h-5" />
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
          icon={<HiOutlineBriefcase className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="Active" value={counts.active}
          sub="open for proposals" subColor="text-muted-foreground"
          iconBg="bg-blue-500/10"
          icon={<HiOutlineCheckCircle className="w-5 h-5 text-blue-400" />}
        />
        <StatCard
          label="Flagged" value={counts.flagged}
          sub="require review" subColor="text-destructive"
          iconBg="bg-destructive/10"
          icon={<HiOutlineBookmarkSlash className="w-5 h-5 text-destructive" />}
        />
        <StatCard
          label="Closed" value={counts.closed}
          sub="completed or expired" subColor="text-muted-foreground"
          iconBg="bg-muted"
          icon={<HiOutlineCheckCircle className="w-5 h-5 text-muted-foreground"/>}
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
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                  key={Number(job.id)}
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
                        <HiOutlineEye className="w-4 h-5" />
                      </button>

                      <CanAccess permission="jobs:moderate">
                        {job.status !== 'flagged' && (
                          <button
                            onClick={() => handleStatusChange(job.id, 'flagged')}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                            title="Flag job"
                          >
                            <HiOutlineBookmark className="w-4 h-4" />
                          </button>
                        )}
                        {job.status === 'flagged' && (
                          <button
                            onClick={() => handleStatusChange(job.id, 'active')}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Restore job"
                          >
                            <HiOutlineBookmarkSlash className="w-4 h-4" />
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
                            <HiOutlineTrash className="h-4 w-4" />
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
            <HiOutlineBriefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
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