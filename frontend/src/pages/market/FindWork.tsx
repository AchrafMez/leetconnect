import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Loader2 } from "lucide-react";

const FindWork: React.FC = () => {
  const navigate = useNavigate();
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
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
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
    } catch (error: any) {
      console.error("Failed to submit proposal:", error);
      setSubmitError(error.message || "Failed to submit proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
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
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">No matching projects found</p>
          </div>
        ) : (
          jobs.map((job: any) => (
            <div
              key={job.id}
              className="border border-border rounded-lg p-5"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold">
                    {job.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary font-medium">{job.category}</span>
                    <span>·</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Est. Budget</p>
                  <div className="flex items-baseline text-base font-bold"><span className="text-primary">$</span><span className="text-foreground">{job.budget}</span></div>
                </div>
              </div>

              <p className="text-muted-foreground text-xs line-clamp-2 mt-3 leading-relaxed">
                {job.description}
              </p>

              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-1.5">
                  {job.skills?.slice(0, 4).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-[10px] font-medium px-2 py-0.5 bg-secondary/50 hover:bg-secondary/80 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <button
                  className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-medium flex items-center gap-2 transition-colors duration-200"
                  onClick={() => {
                    setSelectedJob(job);
                    setSubmitError(null);
                    setShowApply(true);
                  }}
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Proposal Dialog */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Proposal</DialogTitle>
            <DialogDescription>{selectedJob?.title}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-4 pt-2">
            {submitError && (
              <div className="p-3 text-xs text-destructive flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-md text-center max-w-sm ml-auto mr-auto">
                {submitError}
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

            <div className="grid grid-cols-2 gap-4">
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

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send Proposal"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindWork;
