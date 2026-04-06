const { User, Role, Token, FinancialRecord, ActivityLogs, Category } = require('../../models');
const Joi = require("joi");
const logger = require('../../utils/logger');


module.exports = async (req, res, next) => {
  try {
    const loggedInUserId = req.user?.user_id;
    const targetUserId = parseInt(req.params.user_id);

    const isSelf = loggedInUserId === targetUserId;

    let schema;

    if (isSelf) {
      schema = Joi.object({
        phone_number: Joi.string().pattern(/^[6-9][0-9]{9}$/),
        country_code: Joi.string().pattern(/^\+[1-9][0-9]{0,3}$/),
        password: Joi.string().min(6).max(50)
      }).min(1);

      logger.info("Admin updating self profile", { user_id: loggedInUserId });
    }

    else {
      schema = Joi.object({
        phone_number: Joi.string().pattern(/^[6-9][0-9]{9}$/),
        country_code: Joi.string().pattern(/^\+[1-9][0-9]{0,3}$/),
        role_id: Joi.number().valid(1, 2, 3),
        is_active: Joi.boolean().truthy(1).falsy(0)
      }).min(1);

      logger.info("Admin updating another user", {
        admin_id: loggedInUserId,
        target_user_id: targetUserId
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      logger.warn("Update validation failed", { errors: error.details });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(err => ({
          field: err.path[0],
          message: err.message
        }))
      });
    }

    req.validatedData = value;
    next();

  } catch (error) {
    logger.error("Update user details middleware error", {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};