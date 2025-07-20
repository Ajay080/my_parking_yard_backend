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

dotenv.config(); // Load environment variables

const app = express(); // Create an Express application
const PORT = process.env.PORT || 5000; // Set the port

connectDB();

//middleware
app.use(express.json()); // Middleware to parse JSON requests

//Routes
app.use('/users', userRoutes); // User-related routes
app.use('/vehicles', vehicleRoutes); // Vehicle-related routes
app.use('/devices', deviceRoutes); // Device-related routes
app.use('/payments', paymentRoutes); // Payment-related routes
app.use('/zones', zoneRoutes); // Zone-related routes
app.use('/spots', spotRoutes); // Spot-related routes
app.use('/bookings', Booking); // Booking-related routes
app.listen(PORT, ()=>{
    console.log("Server runnig on port", PORT);
})

