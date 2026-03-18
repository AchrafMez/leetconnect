import { Router } from 'express';
import * as message_ctrl from '../controllers/ctrl.message';
// import type { Request, Response } from 'express';

const router = Router({ mergeParams: true });

type Params	= { id: string , msg_id: string };

// http://localhost:1337/api/chat/convers/:id/messages

router.get('/', message_ctrl.list);
router.post('/', message_ctrl.send);
router.get('/:msg_id', message_ctrl.get);
router.delete('/:msg_id', message_ctrl.remove);

// router.get('/', (req: Request<Params>, res) => {
// 	const id = req.params.id;

// 	res.send(`GET: convers/${id}/messages/`);
// });

// router.post('/', (req: Request<Params>, res) => {
// 	const id = req.params.id;

// 	res.send(`POST: convers/${id}/messages/`);
// });

// router.get('/:msg_id', (req: Request<Params>, res) => {
// 	const id	 = req.params.id;
// 	const msg_id = req.params.msg_id;

// 	res.send(`GET: convers/${id}/messages/${msg_id}`);
// });

// router.delete('/:msg_id', (req: Request<Params>, res) => {
// 	const id	 = req.params.id;
// 	const msg_id = req.params.msg_id;

// 	res.send(`DELETE: convers/${id}/messages/${msg_id}`);
// });

export default router;
