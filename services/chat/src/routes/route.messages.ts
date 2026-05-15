import { Router } from 'express';
import * as message_ctrl from '../controllers/ctrl.message';
import { validate } from '../middleware/midd.validate';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import {
	message_params,
	message_query,
	message_body,
} from '../schemas/schema.message';

const message_limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 30,
	message: {error: 'Messaging spam detected.'},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => (req as any).user?.userId ?? ipKeyGenerator(req.ip ?? ''),
});

const router = Router({ mergeParams: true });

router.get('/',
	message_limiter, 
	validate({params: message_params, query: message_query}),
	message_ctrl.list
);

router.post('/',
	message_limiter,
	validate({params: message_params, body: message_body}),
	message_ctrl.send
);

router.delete('/:msg_id',
	message_limiter,
	validate({params: message_params}),
	message_ctrl.remove
);

export default router;
