const { User, Role, Token, FinancialRecord, ActivityLogs, Category } = require('../models');
require('dotenv').config();
const logger = require('../utils/logger');
const { Op, where, DATE, DATEONLY } = require("sequelize");

exports.create_record = async (req, res) => {
    try {
        
        logger.info("Create_user API hit", {
            route: "/api/transactions/create_record",
            method: "POST",
            requested_by: req.user?.user_id
        });

        const user_id = req.user?.user_id;
        const type = req.validatedData.type;
        const category_id = req.validatedData.category_id;

        const valid_category = await Category.findOne ({
            where: {
                id: category_id,
                type,
            }
        });

        if (!valid_category) {
            logger.warn("Invalid type or category_id");

            return res.status(400).json({
                success: false,
                message: "Enter a valid type and category_id"
            });
        }

        const new_record = await FinancialRecord.create ({
            user_id,
            type: valid_category.type,
            amount: req.validatedData.amount,
            currency: req.validatedData.currency,
            category_id: valid_category.id,
            transaction_date: new DATEONLY(),
            description: req.validatedData.description,
        });

        await ActivityLogs.create({
            user_id,
            activity: `New Transaction for ${type}`,
            activity_at: new Date(),
        });

        logger.info("New Transaction created successfully");

        return res.status(201).json({
            success: true,
            message: "New Transaction created successfully",
            data: {
                new_record
            }
        });

    } catch (error) {
        logger.error("Create_record API Error", {
            message: error.message,
            stack: error.stack,
            route: "/api/transactions/create_record"
        });

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

exports.records_list = async (req, res) => {
    try {
        
        logger.info("Records_listing API hit", {
            route: "/api/transactions/Records_listing",
            method: "GET",
            requested_by: req.user?.user_id
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        };

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const {
            user_id,
            type,
            amount,
            currency,
            category_id,
            transaction_date,
            description,
        } = req.query;

        const where = {
            is_deleted: false,
        };

        if (user_id) where.user_id = user_id;
        if (type) where.type = { [Op.like]: `%${type}%` };
        if (amount) where.amount = { [Op.like]: `%${amount}%` };
        if (currency) where.currency = { [Op.like]: `%${currency}%`};
        if (category_id) where.category_id = category_id;
        if (transaction_date) where.transaction_date = transaction_date;
        if (description) where.description = description;

        const { count, rows } = await FinancialRecord.findAndCountAll({
        where,
        attributes: [
            'user_id',
            'type',
            'amount',
            'currency',
            'category_id',
            'transaction_date',
            'description',
        ],
        limit,
        offset,
        order: [["created_at", "DESC"]],
        });

        await ActivityLogs.create({
            user_id: req.user.user_id,
            activity: `TRANSACTION RECORDS LIST FETCHED`,
            activity_at: new Date(),
            is_active: true
        });

        const totalRecords = count;
        const totalPages = Math.ceil(totalRecords / limit);

        logger.info("Transaction record list fetched successfully", {
            totalRecords,
            page,
            filters: where
        });

        return res.status(200).json({
            success: true,
            message: "Transaction record list fetched successfully",
            data: rows,
            pagination: {
                totalRecords,
                totalPages,
                currentPage: page,
                limit
            }
        });

    } catch (error) {
        logger.error("Records_listing API Error", {
            message: error.message,
            stack: error.stack,
            route: "/api/transactions/records_listing"
        });

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

exports.update_record = async (req, res) => {
  try {

    logger.info("Update records API hit", {
      route: "/api/transactions/update_record/:record_id/:user_id",
      method: "PATCH",
      requested_by: req.user?.user_id
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const record_id = parseInt(req.params.record_id);
    const user_id = parseInt(req.params.user_id);

    const data = { ...req.validatedData };

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update"
      });
    }

    const existingRecord = await FinancialRecord.findOne({
      where: { id: record_id, user_id }
    });

    if (!existingRecord) {
      logger.warn("Record not found", { record_id, user_id });

      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    if (data.category_id || data.type) {
      const typeToCheck = data.type || existingRecord.type;
      const categoryToCheck = data.category_id || existingRecord.category_id;

      const valid_category = await Category.findOne({
        where: {
          id: categoryToCheck,
          type: typeToCheck
        }
      });

      if (!valid_category) {
        return res.status(400).json({
          success: false,
          message: "Invalid type and category combination"
        });
      }

      data.type = valid_category.type;
      data.category_id = valid_category.id;
    }

    await FinancialRecord.update(data, {
      where: { id: record_id, user_id }
    });

    const updatedFields = Object.keys(data);

    await ActivityLogs.create({
      user_id: req.user.user_id,
      activity: `UPDATED TRANSACTION ${record_id}: ${updatedFields.join(", ")}`,
      activity_at: new Date()
    });

    logger.info("Transaction updated successfully", {
      record_id,
      updated_by: req.user.user_id
    });

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully"
    });

  } catch (error) {
    logger.error("Update Record Details Error", {
      message: error.message,
      stack: error.stack,
      route: "/api/transactions/update_record/:record_id/:user_id"
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

exports.delete_record = async (req, res) => {
    try {

        logger.info("Delete_user API hit", {
            route: "/api/transactions/delete_record/:record_id",
            method: "PATCH",
            user_id: req.user?.user_id
        });
        const user_id= req.user?.user_id;
        const record_id = parseInt(req.params.record_id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        };

        const valid_record = await FinancialRecord.findOne({
            where: {
                id: record_id,
                is_deleted: false,
            }
        });

        if (!valid_record) {
            logger.warn("Delete_record failed - Target record not found");

            return res.status(404).json({
                success: false,
                message: "Record not found"
            });
        };

        if (valid_record.is_deleted) {
            return res.status(400).json({
                success: false,
                message: "Record already deleted"
            });
        };

        await FinancialRecord.update ({
                deleted_by: user_id,
                is_deleted: true,
            }, {
                where: { id: record_id }
            }
         );

         await ActivityLogs.create({
            user_id: user_id,
            activity: `DELETED RECORD: ${record_id}`,
            activity_at: new Date(),
            is_active: true
        });

         logger.info("Record deleted successfully", {
            deleted_by: user_id,
            record_id: record_id
        });

        return res.status(200).json({
            success: true,
            message: `Record with record_id: ${record_id} deleted by Admin: ${user_id}`
        });
        
    } catch (error) {
        logger.error("Delete User Error", {
            message: error.message,
            stack: error.stack,
            route: "/api/transactions/delete_record/:record_id"
        });

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};