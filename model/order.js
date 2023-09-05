/*
 * @Author: Ethan 
 * @Date: 2023-05-11 10:32:05 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-22 10:30:02
 */

const constv = require('../config/constv');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('order', {
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
      comment: '订单编号',
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
    device_journal_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '设备台帐 id',
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'user id',
    },
    channel_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'channel id',
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '状态',
    },
    commission_plan_name: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '佣金方案名称',
    },
    commission_plan_type: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '佣金方案类型',
    },
    commission_plan_renxin_amount: {
      allowNull: true,
      type: DataTypes.INTEGER,
      comment: '饪芯金额, 单位分',
    },
    commission_plan_agent_amount: {
      allowNull: true,
      type: DataTypes.INTEGER,
      comment: '代理商金额, 单位分',
    },
    months: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '购买月份数量',
    },
    price: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '价格',
    },
    total_amount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '订单总金额, 单位: 分',
    },
    payment_method: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '支付方式',
    },
    payment_status: {
      allowNull: true,
      type: DataTypes.STRING(15),
      comment: '支付状态, pending 待支付, paid 支付完成, expired 支付超时',
    },
    pay_at: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '支付时间',
    },
    closed_at: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '订单关闭时间',
    },
    cancel_at: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '订单取消时间',
    },
    remark: {
      allowNull: true,
      type: DataTypes.STRING(100),
      comment: '备注',
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
    from: {
      allowNull: false,
      type: DataTypes.STRING(20),
      defaultValue: constv.ORDER_FROM_TYPE.MINI_PROGRAM,
      comment: '订单来源',
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING(20),
      defaultValue: constv.ORDER_TYPE.COMMON,
      comment: '订单类型',
    },
    trial_begin: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '试用开始时间',
    },
    trial_end: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: '试用结束时间',
    },
    trial_reason: {
      allowNull: true,
      type: DataTypes.STRING(100),
      comment: '试用原因',
    },
    is_calculated: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '是否计算',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'order',
    comment: '订单表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["code"],
      },
    ],
  });

};
