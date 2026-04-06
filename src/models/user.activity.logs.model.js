module.exports = (sequelize, DataTypes) => {
  const Activity_logs = sequelize.define('Activity_logs', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    activity: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    activity_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    tableName: 'activity_logs',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['activity'] }
    ]
  });

  return Activity_logs;
};