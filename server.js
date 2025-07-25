import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import userRoutes from './routes/User.js';
import authRoutes from './routes/Auth.js';
import vehicleRoutes from './routes/Vehicle.js';
import deviceRoutes from './routes/Device.js';
import paymentRoutes from './routes/Payment.js';
import zoneRoutes from './routes/Zone.js';
import spotRoutes from './routes/Spot.js';
import Bookings from './routes/Booking.js';
import streamRoutes from './routes/Stream.js';
import videoRoutes from './routes/videoRoutes.js';
import setupStream from './streamSetup.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Static file serving for videos (works in both dev and production)
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/devices', deviceRoutes);
app.use('/payments', paymentRoutes);
app.use('/zones', zoneRoutes);
app.use('/spots', spotRoutes);
app.use('/bookings', Bookings);
app.use('/stream-api', streamRoutes);
app.use('/api/video', videoRoutes);
setupStream(app);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server function
const startServer = async () => {
    try {
        // Connect to database first
        await connectDB();
        console.log('Database connected successfully');
        
        // Import and start scheduler only after DB connection
        await import('./utils/sportStatusScheduler.js');
        console.log('Scheduler started');
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

startServer();
