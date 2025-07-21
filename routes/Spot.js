import { Router } from "express";
import { getSpots, getSpot, createSpot, updateSpot, deleteSpot, getSpotStats } from "../controllers/spotController.js";

const router= Router();
router.get("/stats", getSpotStats); // Route to get spot statistics
router.get("/", getSpots); // Route to get all spots
router.get("/:id", getSpot); // Route to get a single spot by ID
router.post("/", createSpot); // Route to create a new spot
router.put("/:id", updateSpot); // Route to update a spot by ID
router.delete("/:id", deleteSpot); // Route to delete a spot by ID

export default router; // Export the router to be used in server.js