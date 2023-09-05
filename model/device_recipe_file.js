/*
 * @Author: Ethan 
 * @Date: 2023-05-08 10:44:02 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-28 17:49:38
 */

const constv = require('../config/constv');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('device_recipe_file', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    recipe_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '菜谱 id',
    },
    recipe_no: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '菜谱编号',
    },
    no: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '菜谱内容编号',
    },
    content: {
      allowNull: false,
      type: DataTypes.JSON,
      comment: '菜谱内容',
    },
    device_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '设备id',
    },
    device_code: {
      allowNull: false,
      type: DataTypes.STRING(19),
      comment: '设备编号',
    },
    device_journal_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: 'device journal id',
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING(20),
      defaultValue: constv.RECIPE_FILE_STATUS.PENDING,
      comment: '状态',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'device_recipe_file',
    comment: '设备菜谱文件表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['no'],
      },
    ],
  });

};
