import { MARKET_EVENTS, ADMIN_EVENTS } from "@leetconnect/shared";
import { prisma } from "../../config/prisma";
// const mappedStatus = (marketToAdminStatus[status] ?? 'active') as any;



export async function handleJobCreated(channel: string, message: any): Promise<void> {
  if (channel !== MARKET_EVENTS.JOB_CREATED) return;
  try {
    const { jobId, title, description, category, budget, skills, status, clientId, postedByName, createdAt } = message.data;

    const marketToAdminStatus: Record<string, string> = {
      OPEN: 'active', FLAGGED: 'flagged', CLOSED: 'closed',
      IN_PROGRESS: 'active', COMPLETED: 'closed',
    };
    const mappedStatus = (marketToAdminStatus[status as string] ?? 'active') as any;

    await prisma.job.upsert({
      where: { id: jobId },
      update: { title, description, category, budget, skills, status: mappedStatus, postedByName },
      create: {
        id: jobId, title, description, category,
        budget: Number(budget), skills: skills ?? [],
        status: mappedStatus,
        clientId,
        postedByName: postedByName ?? 'Unknown',
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      }
    });

    console.log(`[EVENT] JOB_CREATED — synced job ${jobId}`);
  } catch (error) {
    console.error('[EVENT] JOB_CREATED — sync failed:', error);
  }
}

export async function handleJobUpdated(channel: string, message: any): Promise<void> {
  if (channel !== MARKET_EVENTS.JOB_UPDATED) return;
  try {
    const { jobId, title, description, category, budget, skills, status } = message.data;

    const marketToAdminStatus: Record<string, string> = {
      OPEN: 'active', FLAGGED: 'flagged', CLOSED: 'closed',
      IN_PROGRESS: 'active', COMPLETED: 'closed',
    };
    const mappedStatus = (marketToAdminStatus[status as string] ?? 'active') as any;

    await prisma.job.update({
      where: { id: jobId },
      data: { title, description, category, budget: Number(budget), skills, status: mappedStatus },  // ← use mappedStatus
    });

    console.log(`[EVENT] JOB_UPDATED — synced job ${jobId}`);
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      console.warn(`[EVENT] JOB_UPDATED — job ${message.data?.jobId} not in local DB yet, skipping`);
      return;
    }
    console.error('[EVENT] JOB_UPDATED — sync failed:', error);
  }
}

export async function handleJobDeleted(channel: string, message: any): Promise<void> {
  if (channel !== MARKET_EVENTS.JOB_DELETED) return;
  try {
    const { jobId } = message.data;

    await prisma.job.delete({ where: { id: jobId } });

    console.log(`[EVENT] JOB_DELETED — removed job ${jobId}`);
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      console.warn(`[EVENT] JOB_DELETED — job ${message.data?.jobId} not in local DB yet, skipping`);
      return;
    }
    console.error('[EVENT] JOB_DELETED — sync failed:', error);
  }
}

export async function handleJobUpdatedAdmin(channel: string, message: any): Promise<void> {
  if (channel !== ADMIN_EVENTS.CONTENT_UPDATED) return;
  try {
    const { id, status } = message.data;

    await prisma.job.update({
      where: { id },
      data: { status },
    });

    console.log(`[EVENT] CONTENT_UPDATED — synced job ${id} → ${status}`);
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      console.warn(`[EVENT] CONTENT_UPDATED — job ${message.data?.id} not in local DB yet, skipping`);
      return;
    }
    console.error('[EVENT] CONTENT_UPDATED — sync failed:', error);
  }
}

export async function handleJobDeletedAdmin(channel: string, message: any): Promise<void> {
  if (channel !== ADMIN_EVENTS.CONTENT_DELETED) return;
  try {
    const { id } = message.data;

    await prisma.job.delete({ where: { id } });

    console.log(`[EVENT] CONTENT_DELETED — removed job ${id}`);
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      console.warn(`[EVENT] CONTENT_DELETED — job ${message.data?.id} not in local DB yet, skipping`);
      return;
    }
    console.error('[EVENT] CONTENT_DELETED — sync failed:', error);
  }
}