import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { proposalsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Briefcase, Inbox, ChevronRight, Clock } from "lucide-react";

const Proposals: React.FC = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await proposalsApi.getMyProposals();
        if (data.success && data.proposals) {
          setProposals(data.proposals);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch proposals");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const filteredProposals = proposals.filter((p) => {
    const q = searchQuery.toLowerCase();
    const title = (p.job?.title || "").toLowerCase();
    const cover = (p.coverLetter || "").toLowerCase();
    return title.includes(q) || cover.includes(q);
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track the status of your submitted job applications.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <Input
          placeholder="Search proposals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20 mb-4 whitespace-pre-wrap">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Proposals List */}
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
          ) : filteredProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Inbox size={20} className="text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No proposals found</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                You haven't submitted any proposals yet. Head over to Find Work to start applying!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredProposals.map((proposal: any) => {
                const status = proposal.status === "ACCEPTED" && proposal.job
                  ? proposal.job.status
                  : proposal.status;
                return (
                  <div
                    key={proposal.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/market/jobs/${proposal.jobId}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/market/jobs/${proposal.jobId}`);
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
                          {proposal.job?.title || "Unknown Job"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {proposal.coverLetter}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={status} className="hidden sm:inline-flex" />
                      <div className="text-right hidden md:block">
                        <div className="flex items-baseline text-sm font-bold justify-end">
                          <span className="text-primary">$</span>
                          <span className="text-foreground">{proposal.proposedBudget}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                          <Clock size={10} />
                          {proposal.deliveryDays}d
                        </p>
                      </div>
                      <div className="flex items-baseline text-sm font-bold md:hidden">
                        <span className="text-primary">$</span>
                        <span className="text-foreground">{proposal.proposedBudget}</span>
                      </div>
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
  );
};

export default Proposals;
