const { Booking, Customer, Vehicle } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
  const total_bookings = await Booking.count();
  const total_customers = await Customer.count();
  const total_vehicles = await Vehicle.count();

  const revenueResult = await Booking.sum('total_amount', {
    where: { status: ['active', 'completed'] }
  });

  res.json({
    total_bookings,
    total_customers,
    total_vehicles,
    total_revenue: revenueResult || 0
  });
});
