const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'rentacar',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

const User = require('./User')(sequelize);
const Customer = require('./Customer')(sequelize);
const Vehicle = require('./Vehicle')(sequelize);
const Booking = require('./Booking')(sequelize);

// Associations
Customer.hasMany(Booking, { foreignKey: 'customer_id' });
Booking.belongsTo(Customer, { foreignKey: 'customer_id' });

Vehicle.hasMany(Booking, { foreignKey: 'vehicle_id' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });


module.exports = {
  sequelize,
  User,
  Customer,
  Vehicle,
  Booking
};
