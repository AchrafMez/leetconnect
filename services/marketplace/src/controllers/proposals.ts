import { Request, Response } from "express";
import prisma from "../config/prisma";

// helper propre (évite de répéter partout)
const getString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return value[0];
  if (typeof value === "string") return value;
  return undefined;
};

export const addProposal = async (req: Request, res: Response) => {
  try {
    console.log("................................", req.user);

    const jobId = getString(req.params.jobId);

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Invalid jobId" });
    }

    const { coverLetter, proposedBudget, deliveryDays } = req.body;
    const freelancerId = req.user?.userId;

    if (!freelancerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const proposal = await prisma.proposal.create({
      data: {
        coverLetter,
        proposedBudget: Number(proposedBudget),
        deliveryDays: Number(deliveryDays),
        freelancerId,
        jobId,
      },
    });

    return res.json({ success: true, proposal });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobProposals = async (req: Request, res: Response) => {
  try {
    const jobId = getString(req.params.jobId);

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Invalid jobId" });
    }

    const proposals = await prisma.proposal.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, proposals });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptProposal = async (req: Request, res: Response) => {
  try {
    const id = getString(req.params.id);

    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const proposal = await prisma.proposal.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    await prisma.job.update({
      where: { id: proposal.jobId },
      data: { status: "IN_PROGRESS" },
    });

    return res.json({ success: true, proposal });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectProposal = async (req: Request, res: Response) => {
  try {
    const id = getString(req.params.id);

    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const proposal = await prisma.proposal.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return res.json({ success: true, proposal });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};