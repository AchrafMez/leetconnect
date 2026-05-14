import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Loader2, Briefcase, Inbox, Send } from "lucide-react";
import { useAuth } from "@/context/userContext";

const FindWork: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApply, setShowApply] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [proposalData, setProposalData] = useState({
    coverLetter: "",
    proposedBudget: "",
    deliveryDays: "",
  });

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("status", "OPEN");
      const data = await api<{ jobs: any[] }>(`/market/jobs?${params.toString()}`);
      setJobs(data.jobs || []);
    } catch (err) {
      // Intentionally handling error silently so it does not appear in console
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleInteraction = (action: () => void) => {
    if (!user) {
      navigate('/auth/sign-up?type=FREELANCER');
    } else {
      action();
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!proposalData.coverLetter || proposalData.coverLetter.length < 10 || proposalData.coverLetter.length > 5000) {
      setSubmitError("Cover letter must be between 10 and 5000 characters.");
      return;
    }

    const proposedBudgetNum = Number(proposalData.proposedBudget);
    if (!proposedBudgetNum || proposedBudgetNum <= 0 || proposedBudgetNum > 1000000) {
      setSubmitError("Proposed budget must be a positive number up to 1,000,000.");
      return;
    }

    const deliveryDaysNum = Number(proposalData.deliveryDays);
    if (!deliveryDaysNum || deliveryDaysNum <= 0 || deliveryDaysNum > 365 || !Number.isInteger(deliveryDaysNum)) {
      setSubmitError("Delivery days must be a positive integer up to 365.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await api(`/market/proposals/${selectedJob.id}`, {
        method: "POST",
        body: {
          ...proposalData,
          proposedBudget: Number(proposalData.proposedBudget),
          deliveryDays: Number(proposalData.deliveryDays),
        },
      });
      setShowApply(false);
      setProposalData({ coverLetter: "", proposedBudget: "", deliveryDays: "" });
      fetchJobs();
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to submit proposal.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProposal = (e: React.MouseEvent, job: any) => {
    e.stopPropagation();
    handleInteraction(() => {
      setSelectedJob(job);
      setSubmitError(null);
      setShowApply(true);
    });
  };

  const handleJobClick = (jobId: string) => {
    handleInteraction(() => {
      navigate(`/market/jobs/${jobId}`);
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover opportunities matched to your expertise.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <Card className="border-border/50 bg-background-elevated shadow-none">
          <CardContent className="p-3 sm:p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="border-border/50 bg-background-elevated shadow-none">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Inbox size={20} className="text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No matching projects found</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Try adjusting your search or check back soon for new opportunities.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {jobs.map((job: any) => (
            <Card
              key={job.id}
              role="button"
              tabIndex={0}
              onClick={() => handleJobClick(job.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleJobClick(job.id);
                }
              }}
              className="group border-border/50 bg-background-elevated shadow-none hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <CardContent className="p-4 sm:p-5">
                {/* Top row: avatar + title + budget */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                      <span className="absolute inset-0 bg-primary/10" />
                      <Briefcase size={16} className="text-primary relative" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold text-foreground truncate transition-colors">
                        {job.title}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span className="text-primary font-medium truncate">{job.category}</span>
                        <span>·</span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                      Est. Budget
                    </p>
                    <div className="flex items-baseline justify-end text-base font-bold">
                      <span className="text-primary">$</span>
                      <span className="text-foreground">{job.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-xs line-clamp-2 mt-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Footer: skills + apply */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    {job.skills?.slice(0, 4).map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-[10px] font-medium px-2 py-0.5 bg-secondary/50 hover:bg-secondary/80 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {job.skills?.length > 4 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => openProposal(e, job)}
                    className="w-full sm:w-auto shrink-0"
                  >
                    <Send size={14} />
                    Submit Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Proposal Dialog */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                <span className="absolute inset-0 bg-primary/10" />
                <Send size={16} className="text-primary relative" />
              </div>
              <div className="min-w-0">
                <DialogTitle>Submit Proposal</DialogTitle>
                <DialogDescription className="truncate">{selectedJob?.title}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-4 pt-2">
            {submitError && (
              <div className="p-3 text-xs text-destructive flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                <span>{submitError}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Cover Letter</Label>
              <Textarea
                required
                rows={4}
                placeholder="Why are you the right fit?"
                value={proposalData.coverLetter}
                onChange={(e) => setProposalData({ ...proposalData, coverLetter: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  required
                  placeholder="500"
                  value={proposalData.proposedBudget}
                  onChange={(e) => setProposalData({ ...proposalData, proposedBudget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Delivery (Days)</Label>
                <Input
                  type="number"
                  required
                  placeholder="14"
                  value={proposalData.deliveryDays}
                  onChange={(e) => setProposalData({ ...proposalData, deliveryDays: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1"
                onClick={() => setShowApply(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:flex-1">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    <Send size={14} />
                    Send Proposal
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindWork;
