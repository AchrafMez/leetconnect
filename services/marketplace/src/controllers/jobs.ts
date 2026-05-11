import { Request, Response } from "express";
import prisma from "../config/prisma";
import { publishEvent } from "../config/events";
import { EVENTS } from "@leetconnect/shared";
import { fetchUserFromAuth } from "../clients/auth";

export const addJob = async (req: Request, res: Response) => {
  try {
    const { title, category, budget, description, skills } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const job = await prisma.job.create({
      data: {
        title,
        category,
        budget: Number(budget),
        description,
        skills,
        clientId: user.userId,
      },
    });

    return res.json({ success: true, job });
  } catch (error: any) {
    console.error("addJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to create job" });
  }
};

export const getMyJobs = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const jobs = await prisma.job.findMany({
      where: { clientId: user.userId },
      include: { 
        proposals: true,
        reviews: true
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, jobs });
  } catch (error: any) {
    console.error("getMyJobs error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const { search, category, minBudget, maxBudget, skills, status } = req.query;

    const where: any = {
      status: (status as any) || "OPEN",
    };

    if (search) {
      const searchStr = String(search).slice(0, 200); // limit search length
      where.OR = [
        { title: { contains: searchStr, mode: "insensitive" } },
        { description: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = String(category).slice(0, 100);
    }

    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) {
        const min = Number(minBudget);
        if (Number.isFinite(min) && min >= 0) where.budget.gte = min;
      }
      if (maxBudget) {
        const max = Number(maxBudget);
        if (Number.isFinite(max) && max > 0) where.budget.lte = max;
      }
    }

    if (skills) {
      const skillsArray = String(skills)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 30);
      if (skillsArray.length > 0) {
        where.skills = { hasSome: skillsArray };
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        _count: {
          select: { proposals: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100, // limit results to prevent abuse
    });

    return res.json({ success: true, jobs });
  } catch (error: any) {
    console.error("getAllJobs error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

export const getSingleJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // already validated by validateIdParam

    const job = await prisma.job.findUnique({
      where: { id },
      include: { 
        proposals: true,
        reviews: true
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.json({ success: true, job });
  } catch (error: any) {
    console.error("getSingleJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch job" });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Ownership check
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Job not found" });
    if (existing.clientId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this job" });
    }

    // Only allow updates on OPEN jobs
    if (existing.status !== "OPEN") {
      return res.status(400).json({ success: false, message: "Can only update jobs that are OPEN" });
    }

    const { title, category, budget, description, skills, status } = req.body;

    const data: Record<string, any> = {};
    if (title !== undefined) data.title = title;
    if (category !== undefined) data.category = category;
    if (budget !== undefined) data.budget = Number(budget);
    if (description !== undefined) data.description = description;
    if (skills !== undefined) data.skills = skills;
    if (status !== undefined) data.status = status;

    const job = await prisma.job.update({
      where: { id },
      data,
    });

    return res.json({ success: true, job });
  } catch (error: any) {
    console.error("updateJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to update job" });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Ownership check
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Job not found" });
    if (existing.clientId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this job" });
    }

    // Prevent deleting jobs that are in progress
    if (existing.status === "IN_PROGRESS") {
      return res.status(400).json({ success: false, message: "Cannot delete a job that is in progress" });
    }

    await prisma.job.delete({ where: { id } });
    return res.json({ success: true, message: "Job deleted" });
  } catch (error: any) {
    console.error("deleteJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};

export const completeJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.clientId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to complete this job" });
    }
    if (job.status !== "IN_PROGRESS") return res.status(400).json({ success: false, message: "Job not in progress" });

    const updated = await prisma.job.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return res.json({ success: true, job: updated });
  } catch (error: any) {
    console.error("completeJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to complete job" });
  }
};

export const submitReview = async (req: Request, res: Response) => {
  try {
    const { jobId, toUserId, rating, comment } = req.body;
    const fromUserId = req.user?.userId;

    if (!fromUserId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Prevent self-review
    if (fromUserId === toUserId) {
      return res.status(400).json({ success: false, message: "You cannot review yourself" });
    }

    // Verify the job exists and is completed
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.status !== "COMPLETED") {
      return res.status(400).json({ success: false, message: "Can only review completed jobs" });
    }

    // Verify the reviewer was part of this job (client or accepted freelancer)
    const isClient = job.clientId === fromUserId;
    const acceptedProposal = await prisma.proposal.findFirst({
      where: { jobId, freelancerId: fromUserId, status: "ACCEPTED" },
    });
    const isFreelancer = !!acceptedProposal;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: "You are not a participant of this job" });
    }

    // Verify the target is the other party
    if (isClient && toUserId !== acceptedProposal?.freelancerId) {
      // Client must review the freelancer who was accepted
      const accepted = await prisma.proposal.findFirst({
        where: { jobId, status: "ACCEPTED" },
      });
      if (!accepted || toUserId !== accepted.freelancerId) {
        return res.status(400).json({ success: false, message: "Invalid review target" });
      }
    }
    if (isFreelancer && toUserId !== job.clientId) {
      return res.status(400).json({ success: false, message: "Invalid review target" });
    }

    const review = await prisma.review.create({
      data: {
        jobId,
        fromUserId,
        toUserId,
        rating: Number(rating),
        comment,
      },
    });

    // Notify Auth service to update aggregated rating
    await publishEvent(EVENTS.REVIEW_SUBMITTED, {
      userId: toUserId,
      rating: Number(rating),
    });

    return res.json({ success: true, review });
  } catch (error: any) {
    // Unique constraint violation — user already reviewed this job
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "You have already reviewed this job" });
    }
    console.error("submitReview error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit review" });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const closedOnly = req.query.closedOnly === "true";
    const authHeader = req.headers.authorization;

    const reviews = await prisma.review.findMany({
      where: {
        toUserId: userId,
        ...(closedOnly
          ? { job: { status: { in: ["COMPLETED", "CLOSED"] } } }
          : {}),
      },
      include: { job: { select: { title: true, category: true, status: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const uniqueAuthorIds = Array.from(
      new Set(reviews.map((r: any) => r.fromUserId as string))
    );
    const authorEntries = await Promise.all(
      uniqueAuthorIds.map(async (id) => [id, await fetchUserFromAuth(id, authHeader)] as const)
    );
    const authors = new Map(authorEntries);

    const enriched = reviews.map((r: any) => ({
      ...r,
      fromUser: authors.get(r.fromUserId) ?? null,
    }));

    return res.json({ success: true, reviews: enriched });
  } catch (error: any) {
    console.error("getUserReviews error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

export const pay = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Ownership check — only the client who owns the payment can pay
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Payment not found" });
    if (existing.clientId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to make this payment" });
    }

    // Only allow paying PENDING payments
    if (existing.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Payment is not in pending status" });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status: "PAID" },
      include: {
        proposal: { include: { job: true } }
      }
    });

    // Notify the freelancer about the payment
    if (payment.proposal && payment.proposal.job) {
      await publishEvent(EVENTS.NOTIF_CREATE, {
        user_id: payment.freelancerId,
        type: "SYSTEM",
        title: "Payment Received",
        body: `The client has funded $${payment.amount} for the job "${payment.proposal.job.title}".`
      });
    }

    return res.json({ success: true, payment });
  } catch (error: any) {
    console.error("pay error:", error);
    return res.status(500).json({ success: false, message: "Failed to process payment" });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        proposal: { include: { job: true } },
      },
    });

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    // Authorization — only the client or the freelancer involved can view the payment
    const userId = req.user?.userId;
    if (payment.clientId !== userId && payment.freelancerId !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to view this payment" });
    }

    return res.json({ success: true, payment });
  } catch (error: any) {
    console.error("getPaymentById error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch payment" });
  }
};