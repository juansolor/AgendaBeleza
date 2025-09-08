// database/db.js

const { Sequelize } = require("sequelize");

let sequelize;

// If DATABASE_URL is provided (e.g. Render Postgres), prefer Postgres
if (process.env.DATABASE_URL && typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.trim() !== '') {
  const dbUrl = process.env.DATABASE_URL.trim();
  try {
    // Validate URL format before creating Sequelize instance
    const url = new URL(dbUrl);
    if (url.protocol === 'postgres:' || url.protocol === 'postgresql:') {
      sequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {},
        logging: false,
      });
    } else {
      throw new Error('Invalid database URL protocol. Expected postgres: or postgresql:');
    }
  } catch (err) {
    console.error('Failed to initialize Postgres using DATABASE_URL, falling back to sqlite. Error:', err.message || err);
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
