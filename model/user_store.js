/*
 * @Author: Ethan 
 * @Date: 2023-03-20 11:17:05 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-10 16:02:31
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user_store', {
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
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '门店名称',
    },
    code: {
      allowNull: false,
      type: DataTypes.STRING(12),
      comment: '编码',
    },
    province: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '省'
    },
    province_code: {
      allowNull: true,
      type: DataTypes.STRING(20),
    },
    city: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '市',
    },
    city_code: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '市级编号',
    },
    area: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '区',
    },
    area_code: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '区编号'
    },
    town: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '乡、街道',
    },
    town_code: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '乡、街道编码',
    },
    address_detail: {
      allowNull: true,
      type: DataTypes.STRING(50),
      comment: '详细地址',
    },
    service: {
      allowNull: false,
      type: DataTypes.STRING(10),
      comment: '门店业态',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'user_store',
    comment: '客户门店表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['code'],
      },
      {
        unique: true,
        fields: ['name'],
      },
    ],
  });

};
