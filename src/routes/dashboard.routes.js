const express = require('express');
const router = express.Router();

// Controller import
const dashboard = require('../controllers/dashboard.controller');

// Middleware imports
const register_middleware = require('../middlewares/user.middlewares/create.user.details.middleware');
const auth_middleware = require('../middlewares/user.middlewares/auth.middleware');
const authLimiter = require('../middlewares/rate.limitor/auth.rate.limitor.middleware');
const update_middleware = require('../middlewares/user.middlewares/update.user.details.middleware');
const admin_auth = require('../middlewares/access.check.middleware/admin.check.middleware');
const check_role = require('../middlewares/access.check.middleware/admin&analyst.check');


// Total income
/**
 * @swagger
 * /api/dashboard/total_income:
 *   get:
 *     summary: Get total income (with optional category filter)
 *     description: |
 *       Calculates total income using SUM aggregation.
 *
 *       Features:
 *       - Returns total income across all categories
 *       - Supports optional filtering by category_id
 *       - Excludes soft-deleted records (is_deleted = false)
 *       - Logs activity after successful fetch
 *
 *       Filtering:
 *       - If category_id is provided → returns category-specific income
 *       - If not → returns overall income
 *
 *     tags:
 *       - Dashboard
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2
 *         description: Optional category ID to filter income
 *
 *     responses:
 *       200:
 *         description: Total income fetched successfully
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
 *                   example: Total income fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     category_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 2
 *                     total_income:
 *                       type: number
 *                       example: 25000
 *
 *       401:
 *         description: Unauthorized (user not authenticated)
 *
 *       500:
 *         description: Internal server error
 */

router.get('/total_income', auth_middleware, authLimiter, dashboard.total_income);
router.get('/total_income/:category_id', auth_middleware, authLimiter, dashboard.total_income);

// Total expense
/**
 * @swagger
 * /api/dashboard/total_expense:
 *   get:
 *     summary: Get total expense (with optional category filter)
 *     description: |
 *       Calculates total expense using SUM aggregation.
 *
 *       Features:
 *       - Returns total expense across all categories
 *       - Supports optional filtering by category_id
 *       - Excludes soft-deleted records (is_deleted = false)
 *       - Logs activity after successful fetch
 *
 *       Filtering:
 *       - If category_id is provided → returns category-specific expense
 *       - If not → returns overall expense
 *
 *     tags:
 *       - Dashboard
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           type: integer
 *           example: 3
 *         description: Optional category ID to filter expense
 *
 *     responses:
 *       200:
 *         description: Total expense fetched successfully
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
 *                   example: Total expense fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     category_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 3
 *                     total_expense:
 *                       type: number
 *                       example: 18000
 *
 *       401:
 *         description: Unauthorized (user not authenticated)
 *
 *       500:
 *         description: Internal server error
 */

router.get('/total_expense', auth_middleware, authLimiter, dashboard.total_expense);
router.get('/total_expense/:category_id', auth_middleware, authLimiter, dashboard.total_expense);

// Total expense
/**
 * @swagger
 * /api/dashboard/net_balance:
 *   get:
 *     summary: Get net balance
 *     description: |
 *       Calculates net balance using:
 *
 *       net_balance = total_income - total_expense
 *
 *       Features:
 *       - Aggregates income and expense separately
 *       - Excludes deleted records
 *       - Returns combined financial summary
 *       - Logs activity after fetch
 *
 *     tags:
 *       - Dashboard
 *
 *     security:
 *       - cookieAuth: []
 *
 *     responses:
 *       200:
 *         description: Net balance fetched successfully
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
 *                   example: Net balance fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_income:
 *                       type: number
 *                       example: 25000
 *                     total_expense:
 *                       type: number
 *                       example: 18000
 *                     net_balance:
 *                       type: number
 *                       example: 7000
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */

router.get('/net_balance', auth_middleware, authLimiter, dashboard.net_balance);

// Trends
/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get weekly and monthly financial trends
 *     description: |
 *       Returns aggregated financial data for:
 *       - Last 7 days (weekly)
 *       - Last 30 days (monthly)
 *
 *       Includes:
 *       - Total income
 *       - Total expense
 *       - Net balance
 *
 *       Features:
 *       - Uses date range filtering
 *       - Excludes deleted records
 *       - Logs activity
 *
 *     tags:
 *       - Dashboard
 *
 *     security:
 *       - cookieAuth: []
 *
 *     responses:
 *       200:
 *         description: Trends fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     weekly:
 *                       type: object
 *                       properties:
 *                         total_income:
 *                           type: number
 *                           example: 5000
 *                         total_expense:
 *                           type: number
 *                           example: 3000
 *                         net_balance:
 *                           type: number
 *                           example: 2000
 *                     monthly:
 *                       type: object
 *                       properties:
 *                         total_income:
 *                           type: number
 *                           example: 20000
 *                         total_expense:
 *                           type: number
 *                           example: 12000
 *                         net_balance:
 *                           type: number
 *                           example: 8000
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */

router.get('/trends', auth_middleware, authLimiter, dashboard.trends);

module.exports = router;