/*
 * @Author: Ethan 
 * @Date: 2023-03-17 14:29:35 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-05-24 11:16:56
 */

const constv = require('../config/constv');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('channel', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'user id',
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '渠道名称',
    },
    company: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '公司名称'
    },
    code: {
      allowNull: true,
      type: DataTypes.STRING(7),
      comment: '编号',
    },
    tax_number: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '企业税号',
    },
    phone: {
      allowNull: false,
      type: DataTypes.STRING(11),
      comment: '手机号码',
    },
    contact: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '联系人',
    },
    operation_mode: {
      allowNull: false,
      type: DataTypes.STRING(20),
      defaultValue: constv.OPERATION_MODE.AGENT,
      comment: '运营模式',
    },
    payment_account: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '打款账户',
    },
    remark: {
      allowNull: true,
      type: DataTypes.STRING,
      comment: '备注',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'channel',
    comment: '渠道表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["phone"],
      },
      {
        unique: true,
        fields: ["code"],
      }
    ],
  });

};
