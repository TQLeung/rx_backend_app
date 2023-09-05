/*
 * @Author: Ethan 
 * @Date: 2023-04-12 15:06:55 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-04-25 14:43:58
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_factory', {
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
      comment: '名称',
    },
    code: {
      allowNull: false,
      type: DataTypes.STRING(1),
      comment: '编号',
    },
    address: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '地址',
    },
    telphone: {
      allowNull: true,
      type: DataTypes.STRING(11),
      comment: '电话',
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
    tableName: 'device_factory',
    comment: '设备工厂表',
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
