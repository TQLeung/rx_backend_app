module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      comment: 'user id',
    },
    channel_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      comment: '渠道 id',
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '名称'
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '用户性质, 企业或个人',
    },
    code: {
      allowNull: true,
      type: DataTypes.STRING(7),
      comment: '编号',
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING(20),
      defaultValue: 'normal',
      comment: '用户状态，正常、暂停、欠费'
    },
    contact: {
      allowNull: false,
      type: DataTypes.STRING(20),
      comment: '联系人',
    },
    phone: {
      allowNull: false,
      type: DataTypes.STRING(11),
      comment: '联系人电话',
    },
    company: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '公司名称'
    },
    tax_number: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '企业税号',
    },
    payment_account: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: '打款账户',
    },
    remark: {
      allowNull: true,
      type: DataTypes.STRING,
      comment: '备注'
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
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'user',
    comment: '用户表',
    defaultScope: {
      attributes: {
        exclude: ['updated_at', 'deleted_at'],
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["phone"],
      },
      {
        unique: true,
        fields: ["code"],
      },
    ],
  });

};