import express from 'express';
import { getBookings, getBooking, createBooking, updateBooking, updateBookingStatus, getReportSummary } from '../controllers/bookingController.js';
const router = express.Router();

router.get("/report", getReportSummary); // <-- Move this above
router.get("/", getBookings);
router.get("/:id", getBooking);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.patch("/:id/status", updateBookingStatus);

export default router;
