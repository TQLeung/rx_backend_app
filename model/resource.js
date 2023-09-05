/*
 * @Author: Ethan 
 * @Date: 2023-03-18 21:51:45 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-03-18 21:59:35
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('resource', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'resource id',
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '名称',
    },
    parent_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '父级资源id',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'resource',
    comment: '资源表',
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
