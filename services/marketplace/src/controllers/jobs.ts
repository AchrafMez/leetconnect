import { Request, Response } from "express";
import prisma from "../config/prisma";


const getString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return value[0];
  if (typeof value === "string") return value;
  return undefined;
};

export const addJob = async (req: Request, res: Response) => {
  try {
    const { title, category, budget, description, skills } = req.body;

    const user = req.user;
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clientId = user.userId;
    console.log(clientId,'======================================================')

    const job = await prisma.job.create({
      data: {
        title,
        category,
        budget: Number(budget),
        description,
        skills,
        clientId,
      },
    });

    return res.json({ success: true, job });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyJobs = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clientId = user.userId;

    const jobs = await prisma.job.findMany({
      where: { clientId },
      include: { proposals: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, jobs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const getAllJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      include: { proposals: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, jobs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleJob = async (req: Request, res: Response) => {
  try {
    const id = getString(req.params.id);

    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { proposals: true },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job introuvable" });
    }

    return res.json({ success: true, job });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const updateJob = async (req: Request, res: Response) => {
  try {
    const id = getString(req.params.id);

    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const { title, category, budget, description, skills, status } = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: {
        title,
        category,
        budget: Number(budget),
        description,
        skills,
        status,
      },
    });

    return res.json({ success: true, job });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};




export const deleteJob = async (req: Request, res: Response) => {
  try {
    const id = getString(req.params.id);

    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    await prisma.job.delete({ where: { id } });

    return res.json({ success: true, message: "Job supprimé" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};