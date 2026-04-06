const express = require('express');
const router = express.Router();

// Controller import
const category = require('../controllers/category.controller');

// Middleware imports
const register_middleware = require('../middlewares/user.middlewares/create.user.details.middleware');
const auth_middleware = require('../middlewares/user.middlewares/auth.middleware');
const authLimiter = require('../middlewares/rate.limitor/auth.rate.limitor.middleware');
const update_middleware = require('../middlewares/user.middlewares/update.user.details.middleware');
const admin_auth = require('../middlewares/access.check.middleware/admin.check.middleware');
const category_middleware = require('../middlewares/category.middleware/create_category.middleware');
const check_role = require('../middlewares/access.check.middleware/admin&analyst.check');

// Create category by admins only
/**
 * @swagger
 * /api/category/create_category:
 *   post:
 *     summary: Create a new category
 *     description: |
 *       Create a category under a specific type (Income or Expense).
 *
 *       Rules:
 *       - Category must be unique (no duplicates allowed)
 *       - Type must be either "Income" or "Expense"
 *       - Category must belong to predefined allowed list
 *
 *       Authentication:
 *       - Requires valid access_token stored in httpOnly cookie
 *
 *       Logging:
 *       - Logs API hit (INFO)
 *       - Logs duplicate category attempts (WARN)
 *       - Logs successful creation (INFO)
 *       - Logs errors (ERROR)
 *
 *     tags:
 *       - Category
 *
 *     security:
 *       - cookieAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *               - type
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Salary
 *
 *               type:
 *                 type: string
 *                 enum: [Income, Expense]
 *                 example: Income
 *
 *     responses:
 *       200:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: "Category created: Salary for type: Income by user: 1"
 *
 *                 updated_category:
 *                   type: object
 *                   properties:
 *                     category_id:
 *                       type: integer
 *                       example: 1
 *                     category_name:
 *                       type: string
 *                       example: Salary
 *                     type:
 *                       type: string
 *                       example: Income
 *
 *       400:
 *         description: |
 *           Bad Request:
 *           - Validation failed (invalid type or category_name)
 *
 *       401:
 *         description: |
 *           Unauthorized:
 *           - Missing or invalid access_token cookie
 *
 *       403:
 *         description: |
 *           Forbidden:
 *           - User does not have permission (if role-based restriction applied)
 *
 *       409:
 *         description: |
 *           Conflict:
 *           - Category already exists
 *
 *       429:
 *         description: |
 *           Too Many Requests:
 *           - Rate limit exceeded
 *
 *       500:
 *         description: |
 *           Internal Server Error:
 *           - Unexpected error logged using Winston
 */

router.post('/create_category', auth_middleware, authLimiter, admin_auth, category_middleware, category.create_category);

// Category Listing
/**
 * @swagger
 * /api/category/category_listing:
 *   get:
 *     summary: Get category list with search, filters, and pagination
 *     description: |
 *       Fetch categories with support for:
 *       - Pagination
 *       - Search by category_name (partial match)
 *       - Filter by type (income/expense)
 *
 *       Access Control:
 *       - Admin (role_id = 1) and Analyst (role_id = 2) allowed
 *       - Viewer (role_id = 3) not allowed
 *
 *       Features:
 *       - Partial search using category_name
 *       - Partial match filter on type
 *
 *     tags:
 *       - Category
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *
 *       - in: query
 *         name: category_name
 *         schema:
 *           type: string
 *           example: rent
 *         description: Search category by name (partial match)
 *
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *           example: expense
 *         description: Filter categories by type
 *
 *     responses:
 *       200:
 *         description: Category list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Category list fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_name:
 *                         type: string
 *                         example: Rent
 *                       type:
 *                         type: string
 *                         example: expense
 *
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 15
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *
 *       401:
 *         description: Unauthorized (user not authenticated)
 *
 *       403:
 *         description: Forbidden (viewer role not allowed)
 *
 *       500:
 *         description: Internal server error
 */

router.get('/category_listing', auth_middleware, authLimiter, check_role, category.category_list);

module.exports = router;