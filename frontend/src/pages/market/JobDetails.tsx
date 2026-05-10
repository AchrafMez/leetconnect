import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, userApi } from "@/lib/api";
import { useAuth } from "@/context/userContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Star, Loader2 } from "lucide-react";

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [job, setJob] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [jobData, proposalsData] = await Promise.all([
        api<{ job: any }>(`/market/jobs/${id}`),
        api<{ proposals: any[] }>(`/market/proposals/${id}`),
      ]);
      
      const fetchedJob = jobData.job;
      const fetchedProposals = proposalsData.proposals || [];

      if (fetchedJob?.clientId) {
        try {
          const clientData = await userApi.getUserById(fetchedJob.clientId);
          fetchedJob.clientInfo = clientData.user;
        } catch (e) {
          console.error("Failed to fetch client info", e);
        }
      }

      const enrichedProposals = await Promise.all(
        fetchedProposals.map(async (p: any) => {
          if (p.freelancerId) {
            try {
              const freelancerData = await userApi.getUserById(p.freelancerId);
              p.freelancerInfo = freelancerData.user;
            } catch (e) {
              console.error("Failed to fetch freelancer info", e);
            }
          }
          return p;
        })
      );

      setJob(fetchedJob);
      setProposals(enrichedProposals);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAccept = async (proposalId: string) => {
    try {
      setIsAccepting(true);
      const data = await api<{ payment?: any }>(`/market/proposals/accept/${proposalId}`, {
        method: "PATCH",
      });
      if (data.payment) {
        navigate(`/market/payment/${data.payment.id}`);
      } else {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to accept proposal:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      await api(`/market/proposals/reject/${proposalId}`, { method: "PATCH" });
      fetchData();
    } catch (error) {
      console.error("Failed to reject proposal:", error);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );

  if (!job)
    return (
      <div className="text-center py-20 text-sm text-muted-foreground">Project not found</div>
    );

  const isClient = currentUser?.id === job.clientId;
  const acceptedProposal = proposals.find((p: any) => p.status === "ACCEPTED");
  const isHiredFreelancer = currentUser?.id === acceptedProposal?.freelancerId;
  const canReview = (isClient || isHiredFreelancer) && job.status === "COMPLETED";
  const hasAlreadyReviewed = job.reviews?.some(
    (r: any) => r.fromUserId === currentUser?.id
  );

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    const targetUserId = isClient ? acceptedProposal?.freelancerId : job.clientId;
    if (!targetUserId) return;

    try {
      setIsSubmittingReview(true);

      // Complete the project first if it is still IN_PROGRESS
      if (isClient && job.status === "IN_PROGRESS") {
        await api(`/market/jobs/${job.id}/complete`, { method: "POST" });
      }

      await api("/market/jobs/reviews", {
        method: "POST",
        body: {
          jobId: job.id,
          toUserId: targetUserId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
      });
      setShowReviewModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{job.category}</Badge>
              <span className="text-xs text-muted-foreground">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>

            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>

            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-medium text-muted-foreground">Required Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="px-3 text-xs font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* Proposals Section — Client Only */}
          {isClient && (
            <>
              <Separator />
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Proposals</h2>
                  <Badge variant="secondary">{proposals.length} received</Badge>
                </div>

                <div className="space-y-3">
                  {proposals.length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-border rounded-lg">
                      <p className="text-sm text-muted-foreground">No bids yet</p>
                    </div>
                  ) : (
                    proposals.map((p: any) => (
                      <div key={p.id} className="border border-border rounded-lg p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              className="h-9 w-9 cursor-pointer" 
                              onClick={(e) => { e.stopPropagation(); p.freelancerInfo?.username && navigate(`/profile/${p.freelancerInfo.username}`); }}
                            >
                              <AvatarImage src={p.freelancerInfo?.avatar || undefined} alt={p.freelancerInfo?.username} />
                              <AvatarFallback className="text-xs font-semibold">
                                {p.freelancerInfo ? (p.freelancerInfo.firstname?.[0] || p.freelancerInfo.username?.[0] || 'F').toUpperCase() : p.freelancerId?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 
                                className="text-sm font-semibold cursor-pointer hover:underline"
                                onClick={(e) => { e.stopPropagation(); p.freelancerInfo?.username && navigate(`/profile/${p.freelancerInfo.username}`); }}
                              >
                                {p.freelancerInfo ? `${p.freelancerInfo.firstname || ''} ${p.freelancerInfo.lastname || ''}`.trim() || p.freelancerInfo.username : `Freelancer #${p.freelancerId?.substring(0, 5)}`}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-muted-foreground">
                                  Applied {new Date(p.createdAt).toLocaleDateString()}
                                </p>
                                {p.freelancerInfo && (
                                  <>
                                    <span className="text-muted-foreground text-[10px]">•</span>
                                    <div className="flex items-center gap-1 text-yellow-500 text-[10px]">
                                      <Star size={10} fill="currentColor" />
                                      <span className="font-semibold">{p.freelancerInfo.rating ? p.freelancerInfo.rating.toFixed(1) : "0.0"}</span>
                                      <span className="text-muted-foreground">({p.freelancerInfo.reviewCount || 0})</span>
                                    </div>
                                    <span className="text-muted-foreground text-[10px]">•</span>
                                    <Button 
                                      variant="link" 
                                      className="h-auto p-0 text-[10px]" 
                                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${p.freelancerInfo.username}`); }}
                                    >
                                      View Profile
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-baseline text-sm font-bold"><span className="text-primary">$</span><span className="text-foreground">{p.proposedBudget}</span></div>
                            <p className="text-xs text-muted-foreground">{p.deliveryDays} days</p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
                          {p.coverLetter}
                        </p>

                        <div className="flex justify-end gap-2 pt-1">
                          {p.status === "PENDING" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleReject(p.id)}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs"
                                disabled={isAccepting}
                                onClick={() => handleAccept(p.id)}
                              >
                                {isAccepting ? <Loader2 size={12} className="animate-spin" /> : "Accept Bid"}
                              </Button>
                            </>
                          ) : (
                            <StatusBadge status={p.status} />
                          )}

                          {p.status === "ACCEPTED" && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-xs"
                                onClick={() => navigate("/messages")}
                              >
                                Message
                              </Button>
                              {isClient && p.payment && p.payment.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-black hover:text-black font-semibold"
                                  onClick={() => navigate(`/market/payment/${p.payment.id}`)}
                                >
                                  Fund Project
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Budget</p>
              <div className="flex items-baseline text-2xl font-bold">
                <span className="text-primary">$</span>
                <span className="text-foreground">{job.budget}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-xs text-muted-foreground pt-1">
              <p>Verified Payment</p>
              <div className="flex items-center gap-2">
                 <p>Project Status</p>
                 <StatusBadge status={job.status} />
              </div>
            </div>

            {((isClient && job.status === "IN_PROGRESS") ||
              (canReview && !hasAlreadyReviewed)) && (
              <Button
                className="w-full"
                onClick={() => setShowReviewModal(true)}
              >
                {job.status === "COMPLETED" ? "Leave Review" : "Complete Project"}
              </Button>
            )}
          </div>

          <div className="border border-border rounded-lg p-5 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Client</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => job.clientInfo?.username && navigate(`/profile/${job.clientInfo.username}`)}>
                <AvatarImage src={job.clientInfo?.avatar || undefined} alt={job.clientInfo?.username} />
                <AvatarFallback className="text-xs font-semibold">
                  {job.clientInfo ? (job.clientInfo.firstname?.[0] || job.clientInfo.username?.[0] || 'C').toUpperCase() : job.clientId?.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold cursor-pointer hover:underline" onClick={() => job.clientInfo?.username && navigate(`/profile/${job.clientInfo.username}`)}>
                  {job.clientInfo ? `${job.clientInfo.firstname || ''} ${job.clientInfo.lastname || ''}`.trim() || job.clientInfo.username : `ID #${job.clientId?.substring(0, 5)}`}
                </p>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={10} fill="currentColor" />
                    <span className="font-semibold">{job.clientInfo?.rating ? job.clientInfo.rating.toFixed(1) : "0.0"}</span>
                    <span className="text-muted-foreground">({job.clientInfo?.reviewCount || 0})</span>
                  </div>
                  {job.clientInfo?.username && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <Button variant="link" className="h-auto p-0 text-[10px]" onClick={() => navigate(`/profile/${job.clientInfo.username}`)}>
                        View Profile
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
            <DialogDescription>Rate your experience on this project</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className={`p-1 transition-colors ${
                    reviewData.rating >= star ? "text-yellow-500" : "text-muted-foreground"
                  }`}
                >
                  <Star size={22} fill={reviewData.rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            <Textarea
              rows={3}
              placeholder="Share your thoughts..."
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowReviewModal(false)}
              >
                Later
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmittingReview}>
                {isSubmittingReview ? <Loader2 size={14} className="animate-spin" /> : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetails;
