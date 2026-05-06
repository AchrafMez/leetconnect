import express, { Router } from "express"
import { deleteJob, editJobStatus, getAllJobs, getJob } from "../controllers/jobs.controller";
import { validateReqeust } from "../middleware/validateRequest";
import { updateJobStatusSchema } from "../validators/jobs";

const router: Router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJob);
router.patch('/:id/status', validateReqeust(updateJobStatusSchema), editJobStatus);
router.delete('/:id', deleteJob);

export default router
/*
	GET /api/admin/jobs
	GET /api/admin/jobs/:id
	PATCH /api/admin/jobs/:id/status
	DELETE /api/admin/jobs/:id
*/