import express from 'express';
import {protecteRoute} from '../utils/protecteRoute.js';
import { getMessages, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();
router.use(protecteRoute);

router.post('/', sendMessage);
router.get('/:id', getMessages);

export default router;