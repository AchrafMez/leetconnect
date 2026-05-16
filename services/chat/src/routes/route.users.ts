import { Router } from 'express';
import * as users_ctrl from '../controllers/ctrl.users';
import { validate } from '../middleware/midd.validate';
import { users_params } from '../schemas/schema.users';

const router = Router();

router.get('/users/:username',
	validate({params: users_params}),
	users_ctrl.get
);

export default router;
