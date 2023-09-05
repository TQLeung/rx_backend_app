/*
 * @Author: Ethan 
 * @Date: 2023-05-08 10:44:02 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-20 14:52:25
 */

const constv = require('../config/constv');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_approval', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    code: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '审批编号',
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
    type: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '类型',
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '状态',
    },
    journal_status: {
      allowNull: false,
      type: DataTypes.STRING(20),
      defaultValue: constv.DEVICE_STATUS.IN_STOREHOUSE,
      comment: 'save device journal status',
    },
    remark: {
      allowNull: true,
      type: DataTypes.STRING(100),
      comment: '备注',
    },
    author: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '提交人',
    },
    author_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '提交人id',
    },
    author_type: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '提交人类型',
    },
    operator: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '操作人',
    },
    operator_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      comment: '操作人 id',
    },
    operator_type: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '操作人类型',
    },
    operator_remark: {
      allowNull: true,
      type: DataTypes.STRING(100),
      comment: '操作备注',
    },
    operate_at: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '操作时间',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'device_approval',
    comment: '设备审批表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [

    ],
  });

};
