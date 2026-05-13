import express, { Router } from "express"
import { deleteJob, editJobStatus, getAllJobs, getJob } from "../controllers/jobs.controller";
import { validateReqeust } from "../middleware/validateRequest";
import { getJobsQuerySchema, updateJobStatusSchema, uuidSchema } from "../validators/jobs";
import { requireRole } from "@leetconnect/shared";
import { mutationLimiter } from "../middleware/limiters";

const router: Router = express.Router();

router.get('/', requireRole('ADMIN', 'MODERATOR'), validateReqeust({ query: getJobsQuerySchema}), getAllJobs);
router.get('/:id', requireRole('ADMIN', 'MODERATOR'), validateReqeust({ params: uuidSchema}), getJob);
router.patch('/:id/status', requireRole('ADMIN', 'MODERATOR'), mutationLimiter, validateReqeust({ params: uuidSchema, body: updateJobStatusSchema}), editJobStatus);
router.delete('/:id', requireRole('ADMIN', 'MODERATOR'), mutationLimiter, validateReqeust({ params: uuidSchema}), deleteJob);

export default router
/*
	GET /api/admin/jobs
	GET /api/admin/jobs/:id
	PATCH /api/admin/jobs/:id/status
	DELETE /api/admin/jobs/:id
*/