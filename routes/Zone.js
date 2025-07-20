import {Router} from 'express';
import {getZones, getZone, createZone, updateZone, deleteZone} from '../controllers/zoneController.js';
const router = Router();
router.get('/', getZones); // Route to get all zones
router.get('/:id', getZone); // Route to get a single zone by ID                        
router.post('/', createZone); // Route to create a new zone
router.put('/:id', updateZone); // Route to update an existing zone by ID
router.delete('/:id', deleteZone); // Route to delete a zone by ID

export default router; // Export the router to be used in server.js