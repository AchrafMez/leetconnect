import { subscribeToEvents, ADMIN_EVENTS } from '@leetconnect/shared';
import prisma from './prisma';

export const initConsumers = () => {

  subscribeToEvents(ADMIN_EVENTS.CONTENT_UPDATED, async (channel: string, message: any) => {
    const data = message.data;
    console.log("[MARKETPLACE CONSUMER] Received CONTENT_UPDATED:", data);

    if (!data.id || typeof data.status !== 'string') return;

    const statusMap: Record<string, string> = {
      active:  'OPEN',
      flagged: 'FLAGGED',
      closed:  'CLOSED',
    };

    const newStatus = statusMap[data.status];
    if (!newStatus) {
      console.warn(`[MARKETPLACE CONSUMER] Unknown status: ${data.status}`);
      return;
    }

    try {
      await prisma.job.update({
        where: { id: data.id },
        data: { status: newStatus as any }
      });
      console.log(`[MARKETPLACE CONSUMER] Updated job ${data.id} → ${newStatus}`);

      if (newStatus === 'FLAGGED' || newStatus === 'CLOSED') {
        await prisma.proposal.updateMany({
          where: { jobId: data.id, status: 'PENDING' },
          data: { status: 'REJECTED' }
        });
        await prisma.proposal.updateMany({
          where: { jobId: data.id, status: 'ACCEPTED' },
          data: { status: 'REJECTED' }
        });
      }
    } catch (err: any) {                                          // ← was missing
      console.error(`[MARKETPLACE CONSUMER] Failed to update job ${data.id}:`, err.message);
    }
  });                                                             // ← was missing

  subscribeToEvents(ADMIN_EVENTS.CONTENT_DELETED, async (channel: string, message: any) => {
    const data = message.data;
    if (data.id) {
      try {
        await prisma.job.delete({ where: { id: data.id } });
      } catch (err: any) {
        console.error(`[MARKETPLACE CONSUMER] Failed to delete job ${data.id}:`, err.message);
      }
    }
  });

  subscribeToEvents(ADMIN_EVENTS.USER_UPDATED, async (channel: string, message: any) => {
    const data = message.data;
    if (data.status === 'suspended') {
      const targetId = data.id || data.userId;
      if (targetId) {
        await prisma.job.updateMany({
          where: { clientId: targetId, status: 'OPEN' },
          data: { status: 'CLOSED' },
        });
      }
    }
  });

subscribeToEvents(ADMIN_EVENTS.USER_DELETED, async (channel: string, message: any) => {
  const data = message.data;
  const targetId = data.id || data.userId;
  if (!targetId) return;

  await prisma.$transaction([
    prisma.review.deleteMany({
      where: { OR: [{ fromUserId: targetId }, { toUserId: targetId }] },
    }),

    prisma.proposal.deleteMany({ where: { freelancerId: targetId } }),

    prisma.job.updateMany({
      where: {
        status: "IN_PROGRESS",
        proposals: {
          some: { freelancerId: targetId, status: "ACCEPTED" },
        },
      },
      data: { status: "OPEN" },
    }),

    prisma.job.deleteMany({ where: { clientId: targetId } }),
  ]);
});

};