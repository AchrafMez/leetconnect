import { Router } from 'express';
import * as notif_ctrl from '../controllers/ctrl.notif';
import { validate } from '../middleware/midd.validate';
import { notif_params } from '../schemas/schema.notifs';

const router = Router();

router.get('/', notif_ctrl.list);
router.patch('/:id/read', validate({params: notif_params}), notif_ctrl.read);
router.patch('/read-all', notif_ctrl.read_all);

export default router;
