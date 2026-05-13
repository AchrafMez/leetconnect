import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, userApi, chatApi } from "@/lib/api";
import { useAuth } from "@/context/userContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import Avatar from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Star, Loader2, Inbox } from "lucide-react";

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

  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
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
          // silently handle or store error state without console.error
        }
      }

      const enrichedProposals = await Promise.all(
        fetchedProposals.map(async (p: any) => {
          if (p.freelancerId) {
            try {
              const freelancerData = await userApi.getUserById(p.freelancerId);
              p.freelancerInfo = freelancerData.user;
            } catch (e) {
               // silently handle or store error state without console.error
            }
          }
          return p;
        })
      );

      setJob(fetchedJob);
      setProposals(enrichedProposals);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch data");
      }
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
      setActionError(null);
      const data = await api<{ payment?: any }>(`/market/proposals/accept/${proposalId}`, {
        method: "PATCH",
      });
      if (data.payment) {
        navigate(`/market/payment/${data.payment.id}`);
      } else {
        fetchData();
      }
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to accept proposal");
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMessage = async (targetUserId: string) => {
    if (!targetUserId) return;
    try {
      const convers = await chatApi.createConversation({
        type: "Direct",
        member_ids: [targetUserId],
      });
      navigate(`/chat?conv=${convers.id}`);
    } catch (err) {
      if (err instanceof Error) setActionError(err.message);
      else setActionError("Failed to open conversation");
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      setActionError(null);
      await api(`/market/proposals/reject/${proposalId}`, { method: "PATCH" });
      fetchData();
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to reject proposal");
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-100">
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

    if (!Number.isInteger(reviewData.rating) || reviewData.rating < 1 || reviewData.rating > 5) {
      setReviewError("Rating must be an integer between 1 and 5.");
      return;
    }

    if (!reviewData.comment || reviewData.comment.length < 1 || reviewData.comment.length > 2000) {
      setReviewError("Comment must be between 1 and 2000 characters.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError(null);

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
      setReviewData({ rating: 5, comment: "" });
      fetchData();
    } catch (err) {
      if (err instanceof Error) {
        setReviewError(err.message);
      } else {
        setReviewError("Failed to submit review");
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {actionError && (
        <div className="p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20 mb-4 whitespace-pre-wrap">
          <p className="text-sm font-medium">{actionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Job Overview Card */}
          <Card className="border-border/50 bg-background-elevated shadow-none">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary">{job.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{job.title}</h1>

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
            </CardContent>
          </Card>

          {/* Proposals Section — Client Only */}
          {isClient && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Proposals</h2>
                <Badge variant="secondary">{proposals.length} received</Badge>
              </div>

              {proposals.length === 0 ? (
                <Card className="border-border/50 bg-background-elevated shadow-none">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                        <Inbox size={20} className="text-muted-foreground" />
                      </div>
                      <p className="text-foreground font-medium">No bids yet</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Proposals from freelancers will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {proposals.map((p: any) => {
                    const fullName = p.freelancerInfo
                      ? `${p.freelancerInfo.firstname || ""} ${p.freelancerInfo.lastname || ""}`.trim() ||
                        p.freelancerInfo.username
                      : `Freelancer #${p.freelancerId?.substring(0, 5)}`;
                    const goToProfile = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (p.freelancerInfo?.username) navigate(`/profile/${p.freelancerInfo.username}`);
                    };

                    return (
                      <Card
                        key={p.id}
                        className="border-border/50 bg-background-elevated shadow-none"
                      >
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={goToProfile}
                                className="shrink-0 cursor-pointer"
                              >
                                <Avatar name={fullName} image={p.freelancerInfo?.avatar} size="sm" />
                              </button>
                              <div className="min-w-0">
                                <h4
                                  className="text-sm font-semibold cursor-pointer hover:underline truncate"
                                  onClick={goToProfile}
                                >
                                  {fullName}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <p className="text-[10px] text-muted-foreground">
                                    Applied {new Date(p.createdAt).toLocaleDateString()}
                                  </p>
                                  {p.freelancerInfo && (
                                    <>
                                      <span className="text-muted-foreground text-[10px]">•</span>
                                      <div className="flex items-center gap-1 text-yellow-500 text-[10px]">
                                        <Star size={10} fill="currentColor" />
                                        <span className="font-semibold">
                                          {p.freelancerInfo.rating ? p.freelancerInfo.rating.toFixed(1) : "0.0"}
                                        </span>
                                        <span className="text-muted-foreground">
                                          ({p.freelancerInfo.reviewCount || 0})
                                        </span>
                                      </div>
                                      <span className="text-muted-foreground text-[10px]">•</span>
                                      <Button
                                        variant="link"
                                        className="h-auto p-0 text-[10px]"
                                        onClick={goToProfile}
                                      >
                                        View Profile
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0 sm:pl-4">
                              <div className="flex items-baseline text-sm font-bold sm:justify-end">
                                <span className="text-primary">$</span>
                                <span className="text-foreground">{p.proposedBudget}</span>
                              </div>
                              <p className="text-xs text-muted-foreground sm:text-right">
                                {p.deliveryDays} days
                              </p>
                            </div>
                          </div>

                          {/* Cover letter */}
                          <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/40 p-3 rounded-lg">
                            {p.coverLetter}
                          </p>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 pt-1">
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
                              <div className="self-start sm:self-auto">
                                <StatusBadge status={p.status} />
                              </div>
                            )}

                            {p.status === "ACCEPTED" && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() =>
                                    handleMessage(isClient ? p.freelancerId : job.clientId)
                                  }
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Budget Card */}
          <Card className="border-border/50 bg-background-elevated shadow-none">
            <CardContent className="p-5 space-y-4">
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
                <div className="flex items-center gap-2 flex-wrap">
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
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card className="border-border/50 bg-background-elevated shadow-none">
            <CardContent className="p-5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Client</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => job.clientInfo?.username && navigate(`/profile/${job.clientInfo.username}`)}
                  className="shrink-0 cursor-pointer"
                >
                  <Avatar
                    name={
                      job.clientInfo
                        ? `${job.clientInfo.firstname || ""} ${job.clientInfo.lastname || ""}`.trim() ||
                          job.clientInfo.username
                        : `Client ${job.clientId?.substring(0, 1) || "C"}`
                    }
                    image={job.clientInfo?.avatar}
                    size="sm"
                  />
                </button>
                <div className="min-w-0">
                  <p
                    className="text-xs font-semibold cursor-pointer hover:underline truncate"
                    onClick={() => job.clientInfo?.username && navigate(`/profile/${job.clientInfo.username}`)}
                  >
                    {job.clientInfo
                      ? `${job.clientInfo.firstname || ""} ${job.clientInfo.lastname || ""}`.trim() ||
                        job.clientInfo.username
                      : `ID #${job.clientId?.substring(0, 5)}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={10} fill="currentColor" />
                      <span className="font-semibold">
                        {job.clientInfo?.rating ? job.clientInfo.rating.toFixed(1) : "0.0"}
                      </span>
                      <span className="text-muted-foreground">
                        ({job.clientInfo?.reviewCount || 0})
                      </span>
                    </div>
                    {job.clientInfo?.username && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-[10px]"
                          onClick={() => navigate(`/profile/${job.clientInfo.username}`)}
                        >
                          View Profile
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewModal} onOpenChange={(open) => {
        setShowReviewModal(open);
        if (!open) setReviewError(null);
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
            <DialogDescription>Rate your experience on this project</DialogDescription>
          </DialogHeader>

          {reviewError && (
            <div className="p-3 rounded-md bg-destructive/15 text-destructive border border-destructive/20 text-sm font-medium">
              {reviewError}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`p-1 transition-colors cursor-pointer ${
                      reviewData.rating >= star ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500/60"
                    }`}
                  >
                    <Star size={26} fill={reviewData.rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {reviewData.rating} {reviewData.rating === 1 ? "star" : "stars"}
              </p>
            </div>

            <Textarea
              rows={4}
              placeholder="Share your thoughts..."
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1"
                onClick={() => setShowReviewModal(false)}
              >
                Later
              </Button>
              <Button type="submit" className="w-full sm:flex-1" disabled={isSubmittingReview}>
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
