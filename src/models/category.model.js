module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['category_name', 'type']
      },
      {
        fields: ['type']
      }
    ]
  });

  return Category;
};