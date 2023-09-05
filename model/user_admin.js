/*
 * @Author: Ethan 
 * @Date: 2023-03-17 11:24:12 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-03-22 12:07:21
 */

const { INTEGER } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user_admin', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'user id',
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'user id',
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '名称',
    },
    phone: {
      allowNull: false,
      type: DataTypes.STRING(11),
      comment: '手机号码',
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
    tableName: 'user_admin',
    comment: '用户管理帐号表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at', 'password'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["phone"],
      }
    ],
  });

};
