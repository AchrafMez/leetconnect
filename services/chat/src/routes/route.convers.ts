import { Router } from 'express';
import * as convers_ctrl from '../controllers/ctrl.convers';

const router = Router();

router.get('/', convers_ctrl.list);
router.post('/', convers_ctrl.create);
router.get('/:id', convers_ctrl.get);
router.put('/:id', convers_ctrl.update);
router.delete('/:id', convers_ctrl.remove);
router.post('/:id/members', convers_ctrl.add_member);

export default router;
