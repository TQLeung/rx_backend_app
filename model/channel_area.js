module.exports = (sequelize, DataTypes) => {
  return sequelize.define('channel_area', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'id',
    },
    province: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '省'
    },
    province_code: {
      allowNull: false,
      type: DataTypes.STRING(20),
    },
    city: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '市',
    },
    city_code: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '市级编号',
    },
    area: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '区',
    },
    area_code: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '区编号'
    },
    channel_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '渠道 id',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'channel_area',
    comment: '渠道地区分管表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [

    ],
  });

};