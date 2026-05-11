import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/userContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Search } from "lucide-react";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    active: 0,
    proposals: 0,
    completed: 0,
    financials: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        if (user.type === "FREELANCER") {
          const data = await api<{ proposals: any[] }>("/market/proposals/my-proposals");
          const proposalsData = data.proposals || [];
          setJobs(proposalsData);
          setStats({
            active: proposalsData.filter((p: any) => p.status === "ACCEPTED" && p.job?.status === "IN_PROGRESS").length,
            proposals: proposalsData.filter((p: any) => p.status === "PENDING").length,
            completed: proposalsData.filter((p: any) => p.status === "ACCEPTED" && p.job?.status === "COMPLETED").length,
            financials: proposalsData
              .filter((p: any) => p.status === "ACCEPTED" && p.job?.status === "COMPLETED")
              .reduce((sum: number, p: any) => sum + Number(p.proposedBudget || 0), 0)
          });
        } else {
          const data = await api<{ jobs: any[] }>("/market/jobs/my-jobs");
          const jobsData = data.jobs || [];
          setJobs(jobsData);
          setStats({
            active: jobsData.filter((j: any) => j.status === "IN_PROGRESS").length,
            proposals: jobsData.reduce((acc: number, j: any) => acc + (j.proposals?.length || 0), 0),
            completed: jobsData.filter((j: any) => j.status === "COMPLETED").length,
            financials: jobsData
              .filter((j: any) => j.status === "COMPLETED")
              .reduce((sum: number, j: any) => {
                const accepted = j.proposals?.find((p: any) => p.status === "ACCEPTED");
                return sum + Number(accepted?.proposedBudget || 0);
              }, 0)
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredJobs = jobs.filter((item) => {
    const title = item.title || item.job?.title || "";
    const category = item.category || item.job?.category || "";
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user?.username}. Here's what's happening.
          </p>
        </div>
        {user?.type === "CLIENT" && (
          <Button onClick={() => navigate("/market/post-job")} size="sm">
            <Plus size={16} />
            Post Project
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: user?.type === "FREELANCER" ? "Total Earnings" : "Total Spent", value: <span className="font-bold tracking-tight"><span className="text-primary">$</span><span className="text-foreground">{stats.financials.toLocaleString()}</span></span> },
          { label: user?.type === "FREELANCER" ? "Active Contracts" : "Active Projects", value: stats.active },
          { label: user?.type === "FREELANCER" ? "Sent Proposals" : "Pending Proposals", value: stats.proposals },
          { label: "Completed", value: stats.completed },
        ].map((stat, i) => (
          <div key={i} className="border border-border rounded-lg p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
            <h3 className="text-2xl font-semibold tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <Separator />

      {/* Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{user?.type === "FREELANCER" ? "Recent Proposals" : "Recent Projects"}</h2>
          <div className="flex items-center gap-4">
            <Button variant="link" size="sm" onClick={() => navigate(user?.type === "FREELANCER" ? "/market/proposals" : "/market/my-jobs")} className="text-xs h-auto p-0">
              View All
            </Button>
            <div className="relative w-48 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{user?.type === "FREELANCER" ? "Job" : "Project"}</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{user?.type === "FREELANCER" ? "Budget" : "Proposals"}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4" colSpan={4}>
                      <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-muted-foreground">No projects found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your marketplace projects will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredJobs.slice(0, 5).map((item: any) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/market/jobs/${user?.type === "FREELANCER" ? item.jobId : item.id}`)}
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {user?.type === "FREELANCER" ? item.job?.title || "Unknown Job" : item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {user?.type === "FREELANCER" ? item.job?.category : item.category}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={user?.type === "FREELANCER" && item.status === "ACCEPTED" && item.job ? item.job.status : item.status} />
                    </td>
                    <td className="px-4 py-4">
                      {user?.type === "FREELANCER" ? (
                        <div className="flex items-baseline text-sm font-bold"><span className="text-primary">$</span><span className="text-foreground">{item.proposedBudget}</span></div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{item.proposals?.length || 0}</span>
                          <span className="text-xs text-muted-foreground">received</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">View</span>
                        <Search size={14} />
                      </Button>
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

export default Dashboard;
