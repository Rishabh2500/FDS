const { FinancialRecord, ActivityLogs, Category } = require('../models');
const { fn, col, Op } = require("sequelize");
const logger = require('../utils/logger');

exports.total_income = async (req, res) => {
    try {

        logger.info("Total_income API hit", {
            route: "/api/dashboard/total_income",
            method: "GET",
            requested_by: req.user?.user_id,
            query: req.query,
            params: req.params
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const category_id = req.params.category_id || req.query.category_id;

        const where = {
            type: 'income',
            is_deleted: false
        };

        if (category_id) {
            where.category_id = category_id;
        }

        const result = await FinancialRecord.findOne({
            attributes: [[fn('SUM', col('amount')), 'total_income']],
            where,
            raw: true
        });

        const total_income = result.total_income || 0;

        await ActivityLogs.create({
            user_id: req.user.user_id,
            activity: `TOTAL INCOME FETCHED${category_id ? ` (category_id: ${category_id})` : ''}`,
            activity_at: new Date(),
            is_active: true
        });

        return res.status(200).json({
            success: true,
            message: "Total income fetched successfully",
            data: {
                category_id: category_id || null,
                total_income: Number(total_income)
            }
        });

    } catch (error) {
        logger.error("Total_income API Error", { message: error.message });
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.total_expense = async (req, res) => {
    try {

        const category_id = req.params.category_id || req.query.category_id;

        const where = {
            type: 'expense',
            is_deleted: false
        };

        if (category_id) {
            where.category_id = category_id;
        }

        const result = await FinancialRecord.findOne({
            attributes: [[fn('SUM', col('amount')), 'total_expense']],
            where,
            raw: true
        });

        const total_expense = result.total_expense || 0;

        await ActivityLogs.create({
            user_id: req.user.user_id,
            activity: `TOTAL EXPENSE FETCHED${category_id ? ` (category_id: ${category_id})` : ''}`,
            activity_at: new Date(),
            is_active: true
        });

        return res.status(200).json({
            success: true,
            message: "Total expense fetched successfully",
            data: {
                category_id: category_id || null,
                total_expense: Number(total_expense)
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.net_balance = async (req, res) => {
  try {

    logger.info("Net_balance API hit", {
      route: "/api/dashboard/net_balance",
      method: "GET",
      requested_by: req.user?.user_id,
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const incomeResult = await FinancialRecord.findOne({
      attributes: [
        [fn('SUM', col('amount')), 'total_income']
      ],
      where: {
        type: 'income',
        is_deleted: false
      },
      raw: true
    });

    const expenseResult = await FinancialRecord.findOne({
      attributes: [
        [fn('SUM', col('amount')), 'total_expense']
      ],
      where: {
        type: 'expense',
        is_deleted: false
      },
      raw: true
    });

    const total_income = Number(incomeResult.total_income || 0);
    const total_expense = Number(expenseResult.total_expense || 0);

    const net_balance = total_income - total_expense;

    await ActivityLogs.create({
      user_id: req.user.user_id,
      activity: `NET BALANCE FETCHED`,
      activity_at: new Date(),
      is_active: true
    });

    logger.info("Net balance fetched successfully", {
      total_income,
      total_expense,
      net_balance
    });

    return res.status(200).json({
      success: true,
      message: "Net balance fetched successfully",
      data: {
        total_income,
        total_expense,
        net_balance
      }
    });

  } catch (error) {
    logger.error("Net_balance API Error", {
      message: error.message,
      stack: error.stack,
      route: "/api/dashboard/net_balance"
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

exports.trends = async (req, res) => {
    try {

        logger.info("Trends API hit", {
            route: "/api/dashboard/trends",
            method: "GET",
            user_id: req.user?.user_id
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const now = new Date();

        const weekStart = new Date();
        weekStart.setDate(now.getDate() - 7);

        const monthStart = new Date();
        monthStart.setDate(now.getDate() - 30);

        const getStats = async (startDate) => {

            const income = await FinancialRecord.findOne({
                attributes: [[fn('SUM', col('amount')), 'total_income']],
                where: {
                    type: 'income',
                    is_deleted: false,
                    transaction_date: {
                        [Op.between]: [startDate, now]
                    }
                },
                raw: true
            });

            const expense = await FinancialRecord.findOne({
                attributes: [[fn('SUM', col('amount')), 'total_expense']],
                where: {
                    type: 'expense',
                    is_deleted: false,
                    transaction_date: {
                        [Op.between]: [startDate, now]
                    }
                },
                raw: true
            });

            const total_income = Number(income.total_income || 0);
            const total_expense = Number(expense.total_expense || 0);

            return {
                total_income,
                total_expense,
                net_balance: total_income - total_expense
            };
        };

        const weekly = await getStats(weekStart);
        const monthly = await getStats(monthStart);

        await ActivityLogs.create({
            user_id: req.user.user_id,
            activity: "TRENDS FETCHED (weekly + monthly)",
            activity_at: new Date(),
            is_active: true
        });

        logger.info("Trends fetched successfully");

        return res.status(200).json({
            success: true,
            message: "Trends fetched successfully",
            data: {
                weekly,
                monthly
            }
        });

    } catch (error) {
        logger.error("Trends API Error", {
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};