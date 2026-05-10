import { Router } from 'express';
import * as message_ctrl from '../controllers/ctrl.message';
import { validate } from '../middleware/midd.validate';
import {
	message_params,
	message_query,
	message_body,
} from '../schemas/schema.message';

const router = Router({ mergeParams: true });

router.get('/',
	validate({params: message_params, query: message_query}),
	message_ctrl.list
);

router.post('/',
	validate({params: message_params, body: message_body}),
	message_ctrl.send
);

router.delete('/:msg_id',
	validate({params: message_params}),
	message_ctrl.remove
);

export default router;
