import { Router } from 'express';
import * as convers_ctrl from '../controllers/ctrl.convers';
import { validate } from '../middleware/midd.validate';
import {
	convers_add_member_body,
	convers_create_body,
	convers_params,
	convers_update_body
} from '../schemas/schema.convers';

const router = Router();

router.get('/', convers_ctrl.list);
router.post('/', validate({body: convers_create_body}), convers_ctrl.create);
router.get('/:id', validate({params: convers_params}), convers_ctrl.get);
router.put('/:id', validate({params: convers_params, body: convers_update_body}), convers_ctrl.update);
router.delete('/:id', validate({params: convers_params}), convers_ctrl.remove);
router.post('/:id/members',validate({params: convers_params, body: convers_add_member_body}), convers_ctrl.add_member);

export default router;
