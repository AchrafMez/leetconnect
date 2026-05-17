import { Request, Response } from "express";
import prisma from "../config/prisma";
import { publishEvent } from "../config/events";
import { EVENTS } from "@leetconnect/shared";
import { MARKET_EVENTS } from "@leetconnect/shared";

export const addProposal = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string; // already validated by validateIdParam

    const { coverLetter, proposedBudget, deliveryDays } = req.body;
    const freelancerId = req.user?.userId;

    if (!freelancerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify the job exists and is OPEN
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    if (job.status !== 'OPEN') {
    return res.status(403).json({ 
    message: job.status === 'FLAGGED' 
      ? 'This job is under review and not accepting proposals'
      : 'This job is not accepting proposals'
  });
}

    // Prevent freelancer from proposing on their own job (if they're also a client)
    if (job.clientId === freelancerId) {
      return res.status(400).json({ success: false, message: "You cannot submit a proposal on your own job" });
    }



    let proposal = await prisma.proposal.findFirst({
      where: {
        freelancerId,
        jobId,
      },
    });

    
    if (proposal && proposal.rejectionCount >= 2) {
      return res.status(403).json({
        success: false,
        message: "You reached maximum number of proposal attempts (2)",
      });
    }
    if (proposal) {

      if (proposal.status === "ACCEPTED") {
            return res.status(400).json({
              success: false,
              message: "You already have an accepted proposal",
            });
      }
      if (proposal.status === "PENDING") {
            return res.status(400).json({
              success: false,
              message: "You already have a pending proposal",
            });
      }
      proposal = await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          coverLetter,
          proposedBudget: Number(proposedBudget),
          deliveryDays: Number(deliveryDays),

          // reset status to pending
          status: "PENDING",
        },
      });
    } else {
      // 5. CREATE first proposal
      proposal = await prisma.proposal.create({
        data: {
          coverLetter,
          proposedBudget: Number(proposedBudget),
          deliveryDays: Number(deliveryDays),
          freelancerId,
          jobId,
        },
      });
    }

    const proposalCount = await prisma.proposal.count({ where: { jobId } });
    await publishEvent(MARKET_EVENTS.JOB_UPDATED, {
      jobId,
      proposals: proposalCount
    });

    // Notify client about new proposal
    if (job) {
      await publishEvent(EVENTS.NOTIF_CREATE, {
        user_id: job.clientId,
        type: "SYSTEM",
        title: "New Proposal Received",
        body: `A freelancer has submitted a proposal for your job: ${job.title}`
      });
    }

    return res.json({ success: true, proposal });
  } catch (error: any) {
    console.error("addProposal error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit proposal" });
  }
};

export const getJobProposals = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;

    // Verify user is the job owner to see all proposals
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const userId = req.user?.userId;

    // Job owner sees all proposals; freelancers only see their own
    if (job.clientId === userId) {
      const proposals = await prisma.proposal.findMany({
        where: { jobId },
        include: { payment: true },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, proposals });
    } else {
      // Freelancer can only see their own proposal for this job
      const proposals = await prisma.proposal.findMany({
        where: { jobId, freelancerId: userId as string },
        include: { payment: true },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, proposals });
    }
  } catch (error: any) {
    console.error("getJobProposals error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch proposals" });
  }
};

export const getMyProposals = async (req: Request, res: Response) => {
  try {
    const freelancerId = req.user?.userId;

    if (!freelancerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const proposals = await prisma.proposal.findMany({
      where: { freelancerId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, proposals });
  } catch (error: any) {
    console.error("getMyProposals error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch proposals" });
  }
};

export const acceptProposal = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    // Ownership check — only the job owner can accept proposals
    if (proposal.job.clientId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to accept this proposal" });
    }

    // State check — only pending proposals can be accepted
    if (proposal.status !== "PENDING") {
      return res.status(400).json({ success: false, message: `Cannot accept a ${proposal.status.toLowerCase()} proposal` });
    }

    // State check — job must be OPEN
  if (proposal.job.status !== "OPEN") {
  return res.status(400).json({ 
    success: false, 
    message: proposal.job.status === "FLAGGED"
      ? "This job is under admin review"
      : "This job is no longer accepting proposals"
  });
}

    // Use interactive transaction for atomicity
    const payment = await prisma.$transaction(async (tx) => {
      // Update proposal status

      // empecher d accepter 2 proposal de freelancer different
      const jobUpdate = await tx.job.updateMany({
        where: {
          id: proposal.jobId,
          status: "OPEN",
        },
        data: {
          status: "IN_PROGRESS",
        },
      });

      if (jobUpdate.count === 0) {
        throw new Error("Job already accepted by another freelancer");
      }

       await tx.proposal.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });

      // Reject all other pending proposals for this job
      await tx.proposal.updateMany({
        where: {
          jobId: proposal.jobId,
          id: { not: id },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });

      // Create payment record
      const newPayment = await tx.payment.create({
        data: {
          proposalId: proposal.id,
          jobId: proposal.jobId,
          clientId: proposal.job.clientId,
          freelancerId: proposal.freelancerId,
          amount: proposal.proposedBudget,
          status: "PENDING",
        },
      });

  
  
      return newPayment;
    });

    // Emit events after transaction succeeds
    // Event for Chat service to create conversation
    await publishEvent(EVENTS.PROPOSAL_ACCEPTED, {
      proposalId: proposal.id,
      jobId: proposal.jobId,
      clientId: proposal.job.clientId,
      freelancerId: proposal.freelancerId
    });

    // Event for Notification service
    await publishEvent(EVENTS.NOTIF_CREATE, {
      user_id: proposal.freelancerId,
      type: "SYSTEM",
      title: "Proposal Accepted!",
      body: `Your proposal for the job "${proposal.job.title}" has been accepted. Payment is pending.`
    });

    await publishEvent(MARKET_EVENTS.JOB_UPDATED, {
    jobId: proposal.jobId,
    status: 'IN_PROGRESS',
  });

    return res.json({
      success: true,
      message: "Proposal accepted, payment pending, and chat initialized.",
      payment,
    });
  } catch (error: any) {
    console.error("acceptProposal error:", error);
    return res.status(500).json({ success: false, message: "Failed to accept proposal" });
  }
};

export const rejectProposal = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Fetch proposal with job to verify ownership
    const existing = await prisma.proposal.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    // Ownership check — only the job owner can reject proposals
    if (existing.job.clientId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to reject this proposal" });
    }

    // State check — only pending proposals can be rejected
    if (existing.status !== "PENDING") {
      return res.status(400).json({ success: false, message: `Cannot reject a ${existing.status.toLowerCase()} proposal` });
    }
    
    const proposal = await prisma.proposal.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionCount: {
          increment: 1,
        },
      },
    });

 
    // Notify freelancer about rejection
    await publishEvent(EVENTS.NOTIF_CREATE, {
      user_id: proposal.freelancerId,
      type: "SYSTEM",
      title: "Proposal Declined",
      body: `Your proposal for the job "${existing.job.title}" was declined by the client.`
    });

    return res.json({ success: true, proposal });
  } catch (error: any) {
    console.error("rejectProposal error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject proposal" });
  }
};