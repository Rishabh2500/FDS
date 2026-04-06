const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const User = require('./users.model')(sequelize, DataTypes);
const Role = require('./roles.model')(sequelize, DataTypes);
const FinancialRecord = require('./financial_records.model')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);
const Token = require('./tokens.model')(sequelize, DataTypes);
const ActivityLogs = require('./user.activity.logs.model')(sequelize, DataTypes);

// Role <-> User
User.belongsTo(Role, { foreignKey: 'role_id', onDelete: 'RESTRICT' });
Role.hasMany(User, { foreignKey: 'role_id' });

// User <-> Financial Records
FinancialRecord.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(FinancialRecord, { foreignKey: 'user_id' });

// Category <-> Financial Records
FinancialRecord.belongsTo(Category, { foreignKey: 'category_id', onDelete: 'RESTRICT' });
Category.hasMany(FinancialRecord, { foreignKey: 'category_id' });

// User <-> Tokens
Token.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(Token, { foreignKey: 'user_id' });

// User <-> ActivityLogs
ActivityLogs.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(ActivityLogs, { foreignKey: 'user_id' });

// Self reference
User.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
User.belongsTo(User, { as: 'deleter', foreignKey: 'deleted_by' });

User.hasMany(User, { as: 'createdUsers', foreignKey: 'created_by' });
User.hasMany(User, { as: 'deletedUsers', foreignKey: 'deleted_by' });

// DB Connectivity
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected successfully ✅');

    await sequelize.sync({ force: false });
    console.log('Models synced ✅');
  } catch (error) {
    console.error('DB error ❌', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  User,
  Role,
  FinancialRecord,
  Category,
  Token,
  ActivityLogs
};