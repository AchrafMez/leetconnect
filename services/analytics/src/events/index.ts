import { subscribeToEvents, AUTH_EVENTS, ADMIN_EVENTS } from "@leetconnect/shared";
import { handleUserDeleted, handleUserRegistred, handleUserUpdated, handleUserUpdatedAdmin } from "./handlers/user.handlers";

export function RegisterEventHandlers(): void {
	subscribeToEvents(AUTH_EVENTS.USER_REGISTERED, handleUserRegistred);
	subscribeToEvents(AUTH_EVENTS.USER_UPDATED, handleUserUpdated);
	subscribeToEvents(ADMIN_EVENTS.USER_UPDATED, handleUserUpdatedAdmin);
	subscribeToEvents(ADMIN_EVENTS.USER_DELETED, handleUserDeleted);

	console.log('Event Handlers Registered');
}