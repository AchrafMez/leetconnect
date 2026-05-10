import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Plus, Briefcase, Inbox, ChevronRight } from "lucide-react";

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your posted jobs and review incoming proposals.
          </p>
        </div>
        <Button onClick={() => navigate("/market/post-job")} size="sm">
          <Plus size={16} />
          Post Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Projects List */}
      <Card className="border-border/50 bg-background-elevated shadow-none">
        <CardContent className="p-3 sm:p-4">
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Inbox size={20} className="text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No projects found</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                You haven't posted any projects yet, or none match your search.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate("/market/post-job")}
              >
                <Plus size={14} />
                Post your first project
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredJobs.map((job: any) => (
                <div
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/market/jobs/${job.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/market/jobs/${job.id}`);
                    }
                  }}
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                      <span className="absolute inset-0 bg-primary/10" />
                      <Briefcase size={16} className="text-primary relative" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {job.category || "—"} · {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={job.status} className="hidden sm:inline-flex" />
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold">{job.proposals?.length || 0}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">received</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground group-hover:text-foreground transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyJobs;
