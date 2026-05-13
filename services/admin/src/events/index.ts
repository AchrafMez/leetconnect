import { subscribeToEvents, AUTH_EVENTS, MARKET_EVENTS } from "@leetconnect/shared";
import { handleUserRegistred, handleUserUpdated } from "./handlers/user.handlers";
import { handleJobCreated, handleJobUpdated, handleJobDeleted } from "./handlers/job.handlers";

export function RegisterEventHandlers(): void {
        subscribeToEvents(AUTH_EVENTS.USER_REGISTERED, handleUserRegistred);
        subscribeToEvents(AUTH_EVENTS.USER_UPDATED, handleUserUpdated);

        subscribeToEvents(MARKET_EVENTS.JOB_CREATED, handleJobCreated);
        subscribeToEvents(MARKET_EVENTS.JOB_UPDATED, handleJobUpdated);
        subscribeToEvents(MARKET_EVENTS.JOB_DELETED, handleJobDeleted);

	console.log('Event Handlers Registered');
}