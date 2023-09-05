/*
 * @Author: Ethan 
 * @Date: 2023-04-10 15:24:19 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-04-25 14:05:03
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_category', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '分类名称',
    },
    code: {
      allowNull: false,
      type: DataTypes.STRING(2),
      comment: '分类编号',
    },
    remark: {
      allowNull: false,
      type: DataTypes.STRING(50),
      comment: '备注',
    },
    operator_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      comment: '操作者id',
    },
    operator_name: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '操作者名称',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'device_category',
    comment: '设备分类表',
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
