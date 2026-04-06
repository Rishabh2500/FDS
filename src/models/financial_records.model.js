module.exports = (sequelize, DataTypes) => {
  const FinancialRecord = sequelize.define('FinancialRecord', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR'
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    transaction_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    deleted_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'financial_records',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['category_id'] },
      { fields: ['transaction_date'] },
      { fields: ['type'] },
      { fields: ['user_id', 'transaction_date'] }
    ]
  });

  return FinancialRecord;
};