/*
 * @Author: Ethan 
 * @Date: 2023-04-13 16:32:50 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-04-25 15:30:08
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_info', {
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
      comment: '产品名称',
    },
    category: {
      allowNull: false,
      type: DataTypes.STRING(10),
      comment: '设备分类名称',
    },
    category_code: {
      allowNull: false,
      type: DataTypes.STRING(2),
      comment: '设备分类编码',
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING(10),
      comment: '设备类型名称，设备分类的二级',
    },
    type_code: {
      allowNull: false,
      type: DataTypes.STRING(2),
      comment: '设备类型编码',
    },
    version: {
      allowNull: false,
      type: DataTypes.STRING(10),
      comment: '迭代版本名称',
    },
    version_code: {
      allowNull: false,
      type: DataTypes.STRING(2),
      comment: '迭代版本编码',
    },
    standard: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '执行标准'
    },
    voltage: {
      allowNull: true,
      type: DataTypes.STRING(10),
      comment: '电压',
    },
    electric_current: {
      allowNull: true,
      type: DataTypes.STRING(10),
      comment: '电流',
    },
    rate: {
      allowNull: true,
      type: DataTypes.STRING(10),
      comment: '频率',
    },
    power: {
      allowNull: true,
      type: DataTypes.STRING(10),
      comment: '功率',
    },
    net_weight: {
      allowNull: true,
      type: DataTypes.STRING(10),
      comment: '净重',
    },
    remark: {
      allowNull: true,
      type: DataTypes.STRING(50),
      comment: '备注'
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
    tableName: 'device_info',
    comment: '设备信息表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['category_code', 'type_code', 'version_code'],
      },
    ],
  });

};
