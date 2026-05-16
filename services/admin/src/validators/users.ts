import {z} from "zod";
import { Role, Status } from "../../prisma/generated/client";

export const updateStatusSchema = z.object({
	status: z.enum([
		"active",
		"suspended",
	], {
		error: () => ({
			message: 'Status must be one of: active, suspended, pending'
		})
	})
})

export const updateRoleSchema = z.object({
	role: z.enum([
		"ADMIN",
		"MODERATOR",
		"USER"
	], {
		error: () => ({
			message: 'Role must be one of: ADMIN, MODERATOR, USER'
		})
	})
})

export const uuidSchema = z.object({
	id: z.string().uuid('Invalid user id'),
});

export const getUsersQuerySchema = z.object({
	search: z.string().max(100, 'Search term too long').optional(),
	role: z.nativeEnum(Role).optional(),
	status: z.nativeEnum(Status).optional()
})