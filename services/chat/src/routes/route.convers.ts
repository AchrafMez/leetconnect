import { Router } from 'express';
import * as convers_ctrl from '../controllers/ctrl.convers';
import { validate } from '../middleware/midd.validate';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import {
	convers_add_member_body,
	convers_create_body,
	convers_params,
	convers_update_body
} from '../schemas/schema.convers';

const write_limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 50,
	message: {error: 'Too many requests detected.'},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => (req as any).user?.userId ?? ipKeyGenerator(req.ip ?? ''),
	skip: (req) => req.method === 'GET' || req.method === 'HEAD'
});

const router = Router();

router.get('/', convers_ctrl.list);
router.post('/', write_limiter, validate({body: convers_create_body}), convers_ctrl.create);
router.get('/:id', validate({params: convers_params}), convers_ctrl.get);
router.put('/:id', write_limiter, validate({params: convers_params, body: convers_update_body}), convers_ctrl.update);
router.delete('/:id', write_limiter, validate({params: convers_params}), convers_ctrl.remove);
router.post('/:id/members', write_limiter, validate({params: convers_params, body: convers_add_member_body}), convers_ctrl.add_member);

export default router;
