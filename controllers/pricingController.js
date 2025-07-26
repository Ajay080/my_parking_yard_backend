import { Booking } from '../models/Booking.js';
import { Zone } from '../models/Zone.js';
import { Spot } from '../models/Spot.js';

// Base pricing rates (in Rupees per minute)
const BASE_RATES = {
  normal: 2,      // ₹2 per minute during normal hours
  peak: 4,        // ₹4 per minute during peak hours
  weekend: 3,     // ₹3 per minute during weekends
  holiday: 5      // ₹5 per minute during holidays
};

// Peak hours definition (24-hour format)
const PEAK_HOURS = {
  morning: { start: 8, end: 10 },    // 8 AM - 10 AM
  evening: { start: 17, end: 20 }    // 5 PM - 8 PM
};

// Weekend days
const WEEKEND_DAYS = [0, 6]; // Sunday = 0, Saturday = 6

// Indian holidays (simplified - you can expand this)
const HOLIDAYS = [
  '2025-01-26', // Republic Day
  '2025-03-13', // Holi
  '2025-08-15', // Independence Day
  '2025-10-02', // Gandhi Jayanti
  '2025-10-24', // Dussehra
  '2025-11-12', // Diwali
  '2025-12-25'  // Christmas
];

// Calculate if a time falls within peak hours
const isPeakHour = (hour) => {
  return (hour >= PEAK_HOURS.morning.start && hour < PEAK_HOURS.morning.end) ||
         (hour >= PEAK_HOURS.evening.start && hour < PEAK_HOURS.evening.end);
};

// Check if a date is a weekend
const isWeekend = (date) => {
  return WEEKEND_DAYS.includes(date.getDay());
};

// Check if a date is a holiday
const isHoliday = (date) => {
  const dateString = date.toISOString().split('T')[0];
  return HOLIDAYS.includes(dateString);
};

// Get demand multiplier based on historical data
const getDemandMultiplier = async (zoneId, startTime, endTime) => {
  try {
    // Get last week's booking data for the same time period
    const lastWeekStart = new Date(startTime);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(endTime);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    // Get total spots in the zone
    const zone = await Zone.findById(zoneId);
    if (!zone) {
      throw new Error(`Zone not found: ${zoneId}`);
    }
    
    const totalSpots = await Spot.countDocuments({ zoneId });

    if (totalSpots === 0) return 1.0;

    // Get bookings from last week for the same time period
    const historicalBookings = await Booking.find({
      zoneId: zoneId,
      startTime: { $gte: lastWeekStart },
      endTime: { $lte: lastWeekEnd },
      status: { $in: ['confirmed', 'completed'] }
    });

    // Calculate occupancy rate
    const occupancyRate = historicalBookings.length / totalSpots;

    // Apply demand multiplier based on occupancy
    if (occupancyRate >= 0.9) return 1.5;      // 90%+ occupancy = 1.5x price
    if (occupancyRate >= 0.7) return 1.3;      // 70%+ occupancy = 1.3x price
    if (occupancyRate >= 0.5) return 1.1;      // 50%+ occupancy = 1.1x price
    if (occupancyRate <= 0.2) return 0.8;      // Low demand = 0.8x price

    return 1.0; // Normal demand
  } catch (error) {
    console.error('Error calculating demand multiplier:', error);
    return 1.0; // Default to normal pricing if error
  }
};

