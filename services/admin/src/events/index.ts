import { subscribeToEvents, AUTH_EVENTS } from "@leetconnect/shared";
import { handleUserRegistred, handleUserUpdated } from "./handlers/user.handlers";

export function RegisterEventHandlers(): void {
	subscribeToEvents(AUTH_EVENTS.USER_REGISTERED, handleUserRegistred);
	subscribeToEvents(AUTH_EVENTS.USER_UPDATED, handleUserUpdated);

	console.log('Event Handlers Registered');
}