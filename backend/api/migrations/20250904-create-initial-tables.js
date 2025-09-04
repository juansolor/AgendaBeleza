'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      telefone: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING, unique: true },
      senha: { type: Sequelize.STRING },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true }
    });

    await queryInterface.createTable('admins', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, unique: true },
      senha: { type: Sequelize.STRING, allowNull: false },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true }
    });

    await queryInterface.createTable('profissionals', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      telefone: { type: Sequelize.STRING },
      especialidade: { type: Sequelize.STRING },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true }
    });

    await queryInterface.createTable('tipos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false }
    });

    await queryInterface.createTable('servicos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      duracao: { type: Sequelize.INTEGER },
      preco: { type: Sequelize.FLOAT },
      tipoId: { type: Sequelize.INTEGER }
    });

    await queryInterface.createTable('agendamentos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      clienteId: { type: Sequelize.INTEGER },
      servicoId: { type: Sequelize.INTEGER },
      profissionalId: { type: Sequelize.INTEGER },
      data: { type: Sequelize.DATEONLY },
      hora: { type: Sequelize.STRING },
      categoria: { type: Sequelize.STRING }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('agendamentos');
    await queryInterface.dropTable('servicos');
    await queryInterface.dropTable('tipos');
    await queryInterface.dropTable('profissionals');
    await queryInterface.dropTable('admins');
    await queryInterface.dropTable('clientes');
  }
};
