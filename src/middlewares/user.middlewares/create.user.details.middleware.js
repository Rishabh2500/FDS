const { User, Role, Token, FinancialRecord, ActivityLogs, Category } = require('../../models');
const Joi = require("joi");
const logger = require('../../utils/logger');

module.exports = async (req, res, next) => {

    const schema = Joi.object({
        name: Joi.string().trim().max(100).required().messages({
            "string.empty": "Name is required",
            "string.max": "Name cannot exceed 100 characters"
        }),

        email: Joi.string().email().lowercase().required().messages({
            "string.empty": "Email is required",    
            "string.email": "Enter a valid email address"
        }),

        phone_number: Joi.string().pattern(/^[6-9][0-9]{9}$/).required().messages({
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must start with 6-9 and be 10 digits"
        }),

        country_code: Joi.string().pattern(/^\+[1-9][0-9]{0,3}$/).required().messages({
            "string.empty": "Country code is required",
            "string.pattern.base": "Country code must be in format like +91"
        }),

        password: Joi.string().min(6).max(50).required().messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters",
            "string.max": "Password cannot exceed 50 characters"
        }),

        role_id: Joi.number().required().valid(1, 2, 3).messages({
            "number.base": "Role ID must be a number",
            "number.integer": "Role ID must be an integer",
            "any.required": "Role ID is required"
        }),

        is_active: Joi.boolean().truthy(1).falsy(0).required().messages({
            "any.required": "is_active is required"
        }),
    });

    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true  
    });

    if (error) {
        const errors = error.details.map(err => ({
            field: err.path[0],
            message: err.message
        }));

        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    req.validatedData = value;
    next();
};