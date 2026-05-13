import { prisma } from "../../config/prisma";

export const handleJobCreated = async (channel: string, message: any) => {
  try {
    const payload = message.data || {};
    if (!payload.jobId || !payload.title) {
        console.warn("Invalid job created payload", payload);
        return;
    }
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.clientId }
    });

    if (!user) {
      console.warn(`User with id ${payload.clientId} not found. Cannot create job ${payload.jobId}.`);
      return;
    }

    await prisma.job.create({
      data: {
        id: payload.jobId,
        title: payload.title,
        description: payload.description || "",
        category: payload.category || "",
        budget: payload.budget || 0,
        skills: payload.skills || [],
        status: payload.status === "OPEN" ? "active" : "active", 
        postedByName: payload.postedByName || "Unknown",
        createdBy: { connect: { id: payload.clientId } }, // clientId mapped to createdBy relation
        createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
      },
    });
  } catch (error) {
    console.error("Error handling job created event", error);
  }
};

export const handleJobUpdated = async (channel: string, message: any) => {
  try {
    const payload = message.data || {};
    if (!payload.jobId) return;

    const data: any = {};
    if (payload.title !== undefined) data.title = payload.title;
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.category !== undefined) data.category = payload.category;
    if (payload.budget !== undefined) data.budget = payload.budget;
    if (payload.skills !== undefined) data.skills = payload.skills;
    if (payload.proposals !== undefined) data.proposals = payload.proposals;
    if (payload.status !== undefined) {
       data.status = payload.status === "OPEN" ? "active" : (payload.status === "CLOSED" ? "closed" : "active");
    }

    if (Object.keys(data).length > 0) {
      // Check if job exists first
      const job = await prisma.job.findUnique({ where: { id: payload.jobId } });
      if (!job) {
         console.warn(`Job with id ${payload.jobId} not found, cannot update.`);
         return;
      }
      await prisma.job.update({
        where: { id: payload.jobId },
        data,
      });
    }
  } catch (error) {
    console.error("Error handling job updated event", error);
  }
};

export const handleJobDeleted = async (channel: string, message: any) => {
  try {
    const payload = message.data || {};
    if (!payload.jobId) return;

    // Check if job exists first
    const job = await prisma.job.findUnique({ where: { id: payload.jobId } });
    if (!job) {
       console.warn(`Job with id ${payload.jobId} not found, cannot delete.`);
       return;
    }

    await prisma.job.delete({
      where: { id: payload.jobId },
    });
  } catch (error) {
    console.error("Error handling job deleted event", error);
  }
};
