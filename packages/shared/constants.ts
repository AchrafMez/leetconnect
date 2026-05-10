// shared constants, use these instead of raw strings to avoid typos
// roles: user roles : client freelancer admin
// job_status / proposal_status / contract_status: marketplace lifecycle (ner-roui)
// friendship_status: friend system (noben-ai)
// events: redis event names for inter-service communication (noben-ai, ner-roui, adbouras publish — abmahfou subscribes)
// services: internal urls to call other services via rest

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MODERATOR: 'MODERATOR',
} as const;

export const USER_TYPES = {
  CLIENT: 'CLIENT',
  FREELANCER: 'FREELANCER',
} as const;

export const AUTH_EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
};

export const ADMIN_EVENTS = {
	USER_UPDATED: 'user.updated',
	USER_DELETED: 'user.deleted',
	CONTENT_UPDATED: 'content.updated',
	CONTENT_DELETED: 'content.deleted'
}

// The data sent to other services
export interface UserRegisteredPayload {
  id: string;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  role: string;
  type: string;
}

export interface UserPresencePayload {
    id: string;
}

  export const JOB_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CLOSED: 'closed',
  } as const;
  
  export const PROPOSAL_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  } as const;
  
  export const CONTRACT_STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PAID: 'paid',
    DISPUTED: 'disputed',
  } as const;
  
  export const FRIENDSHIP_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    BLOCKED: 'blocked',
  } as const;
  
  export const EVENTS = {
    // USER_REGISTERED: 'user.registered',
    USER_ONLINE: 'user.online',
    USER_OFFLINE: 'user.offline',
    PRESENCE_RESET: 'presence.reset',
    NOTIF_CREATE: 'notif.create', 
    NOTIFICATION_CREATED: 'notification.created',
    JOB_CREATED: 'job.created',
    PROPOSAL_RECEIVED: 'proposal.received',
    PROPOSAL_ACCEPTED: 'proposal.accepted',
    PROPOSAL_REJECTED: 'proposal.rejected',
    REVIEW_SUBMITTED: 'review.submitted',
    CONTRACT_COMPLETED: 'contract.completed',
    MESSAGE_SENT: 'message.sent',
  } as const;

  export const SERVICES = {
    AUTH: process.env.AUTH_SERVICE_URL || 'http://auth:3001',
    MARKETPLACE: process.env.MARKETPLACE_SERVICE_URL || 'http://marketplace:3002',
    CHAT: process.env.CHAT_SERVICE_URL || 'http://chat:3003',
    ANALYTICS: process.env.ANALYTICS_SERVICE_URL || 'http://analytics:3004',
    ADMIN: process.env.ADMIN_SERVICE_URL || 'http://admin:3005',
  }

export type Role = typeof ROLES[keyof typeof ROLES];
export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];
export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];
export type ProposalStatus = typeof PROPOSAL_STATUS[keyof typeof PROPOSAL_STATUS];
export type ContractStatus = typeof CONTRACT_STATUS[keyof typeof CONTRACT_STATUS];
export type FriendshipStatus = typeof FRIENDSHIP_STATUS[keyof typeof FRIENDSHIP_STATUS];
export type Event = typeof EVENTS[keyof typeof EVENTS];
export type AuthEvent = typeof AUTH_EVENTS[keyof typeof AUTH_EVENTS];