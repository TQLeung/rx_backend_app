/*
 * @Author: Ethan 
 * @Date: 2023-05-11 14:13:37 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-11 16:02:57
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('iot_log', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    device_code: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '设备编号',
    },
    type: {
      allowNull: true,
      type: DataTypes.STRING(10),
      comment: '类型',
    },
    content: {
      allowNull: true,
      type: DataTypes.TEXT('medium'),
      comment: '内容',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'iot_log',
    comment: 'iot日志表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [

    ],
  });

};
