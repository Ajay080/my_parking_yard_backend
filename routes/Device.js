import express from 'express';
import {getDevices, getDevice, createDevice, updateDevice, deletedDevice, updateDeviceStreamUrls} from "../controllers/deviceController.js";

const router= express.Router();

router.get('/', getDevices);
router.get('/:id', getDevice);
router.post('/', createDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deletedDevice);
router.post('/update-demo-urls', updateDeviceStreamUrls); // New route to update demo URLs

export default router; // Export the router to be used in server.js
