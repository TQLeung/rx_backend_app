/*
 * @Author: Ethan 
 * @Date: 2023-03-20 11:17:05 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-04-19 10:17:20
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('store_employee', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    store_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'user id',
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '员工名称',
    },
    role: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '员工角色',
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING(32),
      comment: '密码',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'store_employee',
    comment: '员工表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at', 'password'],
      },
    },
    indexes: [

    ],
  });

};
