import express from 'express';
import {getVehicles, getVehicle, updateVehicle, createVehicle, deletedVehicle} from '../controllers/vehicleController.js';

const router= express.Router();

router.get('/', getVehicles); // Route to get all vehicles with pagination
router.get('/:id', getVehicle); // Route to get a single vehicle by ID
router.post('/', createVehicle); // Route to create a new vehicle
router.put('/:id', updateVehicle); // Route to update an existing vehicle by ID
router.delete('/:id', deletedVehicle); // Route to delete a vehicle by ID

export default router; // Export the router to be used in server.js