import {Booking} from "../models/Booking.js"; // Assuming you have a Booking model to check booking existence
import {User} from "../models/User.js";
import {Vehicle} from "../models/Vehicle.js";
import {Spot} from "../models/Spot.js";
import {Zone} from "../models/Zone.js";

const getBookings = async (req, res) => {
  try {
    const { pageSize = 10, pageNumber = 0, Search = "" } = req.query;
    const zoneId = req.query.zoneId || null;

    const filter = {};
    if (zoneId) filter.zoneId = zoneId;

    const bookings = await Booking.find(filter)
      .skip(pageNumber * pageSize)
      .limit(Number(pageSize)).populate([{
        path: "userId",
        select: "name email"
      }, {
        path: "spotId",
        select: "name"
      }, {
        path: "zoneId",
        select: "name"
      }]);

    const total = await Booking.countDocuments(filter);

    return res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings,
      total,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const getBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        if (!bookingId) return res.status(400).json({ message: "error", error: "Booking ID is required" });

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "error", error: "Booking not found" });

        return res.status(200).json({ message: "Booking fetched successfully", data: booking });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const createBooking = async (req, res) => {
    try {
        const { userId, numberPlate, spotId, zoneId, startTime, endTime, bookingStatus, amount } = req.body;

        if (!userId || !numberPlate || !spotId || !zoneId || !startTime || !endTime || !bookingStatus || !amount) {
            return res.status(400).json({ message: "error", error: "All fields are required" });
        }

        const userExists = await User.findById(userId);
        if (!userExists) return res.status(404).json({ message: "error", error: "User not found" });

        const spotExists = await Spot.findById(spotId);
        if (!spotExists) return res.status(404).json({ message: "error", error: "Spot not found" });

        const zoneExists = await Zone.findById(zoneId);
        if (!zoneExists) return res.status(404).json({ message: "error", error: "Zone not found" });

        const newBooking = new Booking({
            userId,
            numberPlate,
            spotId,
            zoneId,
            startTime,
            endTime,
            amount,
            bookingStatus: "Confirmed"
        });

        await newBooking.save();

        return res.status(201).json({ message: "Booking created successfully", data: newBooking });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        if (!bookingId) return res.status(400).json({ message: "error", error: "Booking ID is required" });

        const { userId, numberPlate, spotId, zoneId, startTime, endTime, bookingStatus, amount } = req.body;

        if (!userId || !numberPlate || !spotId || !zoneId || !startTime || !endTime || !bookingStatus || !amount) {
            return res.status(400).json({ message: "error", error: "All fields are required" });
        }

        const userExists = await User.findById(userId);
        if (!userExists) return res.status(404).json({ message: "error", error: "User not found" });

        const spotExists = await Spot.findById(spotId);
        if (!spotExists) return res.status(404).json({ message: "error", error: "Spot not found" });

        const zoneExists = await Zone.findById(zoneId);
        if (!zoneExists) return res.status(404).json({ message: "error", error: "Zone not found" });

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
            userId,
            numberPlate,
            spotId,
            zoneId,
            startTime,
            endTime,
            bookingStatus,
            amount
        }, { new: true });

        if (!updatedBooking) return res.status(404).json({ message: "error", error: "Booking not found" });

        return res.status(200).json({ message: "Booking updated successfully", data: updatedBooking });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const updateBookingStatus = async (req, res) => {
    try {
        const bookingId = req.params.id;
        if (!bookingId) return res.status(400).json({ message: "error", error: "Booking ID is required" });

        const { bookingStatus } = req.body;
        if (!bookingStatus) return res.status(400).json({ message: "error", error: "Booking status is required" });

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { bookingStatus }, { new: true }); // new means return the updated document
        if (!updatedBooking) return res.status(404).json({ message: "error", error: "Booking not found" });

        return res.status(200).json({ message: "Booking status updated successfully", data: updatedBooking });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export { getBookings, getBooking, createBooking, updateBooking, updateBookingStatus };