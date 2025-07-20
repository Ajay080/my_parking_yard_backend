import express from 'express';
import {getDevices, getDevice, createDevice, updateDevice, deletedDevice} from "../controllers/deviceController.js";

const router= express.Router();

router.get('/', getDevices);
router.get('/:id', getDevice);
router.post('/', createDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deletedDevice);

export default router; // Export the router to be used in server.js
