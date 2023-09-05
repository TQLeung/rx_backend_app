module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'commission_plan',
      'remark',
      {
        allowNull: true,
        type: Sequelize.STRING,
        comment: '备注',
      }
    );
  },
  down: (queryInterface, Sequelize) => {

  },
};