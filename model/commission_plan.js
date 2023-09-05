/*
 * @Author: Ethan 
 * @Date: 2023-03-16 17:29:02 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-05-24 14:58:47
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('commission_plan', {
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
      comment: '名称',
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING(10),
      comment: '类型, 月付 monthly, 季付 quarter, 半年付 semiannual, 年付 annual',
    },
    discount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '折扣，百分比',
    },
    renxin_amount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '饪芯金额，单位分'
    },
    agent_amount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '代理商金额，单位分'
    },
    settlement_day: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: '结算日'
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
    tableName: 'commission_plan',
    comment: '佣金方案表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["name"],
      }
    ],
  });

};
