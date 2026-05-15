import { Router } from "express";
import * as friends_ctrl from '../controllers/ctrl.friends';
import { validate } from "../middleware/midd.validate";
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import {
	friend_params,
	friend_send_body,
	friend_remove_body
} from "../schemas/schema.friends";

const router = Router();

const write_limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 50,
	message: {error: 'Too many requests detected.'},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => (req as any).user?.userId ?? ipKeyGenerator(req.ip ?? ''),
	skip: (req) => req.method === 'GET' || req.method === 'HEAD'
});

router.post('/',
	write_limiter,
	validate({body: friend_send_body}),
	friends_ctrl.send
);
router.get('/incoming/', friends_ctrl.list_incoming);
router.get('/outgoing/', friends_ctrl.list_outgoing);
router.get('/friends/', friends_ctrl.list);

router.delete('/friends/',
	write_limiter,
	validate({body: friend_remove_body}),
	friends_ctrl.remove
);

router.patch('/:id/accept',
	write_limiter,
	validate({params: friend_params}),
	friends_ctrl.accept
);
router.patch('/:id/reject',
	write_limiter,
	validate({params: friend_params}),
	friends_ctrl.reject
);

export default router;
