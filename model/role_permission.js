/*
 * @Author: Ethan 
 * @Date: 2023-03-18 21:51:45 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-03-21 14:02:53
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('role_permission', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    resource_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'resource id',
    },
    role_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'role id',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'role_permission',
    comment: '角色资源表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["resource_id", 'role_id'],
      }
    ],
  });

};
