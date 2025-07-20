import express from 'express';
import { startStream, enableStream, disableStream } from '../controllers/streamController.js';

const router = express.Router();

router.get('/:deviceId', startStream);
router.post('/enable/:deviceId', enableStream);
router.post('/disable/:deviceId', disableStream);

export default router;
