import { Router } from 'express';
import * as convers_ctrl from '../controllers/ctrl.convers';

const router = Router();

// http://localhost:1337/api/chat/convers

router.get('/', convers_ctrl.list);
router.post('/', convers_ctrl.create);
router.get('/:id', convers_ctrl.get);
router.put('/:id', convers_ctrl.update);
router.delete('/:id', convers_ctrl.remove);

// router.get('/', (req, res) => {
// 	console.log('GET: /convers/ endpoint');
// 	res.send('GET: /convers/ endpoint');
// });

// router.post('/', (req, res) => {
// 	console.log('POST: /convers/ endpoint');
	// res.send('POST: /convers/ endpoint');
// });

// router.get('/:id', (req, res) => {
// 	console.log(`GET: /convers/${req.params.id} endpoint`);
// 	res.send(`GET: /convers/${req.params.id} endpoint`);
// });

// router.put('/:id', (req, res) => {
// 	console.log(`PUT: /convers/${req.params.id} endpoint`);
// 	res.send(`PUT: /convers/${req.params.id} endpoint`);
// });

// router.delete('/:id', (req, res) => {
// 	console.log(`DELETE: /convers/${req.params.id} endpoint`);
// 	res.send(`DELETE: /convers/${req.params.id} endpoint`);
// });

export default router;
