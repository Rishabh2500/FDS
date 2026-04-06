const Joi = require("joi");

module.exports = async (req, res, next) => {
  try {

    const schema = Joi.object({

        type: Joi.string().valid("income", "expense").messages({
            "any.only": "Type must be either 'income' or 'expense'",
            "any.required": "Type is required"
        }),

        amount: Joi.number().precision(2).positive().messages({
            "number.base": "Amount must be a number",
            "number.positive": "Amount must be greater than 0",
            "any.required": "Amount is required"
        }),

        currency: Joi.string().max(10).optional().default("INR").messages({
            "string.max": "Currency cannot exceed 10 characters"
        }),

        category_id: Joi.number().integer().messages({
            "number.base": "Category ID must be a number",
            "number.integer": "Category ID must be an integer",
            "any.required": "Category ID is required"
        }),

        description: Joi.string().allow("").optional().messages({
            "string.base": "Description must be a string"
        })

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
        success: false,
        message: "Update transaction validation failed",
        errors
      });
    }

    req.validatedData = value;
    next();

  } catch (error) {
    console.log("Update txn record middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Update txn record validation failed"
    });
  }
};