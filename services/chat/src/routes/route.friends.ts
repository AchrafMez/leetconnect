import { Router } from "express";
import * as friends_ctrl from '../controllers/ctrl.friends';

const router = Router();

router.post('/', friends_ctrl.send);
router.patch('/:id/accept', friends_ctrl.accept);
router.patch('/:id/reject', friends_ctrl.reject);
router.get('/incoming/:user_id', friends_ctrl.list_incoming);
router.get('/outgoing/:user_id', friends_ctrl.list_outgoing);

router.get('/friends/:user_id', friends_ctrl.list);
router.delete('/:id', friends_ctrl.cancel);
router.delete('/friends/:user_id', friends_ctrl.remove);

export default router;
