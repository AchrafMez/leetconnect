import { useState, useMemo, useEffect } from "react";
import { CanAccess } from "@/components/CanAccess";
import { categoriesData } from "@/assets/assets";
import { Job, JobStatus, JobCategory } from "../../types"
import { HiOutlineBookmark,
				 HiOutlineBookmarkSlash,
				 HiOutlineBriefcase,
				 HiOutlineCheckCircle,
				 HiOutlineEye,
				 HiOutlineMagnifyingGlass,
				 HiOutlineTrash,
				 HiOutlineXMark } from "react-icons/hi2";
import { adminApi } from "@/lib/api";
import { Spin } from "@/components/ui/Spin";
import { useDebounce } from "@/hooks/useDebounce";
import { StatCard } from "@/components/ui/StatCard";
import { JobStatusBadge } from "@/components/ui/RoleBadge";
import Avatar from "@/components/ui/Avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STYLES: Record<JobStatus, { badge: string; dot: string; label: string }> = {
  active:  { badge: 'text-primary border-primary/20', dot: 'bg-primary', label: 'Active' },
  closed:  { badge: 'text-muted-foreground border-border', dot: 'bg-muted-foreground', label: 'Closed' },
  flagged: { badge: 'text-destructive border-destructive/20', dot: 'bg-destructive', label: 'Flagged' },
};
const ALL_STATUSES: JobStatus[] = ['active', 'closed', 'flagged'];

const ALL_CATEGORIES: JobCategory[] = Object.keys(categoriesData);

function timeAgo(date: string) {
	const diff = Date.now() - new Date(date).getTime();
	const days = Math.floor(diff / 86400000);
	if (days === 0) return 'Today';
	if (days === 1) return '1 day ago';
	const months = Math.floor(days / 30);
	if(months === 0) return `${days} days ago`;
	return `${months} month${months > 1 ? 's' : ''} ago`;
}

function JobDrawer({ job, onClose, onDelete, onStatusChange }: {
	job: Job;
	onClose: () => void;
	onDelete: (id: string) => void;
	onStatusChange: (id: string, status: JobStatus) => void;
}) {
	const [ confirmDelete, setConfirmDelete ] = useState(false);

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
							<JobStatusBadge jobStatus={job.status}/>
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
            { label: 'Budget', value: job.budget },
            { label: 'Proposals', value: `${job.proposals} received` },
            { label: 'Posted', value: timeAgo(job.createdAt) },
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
						<Avatar
							name={[job.createdBy.firstname, job.createdBy.lastname].filter(Boolean).join(' ')}
							image={job.createdBy.avatar}
							size='sm'>
						</Avatar>
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

          <CanAccess permission="content:delete">
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<JobCategory | 'all'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const debouncedSearch = useDebounce(search, 500);

	useEffect(() => {
		async function fetchJobs() {
			try {
				const params: any = {};
				if(debouncedSearch) params.search = debouncedSearch;
				if(statusFilter !== 'all') params.status = statusFilter;
				if(categoryFilter !== 'all') params.category = categoryFilter;
				const data = await adminApi.getJobs(params);
				setJobs(data);
			} catch (error: any) {
				setError(error.message || 'Failed to fetch jobs');
			} finally {
				setLoading(false);
			}
		}
		fetchJobs();
	}, [debouncedSearch, statusFilter, categoryFilter]);

  async function handleDelete(id: string) {
		try {
			await adminApi.deleteJob(id);
			setJobs(prev => prev.filter(j => j.id !== id));
		} catch (error: any) {
			alert(error.message);
		}
		setDeleteConfirm(null);
  }

  async function handleStatusChange(id: string, status: JobStatus) {
		try {
			const updated = await adminApi.updateJobStatus(id, status);
			setJobs(prev => prev.map(j => j.id === id ? updated : j));
		} catch (error: any) {
			alert(error.message);
		}
    setSelectedJob(prev => prev?.id === id ? { ...prev, status } : prev);
  }

  const counts = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    flagged: jobs.filter(j => j.status === 'flagged').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  }), [jobs]);

	if(loading) {
		return(<Spin />)
	}
	if(error) return <div className="p-8 text-destructive">{error}</div>;

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
				<Select value={categoryFilter} onValueChange={(value: string) => setCategoryFilter(value as JobCategory | 'all')}>
					<SelectTrigger className="w-[180px] bg-input border-border text-muted-foreground">
						<SelectValue placeholder="Select a category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All categories</SelectItem>
						{ALL_CATEGORIES.map(c => (
							<SelectItem key={c} value={c}>
								{c}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
        <span className="ml-auto text-sm font-semibold text-muted-foreground">{jobs.length} jobs</span>
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
            {jobs.map(job => {
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
											<Avatar
												name={[job.createdBy.firstname, job.createdBy.lastname].filter(Boolean).join(' ')}
												image={job.createdBy.avatar}
												size='xs'>
											</Avatar>
                      <span className="text-sm text-foreground">{job.postedByName}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">{`$${job.budget}`}</span>
                  </td>
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold text-foreground`}>
                        {job.proposals}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
										<JobStatusBadge jobStatus={job.status}/>
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

                      <CanAccess permission="content:moderate">
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

                      <CanAccess permission="content:delete">
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

        {jobs.length === 0 && (
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