import express, { Router } from 'express'
import { getRoles } from '../controllers/roles.controller';
import { requireRole } from '@leetconnect/shared';

const router: Router = express.Router();

router.get('/', requireRole('ADMIN'), getRoles);

export default router