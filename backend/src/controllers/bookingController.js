const { Booking, Customer, Vehicle, sequelize } = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.findAll({
    include: [
      { model: Customer, attributes: ['id', 'name', 'email'] },
      { model: Vehicle, attributes: ['id', 'make', 'model', 'license_plate'] }
    ],
    order: [['created_at', 'DESC']]
  });
  res.json(bookings);
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      { model: Customer, attributes: ['id', 'name', 'email'] },
      { model: Vehicle, attributes: ['id', 'make', 'model', 'license_plate'] }
    ]
  });
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  res.json(booking);
});

exports.createBooking = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customer_id, vehicle_id, start_date, end_date } = req.body;

    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    // Check for overlapping bookings
    const overlap = await Booking.findOne({
      where: {
        vehicle_id,
        status: { [Op.notIn]: ['cancelled', 'completed'] },
        [Op.and]: [
          { start_date: { [Op.lte]: end_date } },
          { end_date: { [Op.gte]: start_date } }
        ]
      }
    });

    if (overlap) {
      const error = new Error(`Vehicle is already booked from ${overlap.start_date} to ${overlap.end_date}`);
      error.statusCode = 400;
      throw error;
    }

    // Calculate total amount
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const total_amount = diffDays * vehicle.daily_rate;

    const booking = await Booking.create({
      customer_id,
      vehicle_id,
      start_date,
      end_date,
      total_amount,
      status: 'active'
    }, { transaction: t });

    // Update vehicle status
    await vehicle.update({ status: 'booked' }, { transaction: t });

    await t.commit();
    res.status(201).json(booking);
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    await booking.update({ status }, { transaction: t });

    // If booking is completed or cancelled, set vehicle back to available
    if (status === 'completed' || status === 'cancelled') {
      await Vehicle.update({ status: 'available' }, { 
        where: { id: booking.vehicle_id },
        transaction: t 
      });
    } else if (status === 'active') {
       await Vehicle.update({ status: 'booked' }, { 
        where: { id: booking.vehicle_id },
        transaction: t 
      });
    }

    await t.commit();
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Set vehicle back to available before deleting
    await Vehicle.update({ status: 'available' }, { 
      where: { id: booking.vehicle_id },
      transaction: t 
    });

    await booking.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'Booking deleted successfully and vehicle status updated' });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});
