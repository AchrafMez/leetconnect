import express, { Router } from 'express'
import { getOverview } from '../controllers/overview.controller';
import { getUsersAnalytics } from '../controllers/users.controller';
import { getJobsAnalytics } from '../controllers/jobs.controller';

const router: Router = express.Router();

router.get('/overview', getOverview);
router.get('/users', getUsersAnalytics);
router.get('/jobs', getJobsAnalytics);

export default router

/* 
	GET /api/admin/analytics/overview
	GET /api/admin/analytics/users
	GET /api/admin/analytics/jobs
*/