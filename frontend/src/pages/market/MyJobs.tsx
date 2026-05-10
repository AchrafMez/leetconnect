import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Plus, Loader2 } from "lucide-react";

const MyJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setIsLoading(true);
        const data = await api<{ jobs: any[] }>("/market/jobs/my-jobs");
        setJobs(data.jobs || []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your posted jobs and review incoming proposals.
          </p>
        </div>
        <Button onClick={() => navigate("/market/post-job")} size="sm">
          <Plus size={16} className="mr-1" />
          Post Project
        </Button>
      </div>

      {/* Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Project Name</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Proposals</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Posted On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-muted-foreground">No projects found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You haven't posted any projects yet, or none match your search.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate("/market/post-job")}
                    >
                      Post your first project
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job: any) => (
                  <tr
                    key={job.id}
                    className="group hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/market/jobs/${job.id}`)}
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.category}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{job.proposals?.length || 0}</span>
                        <span className="text-xs text-muted-foreground">received</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyJobs;
