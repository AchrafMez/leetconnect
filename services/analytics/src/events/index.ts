import { subscribeToEvents, AUTH_EVENTS, ADMIN_EVENTS, MARKET_EVENTS } from "@leetconnect/shared";
import { handleUserDeleted, handleUserRegistred, handleUserUpdated, handleUserUpdatedAdmin } from "./handlers/user.handlers";
import { handleJobCreated, handleJobUpdated, handleJobDeleted, handleJobUpdatedAdmin, handleJobDeletedAdmin } from "./handlers/job.handlers";

export function RegisterEventHandlers(): void {
  subscribeToEvents(AUTH_EVENTS.USER_REGISTERED, handleUserRegistred);
  subscribeToEvents(AUTH_EVENTS.USER_UPDATED, handleUserUpdated);
  subscribeToEvents(ADMIN_EVENTS.USER_UPDATED, handleUserUpdatedAdmin);
  subscribeToEvents(ADMIN_EVENTS.USER_DELETED, handleUserDeleted);

  subscribeToEvents(MARKET_EVENTS.JOB_CREATED, handleJobCreated);
  subscribeToEvents(MARKET_EVENTS.JOB_UPDATED, handleJobUpdated);
  subscribeToEvents(MARKET_EVENTS.JOB_DELETED, handleJobDeleted);
  subscribeToEvents(ADMIN_EVENTS.CONTENT_UPDATED, handleJobUpdatedAdmin);
  subscribeToEvents(ADMIN_EVENTS.CONTENT_DELETED, handleJobDeletedAdmin);

  // console.log('Event Handlers Registered');
}