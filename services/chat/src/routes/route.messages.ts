import { Router } from 'express';
import * as message_ctrl from '../controllers/ctrl.message';

const router = Router({ mergeParams: true });

type Params	= { id: string , msg_id: string };

router.get('/', message_ctrl.list);
router.post('/', message_ctrl.send);
// router.get('/:msg_id', message_ctrl.get_one);
router.delete('/:msg_id', message_ctrl.remove);

export default router;
