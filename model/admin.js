/*
 * @Author: Ethan 
 * @Date: 2023-03-16 17:29:02 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-03-19 11:25:48
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('admin', {
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
    password: {
      allowNull: false,
      type: DataTypes.STRING(32),
      comment: '密码',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'admin',
    comment: '后台管理员用户表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at', 'password'],
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
