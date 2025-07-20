import express from 'express';
import { getBookings, getBooking, createBooking, updateBooking, updateBookingStatus } from '../controllers/bookingController.js';
const router = express.Router();

router.get("/", getBookings);
router.get("/:id", getBooking);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.patch("/:id/status", updateBookingStatus);

export default router;
