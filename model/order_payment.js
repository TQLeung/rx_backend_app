/*
 * @Author: Ethan 
 * @Date: 2023-05-31 14:52:58 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-06-15 18:19:24
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('order_payment', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'user id',
    },
    order_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '订单id',
    },
    order_no: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '订单编号',
    },
    transaction_id: {
      allowNull: false,
      type: DataTypes.STRING(32),
      comment: '微信支付订单号',
    },
    pay_type: {
      allowNull: false,
      type: DataTypes.STRING(15),
      comment: '支付方式',
    },
    order_amount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '订单金额',
    },
    pay_amount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '订单实际支付金额',
    },
    pay_at: {
      allowNull: false,
      type: DataTypes.DATE,
      comment: '支付时间',
    },
    openid: {
      allowNull: true,
      type: DataTypes.STRING(128),
      comment: '支付者 openid',
    },
    pay_account: {
      allowNull: true,
      type: DataTypes.STRING(30),
      comment: '支付账号',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'order_payment',
    comment: '订单支付表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    index: [
      {
        unique: true,
        fields: ['order_id'],
      },
      {
        unique: true,
        fields: ['order_no'],
      },
      {
        unique: true,
        fields: ['transaction_id'],
      },
    ],
  });

};
