import { MARKET_EVENTS } from "@leetconnect/shared";
import { prisma } from "../../config/prisma";

const MARKET_TO_ADMIN_STATUS: Record<string, string> = {
  OPEN: 'active',
  FLAGGED: 'flagged',
  COMPLETED: 'completed',
  CLOSED: 'closed',
};

function mapJobStatus(marketStatus: string): string {
  const mapped = MARKET_TO_ADMIN_STATUS[marketStatus];
  if (!mapped) {
    // console.warn(`[JOB_HANDLER] Unknown marketplace status: "${marketStatus}" — defaulting to active`);
    return 'active';
  }
  return mapped;
}

export const handleJobCreated = async (channel: string, message: any) => {
	if(channel !== MARKET_EVENTS.JOB_CREATED) return;
  try {
    const payload = message.data || {};
    if (!payload.jobId || !payload.title) {
        // console.warn("Invalid job created payload", payload);
        return;
    }
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.clientId }
    });

    if (!user) {
      // console.warn(`User with id ${payload.clientId} not found. Cannot create job ${payload.jobId}.`);
      return;
    }

		const mappedStatus = mapJobStatus(payload.status as string) as any;

    await prisma.job.create({
      data: {
        id: payload.jobId,
        title: payload.title,
        description: payload.description || "",
        category: payload.category || "",
        budget: payload.budget || 0,
        skills: payload.skills || [],
        status: mappedStatus, 
        postedByName: payload.postedByName || "Unknown",
        createdBy: { connect: { id: payload.clientId } },
        createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
      },
    });
  } catch (error) { }
};

export const handleJobUpdated = async (channel: string, message: any) => {
	if(channel !== MARKET_EVENTS.JOB_UPDATED) return;
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
      data.status = mapJobStatus(payload.status as string) as any;
    }

    if (Object.keys(data).length > 0) {
      // Check if job exists first
      const job = await prisma.job.findUnique({ where: { id: payload.jobId } });
      if (!job) {
        //  console.warn(`Job with id ${payload.jobId} not found, cannot update.`);
         return;
      }
      await prisma.job.update({
        where: { id: payload.jobId },
        data,
      });
    }
  } catch (error) { }
};

export const handleJobDeleted = async (channel: string, message: any) => {
	if(channel !== MARKET_EVENTS.JOB_DELETED) return;
  try {
    const payload = message.data || {};
    if (!payload.jobId) return;

    // Check if job exists first
    const job = await prisma.job.findUnique({ where: { id: payload.jobId } });
    if (!job) {
      //  console.warn(`Job with id ${payload.jobId} not found, cannot delete.`);
       return;
    }

    await prisma.job.delete({
      where: { id: payload.jobId },
    });
  } catch (error) { }
};
