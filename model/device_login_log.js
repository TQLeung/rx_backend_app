/*
 * @Author: Ethan 
 * @Date: 2023-07-21 17:23:16 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-27 17:28:38
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_login_log', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    device_code: {
      allowNull: false,
      type: DataTypes.STRING(19),
      comment: '设备编码',
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '用户 id',
    },
    user_name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '登录用户名',
    },
    user_type: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '用户类型',
    },
    device_journal_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'device journal id',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'device_login_log',
    comment: '设备登录日志表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [

    ],
  });

};
