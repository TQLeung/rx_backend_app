module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('user', 'number', {
          allowNull: true,
          type: Sequelize.STRING(10),
          comment: '编号',
        }),
        queryInterface.addColumn('channel', 'number', {
          allowNull: true,
          type: Sequelize.STRING(10),
          comment: '编号',
        }),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {

  },
};