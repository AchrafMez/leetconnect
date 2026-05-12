import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { proposalsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Loader2 } from "lucide-react";

const Proposals: React.FC = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setIsLoading(true);
        const data = await proposalsApi.getMyProposals();
        if (data.success && data.proposals) {
          setProposals(data.proposals);
        }
      } catch (error) {
        console.error("Failed to fetch proposals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track the status of your submitted job applications.
        </p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Job Details</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Proposed Terms</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Submitted On</th>
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
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No proposals found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You haven't submitted any proposals yet. Head over to Find Work to start applying!
                  </p>
                </td>
              </tr>
            ) : (
              proposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="group hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/market/jobs/${proposal.jobId}`)}
                >
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {proposal.job?.title || "Unknown Job"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md">
                      {proposal.coverLetter}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-baseline text-sm font-bold"><span className="text-primary">$</span><span className="text-foreground">{proposal.proposedBudget}</span></div>
                    <p className="text-xs text-muted-foreground mt-0.5">{proposal.deliveryDays} days delivery</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={proposal.status === "ACCEPTED" && proposal.job ? proposal.job.status : proposal.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(proposal.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Proposals;
