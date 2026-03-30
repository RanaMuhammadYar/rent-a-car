const { Customer } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.findAll({ order: [['created_at', 'DESC']] });
  res.json(customers);
});

exports.getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }
  res.json(customer);
});

exports.createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const [updatedRowsCount] = await Customer.update(req.body, { 
    where: { id: req.params.id }
  });
  if (updatedRowsCount === 0) {
    const error = new Error('Customer not found or no changes made');
    error.statusCode = 404;
    throw error;
  }
  res.json({ message: 'Customer updated successfully' });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  const deletedCount = await Customer.destroy({ where: { id: req.params.id } });
  if (deletedCount === 0) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ message: 'Customer deleted successfully' });
});
