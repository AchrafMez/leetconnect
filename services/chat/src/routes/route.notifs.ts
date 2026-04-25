import { Router } from 'express';
import * as notif_ctrl from '../controllers/ctrl.notif';

const router = Router();

// http://localhost:1337/api/chat/notifs

router.get('/', notif_ctrl.list);
router.post('/', notif_ctrl.create);
router.patch('/:id/read', notif_ctrl.read);
router.patch('/read-all', notif_ctrl.read_all);

// router.get('/', (req, res) => {
// 	console.log('GET: api/chat/notifs endpoint');
// 	res.send('GET: api/chat/notifs endpoint');
// });

// router.patch('/:id/read', (req, res) => {
// 	console.log(`PATCH: api/chat/notifs/${req.params.id}/read endpoint`);
// 	res.send(`PATCH: api/chat/notifs/${req.params.id}/read endpoint`);
// });

// router.patch('/read-all', (req, res) => {
// 	console.log(`PATCH: api/chat/notifs/read-all endpoint`);
// 	res.send(`PATCH: api/chat/notifs/read-all endpoint`);
// });

export default router;
