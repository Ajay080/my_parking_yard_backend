import express from 'express';
import { startStream, enableStream, disableStream, getStreamStatus } from '../controllers/streamController.js';

const router = express.Router();

router.get('/:deviceId', startStream);
router.post('/enable/:deviceId', enableStream);
router.post('/disable/:deviceId', disableStream);
router.get('/status/:deviceId', getStreamStatus); // New route for stream status

export default router;
