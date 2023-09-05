/*
 * @Author: Ethan 
 * @Date: 2023-04-10 15:24:19 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-04-25 10:46:25
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_code', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    code: {
      allowNull: false,
      type: DataTypes.STRING(19),
      comment: '设备编号',
    },
    screen_code: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '屏编号',
    },
    is_used: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '是否使用, 0 未使用, 1 使用',
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
    tableName: 'device_code',
    comment: '设备编码表',
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
      {
        unique: true,
        fields: ["screen_code"],
      },
    ],
  });

};
