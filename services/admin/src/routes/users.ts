import express, { Router } from "express"
import { deleteUser, editUserRole, editUserStatus, getAllUsers, getUser } from "../controllers/users";
import { validateReqeust } from "../middleware/validateRequest";
import { updateRoleSchema, updateStatusSchema } from "../validators/users";

const router: Router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.patch('/:id/role', validateReqeust(updateRoleSchema), editUserRole);
router.patch('/:id/status', validateReqeust(updateStatusSchema), editUserStatus);
router.delete('/:id', deleteUser);

export default router;

/* 
	USERS Routes
		GET /api/admin/users
		GET /api/admin/users/:id
		PATCH /api/admin/users/:id/role
		PATCH /api/admin/users/:id/status
		DELETE/api/admin/users/:id
*/