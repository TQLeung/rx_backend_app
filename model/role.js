/*
 * @Author: Ethan 
 * @Date: 2023-03-18 21:51:45 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-03-21 11:41:34
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('role', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'role id',
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '名称',
    },
    remark: {
      allowNull: true,
      type: DataTypes.STRING(50),
      comment: '备注'
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'role',
    comment: '角色表',
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
