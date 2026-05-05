import { Router } from 'express';
import * as notif_ctrl from '../controllers/ctrl.notif';

const router = Router();

router.get('/', notif_ctrl.list);
// router.post('/', notif_ctrl.create);
router.patch('/:id/read', notif_ctrl.read);
router.patch('/read-all', notif_ctrl.read_all);

export default router;
