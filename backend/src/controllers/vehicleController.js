const { Vehicle } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.findAll({ order: [['created_at', 'DESC']] });
  res.json(vehicles);
});

exports.getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  res.json(vehicle);
});

exports.createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  res.status(201).json(vehicle);
});

exports.updateVehicle = asyncHandler(async (req, res) => {
  const [updatedCount] = await Vehicle.update(req.body, { where: { id: req.params.id } });
  if (updatedCount === 0) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ message: 'Vehicle updated successfully' });
});

exports.deleteVehicle = asyncHandler(async (req, res) => {
  const deletedCount = await Vehicle.destroy({ where: { id: req.params.id } });
  if (deletedCount === 0) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ message: 'Vehicle deleted successfully' });
});
