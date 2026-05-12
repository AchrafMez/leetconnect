import express, { Router } from "express"
import { deleteUser, editUserRole, editUserStatus, getAllUsers, getUser } from "../controllers/users.controller";
import { validateReqeust } from "../middleware/validateRequest";
import { getUsersQuerySchema, updateRoleSchema, updateStatusSchema, uuidSchema } from "../validators/users";
import { requireRole } from "@leetconnect/shared";
import { mutationLimiter } from "../middleware/limiters";

const router: Router = express.Router();

router.get('/', requireRole('ADMIN', 'MODERATOR'), validateReqeust({ query: getUsersQuerySchema}), getAllUsers);
router.get('/:id', requireRole('ADMIN'), validateReqeust({ params: uuidSchema}), getUser);
router.patch('/:id/role', requireRole('ADMIN'), mutationLimiter, validateReqeust({ params: uuidSchema, body: updateRoleSchema}), editUserRole);
router.patch('/:id/status', requireRole('ADMIN'), mutationLimiter, validateReqeust({ params: uuidSchema, body: updateStatusSchema}), editUserStatus);
router.delete('/:id', requireRole('ADMIN'), mutationLimiter, validateReqeust({ params: uuidSchema}), deleteUser);

export default router;

/* 
	USERS Routes
		GET /api/admin/users
		GET /api/admin/users/:id
		PATCH /api/admin/users/:id/role
		PATCH /api/admin/users/:id/status
		DELETE/api/admin/users/:id
*/