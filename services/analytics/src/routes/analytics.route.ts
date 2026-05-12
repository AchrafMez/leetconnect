import express, { Router } from 'express'
import { getOverview } from '../controllers/overview.controller';
import { getUsersAnalytics } from '../controllers/users.controller';
import { getJobsAnalytics } from '../controllers/jobs.controller';
import { requireRole } from '@leetconnect/shared';
import { validateRequest } from '../middleware/validateRequest';
import { analyticsQueryParams } from '../validators/analyticsValidator';

const router: Router = express.Router();

router.get('/overview', requireRole('ADMIN'), getOverview);
router.get('/users', requireRole('ADMIN'), validateRequest(analyticsQueryParams), getUsersAnalytics);
router.get('/jobs', requireRole('ADMIN'), validateRequest(analyticsQueryParams), getJobsAnalytics);

export default router

/* 
	GET /api/admin/analytics/overview
	GET /api/admin/analytics/users
	GET /api/admin/analytics/jobs
*/