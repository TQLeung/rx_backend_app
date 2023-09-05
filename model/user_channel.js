

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user_channel', {
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
    channel_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'channel id',
    },
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'user_channel',
    comment: '用户渠道表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [

    ],
  });

};
