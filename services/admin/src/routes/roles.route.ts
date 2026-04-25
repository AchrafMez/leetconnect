import express, { Router } from 'express'
import { getRoles } from '../controllers/roles.controller';

const router: Router = express.Router();

router.get('/', getRoles);

export default router