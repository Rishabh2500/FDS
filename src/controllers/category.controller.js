const { User, Role, Token, FinancialRecord, ActivityLogs, Category } = require('../models');
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
require('dotenv').config();
const logger = require('../utils/logger');
const { Op } = require("sequelize");

exports.create_category = async (req, res) => {
    try {
        logger.info("Create_user API hit", {
            route: "/api/category/create_category",
            method: "POST",
            requested_by: req.user?.user_id
        });

        const loggedInUserId = req.user.user_id;

        const { category_name, type } = req.validatedData;
        
        const is_category = await Category.findOne ({
            where: {
                category_name
            }
        });

        if (is_category) {
            logger.warn("Duplicated category cannot be created");

            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        };

        const updated_category = await Category.create({
            category_name,
            type
        });

        await ActivityLogs.create({
            user_id: req.user?.user_id,
            activity: `Category created: ${category_name} for type: ${type} by user: ${loggedInUserId}`,
            activity_at: new Date(),
        });

        logger.info("Category created successfully");

        return res.status(200).json({
            success: true,
            message: `Category created: ${category_name} for type: ${type} by user: ${loggedInUserId}`,
            updated_category
        });

    } catch (error) {
        logger.error("Create category Error", {
        message: error.message,
        stack: error.stack,
        route: "/api/category/create_category",
    });

    return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error"
    });
    }
};

exports.category_list = async (req, res) => {
    try {
        logger.info("Users_list API hit", {
            route: "/api/category/category_listing",
            method: "GET",
            user_id: req.user?.user_id,
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
            category_name,
            type
        } = req.query;

        const where = {};

        if (category_name) where.category_name = { [Op.like]: `%${category_name}%` };
        if (type) where.type = { [Op.like]: `%${type}%` };

        const { count, rows } = await Category.findAndCountAll ({
            where,
            attributes: [
                'category_name',
                'type',
            ],
            limit,
            offset,
        });

        await ActivityLogs.create({
            user_id: req.user.user_id,
            activity: `CATEGORY LIST FETCHED`,
            activity_at: new Date(),
            is_active: true
        });

        const totalCategory = count;
        const totalPages = Math.ceil(totalCategory / limit);

        logger.info("Category list fetched successfully", {
            totalCategory,
            page,
            filters: where
        });

        return res.status(200).json({
            success: true,
            message: "Category list fetched successfully",
            data: rows,
            pagination: {
                totalCategory,
                totalPages,
                currentPage: page,
                limit
            }
        });
        
    } catch (error) {
        logger.error("Category Listing Error", {
            message: error.message,
            stack: error.stack,
            route: "/api/category/category_listing"
        });

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};