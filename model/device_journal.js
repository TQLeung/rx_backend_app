/*
 * @Author: Ethan 
 * @Date: 2023-03-18 22:00:53 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-27 18:19:06
 */

const constv = require('../config/constv');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_journal', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    device_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'device id',
    },
    device_code: {
      allowNull: false,
      type: DataTypes.STRING(19),
      comment: '设备编号',
    },
    channel_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      comment: 'channel id',
    },
    user_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      comment: 'user id',
    },
    store_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      comment: 'store id',
    },
    status: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '设备状态',
    },
    rent_status: {
      allowNull: false,
      type: DataTypes.STRING(20),
      defaultValue: constv.DEVICE_RENT_STATUS.CURRENT,
      comment: '租赁状态',
    },
    service_begin: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '服务开始时间',
    },
    service_end: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '服务结束时间',
    },
    activated_at: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '激活时间',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'device_journal',
    comment: '设备台帐表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [

    ],
  });

};
