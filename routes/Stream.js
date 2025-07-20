import express from 'express';
import { startStream } from '../controllers/streamController.js';

const router = express.Router();

router.get('/:deviceId', startStream);

export default router;
