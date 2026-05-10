import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/userContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  DollarSign,
  Briefcase,
  Send,
  CheckCircle2,
  ChevronRight,
  Inbox,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
}

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

  const isFreelancer = user?.type === "FREELANCER";

  const statItems: Stat[] = [
    {
      label: isFreelancer ? "Total Earnings" : "Total Spent",
      value: (
        <span className="font-semibold tracking-tight">
          <span className="text-primary">$</span>
          <span className="text-foreground">{stats.financials.toLocaleString()}</span>
        </span>
      ),
      icon: DollarSign,
    },
    {
      label: isFreelancer ? "Active Contracts" : "Active Projects",
      value: stats.active,
      icon: Briefcase,
    },
    {
      label: isFreelancer ? "Sent Proposals" : "Pending Proposals",
      value: stats.proposals,
      icon: Send,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
    },
  ];

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statItems.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className="border-border/50 bg-background-elevated shadow-none hover:bg-secondary/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                    <span className="absolute inset-0 bg-primary/10" />
                    <Icon size={18} className="text-primary relative" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground truncate">
                      {stat.label}
                    </p>
                    <h3 className="text-lg sm:text-xl font-semibold tracking-tight truncate">
                      {stat.value}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Proposals / Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">
            {isFreelancer ? "Recent Proposals" : "Recent Projects"}
          </h2>
          <div className="flex items-center gap-4">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate(isFreelancer ? "/market/proposals" : "/market/my-jobs")}
              className="text-xs h-auto p-0"
            >
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

        <Card className="border-border/50 bg-background-elevated shadow-none">
          <CardContent className="p-3 sm:p-4">
            {isLoading ? (
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
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
                <p className="text-foreground font-medium">No {isFreelancer ? "proposals" : "projects"} found</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Your marketplace {isFreelancer ? "proposals" : "projects"} will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredJobs.slice(0, 5).map((item: any) => {
                  const title = isFreelancer ? item.job?.title || "Unknown Job" : item.title;
                  const category = isFreelancer ? item.job?.category : item.category;
                  const status = isFreelancer && item.status === "ACCEPTED" && item.job
                    ? item.job.status
                    : item.status;
                  const targetId = isFreelancer ? item.jobId : item.id;

                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/market/jobs/${targetId}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/market/jobs/${targetId}`);
                        }
                      }}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                          <span className="absolute inset-0 bg-primary/10" />
                          <Briefcase size={16} className="text-primary relative" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {category || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 pl-2">
                        <StatusBadge status={status} className="hidden sm:inline-flex" />
                        {isFreelancer ? (
                          <div className="flex items-baseline text-sm font-bold">
                            <span className="text-primary">$</span>
                            <span className="text-foreground">{item.proposedBudget}</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-semibold">{item.proposals?.length || 0}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">received</span>
                          </div>
                        )}
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground group-hover:text-foreground transition-colors"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
