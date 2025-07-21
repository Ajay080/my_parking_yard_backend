import cron from "node-cron";
import { Spot } from "../models/Spot.js";
import { Booking } from "../models/Booking.js";

// This job runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const spots = await Spot.find({});
    const now = new Date();

    for (const spot of spots) {
      // Find all bookings for this spot that are not cancelled
      const bookings = await Booking.find({
        spotId: spot._id,
        bookingStatus: { $ne: "Cancelled", $ne: "Pending" }
      });

      // Find if any booking is currently active
      const active = bookings.find(
        (b) => new Date(b.startTime) <= now && new Date(b.endTime) >= now
      );
      // Find if any booking is scheduled for the future
      const reserved = bookings.find(
        (b) => new Date(b.startTime) > now
      );

      if (active) {
        spot.status = "Occupied";
      } else if (reserved) {
        spot.status = "Reserved";
      } else {
        spot.status = "Available";
      }
      await spot.save();
    }
    console.log("Spot statuses updated at", now);
  } catch (err) {
    console.error("Error updating spot statuses:", err);
  }
});