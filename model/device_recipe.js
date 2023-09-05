/*
 * @Author: Ethan 
 * @Date: 2023-05-08 10:44:02 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-08-15 15:16:13
 */

const constv = require('../config/constv');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_recipe', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    no: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '菜谱编号',
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '名称',
    },
    weight: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '规格',
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '份数',
    },
    user_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      comment: 'user id',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'device_recipe',
    comment: '设备菜谱表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['no'],
      },
      {
        unique: true,
        fields: ['name', 'weight', 'quantity', 'user_id'],
      },
    ],
  });

};
