const Joi = require("joi");

const CATEGORY_MAP = {
  Income: [
    "Salary",
    "Business Income",
    "Freelance / Consulting",
    "Investment Income",
    "Rental Income",
    "Bonus / Incentives",
    "Other Income"
  ],
  Expense: [
    "Rent / Lease",
    "Utilities",
    "Groceries",
    "Transportation",
    "Entertainment",
    "Healthcare / Medical",
    "Miscellaneous"
  ]
};

module.exports = async (req, res, next) => {

  const schema = Joi.object({
    category_name: Joi.string().trim().max(100).required().messages({
      "string.empty": "Category name is required",
      "string.max": "Category name cannot exceed 100 characters"
    }),

    type: Joi.string().valid("Income", "Expense").required().messages({
      "any.only": "Type must be either 'Income' or 'Expense'",
      "string.empty": "Type is required"
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
      message: "Category validation failed",
      errors
    });
  }

  const allowedCategories = CATEGORY_MAP[value.type];

  if (!allowedCategories.includes(value.category_name)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category for ${value.type}`,
      allowed_categories: allowedCategories
    });
  }

  req.validatedData = value;
  next();
};