import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import userRoutes from './routes/User.js';
import vehicleRoutes from './routes/Vehicle.js';
import deviceRoutes from './routes/Device.js';
import paymentRoutes from './routes/Payment.js';
import zoneRoutes from './routes/Zone.js';
import spotRoutes from './routes/Spot.js';
import Booking from './routes/Booking.js';
import streamRoutes from './routes/Stream.js';
import setupStream from './streamSetup.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(express.json());

app.use('/users', userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/devices', deviceRoutes);
app.use('/payments', paymentRoutes);
app.use('/zones', zoneRoutes);
app.use('/spots', spotRoutes);
app.use('/bookings', Booking);
app.use('/stream-api', streamRoutes); // <-- Stream API route
setupStream(app); // <-- Serve static HLS files

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
