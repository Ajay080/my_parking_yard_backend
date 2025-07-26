import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { calculatePrice, getPricingHistory, getPeakHours } from '../controllers/pricingController.js';

const router = express.Router();

// Calculate dynamic pricing
router.post('/calculate', authenticate, calculatePrice);

// Get pricing history for analytics
router.get('/history/:zoneId', authenticate, getPricingHistory);

// Get peak hours data
router.get('/peak-hours/:zoneId', authenticate, getPeakHours);

export default router;
