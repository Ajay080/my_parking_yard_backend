import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import userRoutes from './routes/User.js';
import vehicleRoutes from './routes/Vehicle.js';
import deviceRoutes from './routes/Device.js';
import paymentRoutes from './routes/Payment.js';
import zoneRoutes from './routes/Zone.js';
import spotRoutes from './routes/Spot.js';
import Bookings from './routes/Booking.js';
import streamRoutes from './routes/Stream.js';
import videoRoutes from './routes/videoRoutes.js';
import setupStream from './streamSetup.js';
import "./utils/sportStatusScheduler.js"; // Import the scheduler to run it
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors());
app.use(express.json());

// Static file serving for videos (works in both dev and production)
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.use('/users', userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/devices', deviceRoutes);
app.use('/payments', paymentRoutes);
app.use('/zones', zoneRoutes);
app.use('/spots', spotRoutes);
app.use('/bookings', Bookings);
app.use('/stream-api', streamRoutes); // <-- Stream API route
app.use('/api/video', videoRoutes); // <-- Video demo routes
setupStream(app); // <-- Serve static HLS files

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
