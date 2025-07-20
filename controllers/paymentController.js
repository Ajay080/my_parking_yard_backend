import Payment from "../models/Payment";
import Booking from "../models/Booking"; // Assuming you have a Booking model to check booking existence

const getPayments = async (req, res) => {
    try {
        const { pageSize, pageNumber, search } = req.query;
        let payments = [];
        let totalPayments = 0;

        if (!pageSize || !pageNumber) {
            payments = await Payment.find({ bookingId: { $regex: search || "", $options: "i" } })
                .skip(pageNumber * pageSize)
                .limit(pageSize);
        } else {
            payments = await Payment.find({ bookingId: { $regex: search || "", $options: "i" } });
        }

        totalPayments = await Payment.countDocuments({ bookingId: { $regex: search || "", $options: "i" } });

        return res.status(200).json({
            message: "Payments fetched successfully",
            data: payments,
            total: totalPayments
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}  

const getPayment = async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId) return res.status(400).json({ message: "error", error: "Payment ID is required" });

        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: "error", error: "Payment not found" });

        return res.status(200).json({ message: "Payment fetched successfully", data: payment });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}           

const createPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod, transactionId, paymentTimeStamp } = req.body;

        if (!bookingId || !amount || !paymentMethod || !transactionId) {
            return res.status(400).json({ message: "error", error: "Booking ID, Amount, Payment Method and Transaction ID are required" });
        }

        const existingBooking = await Booking.findById(bookingId);
        if (!existingBooking) return res.status(404).json({ message: "error", error: "Booking not found" });

        const newPayment = new Payment({
            bookingId,
            amount,
            paymentMethod,
            transactionId,
            paymentTimeStamp
        });

        await newPayment.save();
        return res.status(201).json({ message: "Payment created successfully", data: newPayment });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const updatePayment = async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId) return res.status(400).json({ message: "error", error: "Payment ID is required" });

        const { bookingId, amount, paymentMethod, transactionId, paymentTimeStamp } = req.body;

        if (!bookingId || !amount || !paymentMethod || !transactionId) {
            return res.status(400).json({ message: "error", error: "Booking ID, Amount, Payment Method and Transaction ID are required" });
        }

        const existingBooking = await Booking.findById(bookingId);
        if (!existingBooking) return res.status(404).json({ message: "error", error: "Booking not found" });

        const updatedPayment = await Payment.findByIdAndUpdate(paymentId, {
            bookingId,
            amount,
            paymentMethod,
            transactionId,
            paymentTimeStamp
        }, { new: true });

        if (!updatedPayment) return res.status(404).json({ message: "error", error: "Payment not found" });

        return res.status(200).json({ message: "Payment updated successfully", data: updatedPayment });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const deletePayment = async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId) return res.status(400).json({ message: "error", error: "Payment ID is required" });

        const deletedPayment = await Payment.findByIdAndDelete(paymentId);
        if (!deletedPayment) return res.status(404).json({ message: "error", error: "Payment not found" });

        return res.status(200).json({ message: "Payment deleted successfully", data: deletedPayment });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export {getPayments, getPayment, createPayment, updatePayment, deletePayment};