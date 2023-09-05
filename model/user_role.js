/*
 * @Author: Ethan 
 * @Date: 2023-03-18 22:00:53 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-03-29 10:48:44
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user_role', {
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
    user_type: {
      allowNull: false,
      type: DataTypes.STRING(10),
      comment: '用户类型, admin or user or channel',
    },
    role_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'role id',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'user_role',
    comment: '用户角色表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["user_id", 'user_type', 'role_id'],
      }
    ],
  });

};
