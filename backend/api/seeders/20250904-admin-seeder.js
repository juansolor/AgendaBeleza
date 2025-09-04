'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const password = process.env.ADMIN_SEED_PASSWORD || 'admin123';
      const hashed = await bcrypt.hash(password, 10);
      // Use raw SQL check and insert to be compatible with CLI context
      const [results] = await queryInterface.sequelize.query(
        `SELECT id FROM admins WHERE email = 'admin@salao.com' LIMIT 1;`
      );
      if (!results || results.length === 0) {
        await queryInterface.bulkInsert('admins', [
          {
            nome: 'Administrador',
            email: 'admin@salao.com',
            senha: hashed,
            ativo: true
          }
        ], {});
      } else {
        console.log('Admin already exists, skipping seeder insertion.');
      }
    } catch (err) {
      console.error('Seeder admin failed:', err && err.message);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', { email: 'admin@salao.com' }, {});
  }
};