// Calculate dynamic pricing
const calculatePrice = async (req, res) => {
  try {
    const { zoneId, startTime, endTime, spotId } = req.body;

    if (!zoneId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Zone ID, start time, and end time are required'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = Math.ceil((end - start) / (1000 * 60));

    if (durationMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Initialize pricing breakdown
    let totalCost = 0;
    const breakdown = {
      baseRate: 0,
      peakHourMultiplier: 0,
      weekendMultiplier: 0,
      holidayMultiplier: 0,
      demandMultiplier: 0,
      totalMinutes: durationMinutes
    };

    // Calculate base rate and multipliers for each hour
    let currentTime = new Date(start);
    const endDateTime = new Date(end);

    while (currentTime < endDateTime) {
      const nextHour = new Date(currentTime);
      nextHour.setMinutes(60);
      
      const segmentEnd = nextHour > endDateTime ? endDateTime : nextHour;
      const segmentMinutes = (segmentEnd - currentTime) / (1000 * 60);
      
      let ratePerMinute = BASE_RATES.normal;
      let multipliers = [];

      // Check for peak hours
      if (isPeakHour(currentTime.getHours())) {
        ratePerMinute = BASE_RATES.peak;
        multipliers.push('Peak Hour');
        breakdown.peakHourMultiplier += segmentMinutes;
      }

      // Check for weekend
      if (isWeekend(currentTime)) {
        ratePerMinute = Math.max(ratePerMinute, BASE_RATES.weekend);
        multipliers.push('Weekend');
        breakdown.weekendMultiplier += segmentMinutes;
      }

      // Check for holiday
      if (isHoliday(currentTime)) {
        ratePerMinute = BASE_RATES.holiday;
        multipliers.push('Holiday');
        breakdown.holidayMultiplier += segmentMinutes;
      }

      breakdown.baseRate += segmentMinutes * BASE_RATES.normal;
      totalCost += segmentMinutes * ratePerMinute;

      currentTime = nextHour;
    }

    // Apply demand-based pricing
    const demandMultiplier = await getDemandMultiplier(zoneId, start, end);
    breakdown.demandMultiplier = demandMultiplier;
    totalCost *= demandMultiplier;

    // Round to nearest rupee
    totalCost = Math.ceil(totalCost);

    // Get zone information
    const zone = await Zone.findById(zoneId);

    const response = {
      success: true,
      data: {
        zoneId,
        zoneName: zone?.name,
        startTime,
        endTime,
        durationMinutes,
        totalCost,
        currency: 'INR',
        costPerMinute: (totalCost / durationMinutes).toFixed(2),
        breakdown,
        demandLevel: getDemandLevel(demandMultiplier),
        savings: demandMultiplier < 1 ? Math.ceil((totalCost / demandMultiplier) - totalCost) : 0
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get demand level description
const getDemandLevel = (multiplier) => {
  if (multiplier >= 1.5) return 'Very High';
  if (multiplier >= 1.3) return 'High';
  if (multiplier >= 1.1) return 'Moderate';
  if (multiplier <= 0.8) return 'Low';
  return 'Normal';
};

// Get pricing history for analytics
const getPricingHistory = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { startDate, endDate } = req.query;

    // Get bookings from the specified period
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const bookings = await Booking.find({
      zoneId,
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['confirmed', 'completed'] }
    }).sort({ createdAt: -1 });

    // Calculate average pricing metrics
    const totalCost = bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);
    const averageCost = bookings.length > 0 ? totalCost / bookings.length : 0;

    // Group by hour to show peak patterns
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      bookingCount: 0,
      totalRevenue: 0,
      averagePrice: 0
    }));

    bookings.forEach(booking => {
      const hour = new Date(booking.startTime).getHours();
      hourlyData[hour].bookingCount++;
      hourlyData[hour].totalRevenue += booking.cost || 0;
    });

    // Calculate averages
    hourlyData.forEach(data => {
      data.averagePrice = data.bookingCount > 0 ? data.totalRevenue / data.bookingCount : 0;
    });

    res.json({
      success: true,
      data: {
        period: { start, end },
        totalBookings: bookings.length,
        totalRevenue: totalCost,
        averageCost: Math.round(averageCost),
        hourlyData,
        peakHours: hourlyData
          .filter(data => data.bookingCount > 0)
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error fetching pricing history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get peak hours data
const getPeakHours = async (req, res) => {
  try {
    const { zoneId } = req.params;

    // Get last 30 days of booking data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const bookings = await Booking.find({
      zoneId,
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ['confirmed', 'completed'] }
    });

    // Analyze peak patterns
    const hourlyAnalysis = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      bookingCount: 0,
      isPeak: isPeakHour(hour)
    }));

    const weekdayAnalysis = Array.from({ length: 7 }, (_, day) => ({
      day,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
      bookingCount: 0,
      isWeekend: WEEKEND_DAYS.includes(day)
    }));

    bookings.forEach(booking => {
      const startTime = new Date(booking.startTime);
      const hour = startTime.getHours();
      const day = startTime.getDay();

      hourlyAnalysis[hour].bookingCount++;
      weekdayAnalysis[day].bookingCount++;
    });

    res.json({
      success: true,
      data: {
        hourlyAnalysis,
        weekdayAnalysis,
        peakHours: PEAK_HOURS,
        weekendDays: WEEKEND_DAYS,
        upcomingHolidays: HOLIDAYS.filter(date => new Date(date) > new Date())
      }
    });
  } catch (error) {
    console.error('Error fetching peak hours data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export { calculatePrice, getPricingHistory, getPeakHours };
