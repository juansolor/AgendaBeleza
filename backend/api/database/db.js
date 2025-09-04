// database/db.js

const { Sequelize } = require("sequelize");

let sequelize;

// If DATABASE_URL is provided (e.g. Render Postgres), prefer Postgres
if (typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.trim() !== '') {
  const dbUrl = process.env.DATABASE_URL.trim();
  try {
    sequelize = new Sequelize(dbUrl, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {},
      logging: false,
    });
  } catch (err) {
    console.error('Failed to initialize Postgres using DATABASE_URL, falling back to sqlite. Error:', err && err.message);
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: process.env.SQLITE_STORAGE || './database.sqlite',
      logging: false,
    });
  }
} else {
  // Fallback to local sqlite for development and tests
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || './database.sqlite',
    logging: false,
  });
}

module.exports = sequelize;
