const express = require('express');
const router = express.Router();

// Controller import
const transactions = require('../controllers/transaction.controller');

// Middleware imports
const auth_middleware = require('../middlewares/user.middlewares/auth.middleware');
const authLimiter = require('../middlewares/rate.limitor/auth.rate.limitor.middleware');
const admin_auth = require('../middlewares/access.check.middleware/admin.check.middleware');
const create_txn_validations = require('../middlewares/financial.records.middleware/create.transaction.records');
const check_role = require('../middlewares/access.check.middleware/admin&analyst.check');
const update_record_validations = require('../middlewares/financial.records.middleware/update.records.middleware');

// Create new transaction record
/**
 * @swagger
 * /api/transactions/create_record:
 *   post:
 *     summary: Create a new financial transaction record
 *     description: |
 *       Creates a new transaction (income or expense) for the logged-in user.
 *
 *       Validations:
 *       - `type` must be either "income" or "expense"
 *       - `amount` must be a positive number
 *       - `category_id` must match the provided type
 *
 *       Behavior:
 *       - Validates category belongs to given type
 *       - Stores transaction with current date
 *       - Logs activity in activity_logs table
 *
 *     tags:
 *       - Transactions
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
 *               - type
 *               - amount
 *               - category_id
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 1500.50
 *
 *               currency:
 *                 type: string
 *                 example: INR
 *                 description: Optional (default is INR)
 *
 *               category_id:
 *                 type: integer
 *                 example: 2
 *
 *               description:
 *                 type: string
 *                 example: Groceries
 *
 *     responses:
 *       201:
 *         description: Transaction created successfully
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
 *                   example: New Transaction created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     new_record:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         user_id:
 *                           type: integer
 *                           example: 1
 *                         type:
 *                           type: string
 *                           example: expense
 *                         amount:
 *                           type: number
 *                           example: 1500.50
 *                         currency:
 *                           type: string
 *                           example: INR
 *                         category_id:
 *                           type: integer
 *                           example: 2
 *                         transaction_date:
 *                           type: string
 *                           format: date
 *                           example: 2026-04-05
 *                         description:
 *                           type: string
 *                           example: Groceries
 *
 *       400:
 *         description: Validation error or invalid category/type combination
 *
 *       401:
 *         description: Unauthorized (user not logged in)
 *
 *       500:
 *         description: Internal server error
 */

router.post('/create_record', auth_middleware, authLimiter, admin_auth, create_txn_validations, transactions.create_record);

// Record Listing
/**
 * @swagger
 * /api/transactions/records_listing:
 *   get:
 *     summary: Get transaction records with filters and pagination
 *     description: |
 *       Fetch financial transaction records with support for:
 *       - Pagination
 *       - Filtering by multiple fields
 *
 *       Access Control:
 *       - Admin (role_id = 1) and Analyst (role_id = 2) allowed
 *       - Viewer (role_id = 3) not allowed
 *
 *       Features:
 *       - Partial search on type and currency
 *       - Exact match filters for user_id, category_id, transaction_date
 *       - Optional filtering by amount and description
 *
 *     tags:
 *       - Transactions
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
 *         name: user_id
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filter records by user ID
 *
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *           example: expense
 *         description: Filter by transaction type (partial match supported)
 *
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *           example: 1000
 *         description: Filter by amount (partial match)
 *
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           example: INR
 *         description: Filter by currency (partial match)
 *
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *           example: 2
 *         description: Filter by category ID
 *
 *       - in: query
 *         name: transaction_date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-04-05
 *         description: Filter by transaction date (YYYY-MM-DD)
 *
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *           example: grocery
 *         description: Filter by description (exact match)
 *
 *     responses:
 *       200:
 *         description: Transaction records fetched successfully
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
 *                   example: Transaction record list fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: expense
 *                       amount:
 *                         type: number
 *                         example: 1500.50
 *                       currency:
 *                         type: string
 *                         example: INR
 *                       category_id:
 *                         type: integer
 *                         example: 2
 *                       transaction_date:
 *                         type: string
 *                         format: date
 *                         example: 2026-04-05
 *                       description:
 *                         type: string
 *                         example: Grocery shopping
 *
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
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

router.get('/records_listing', auth_middleware, check_role, transactions.records_list);

// Updating existing record
/**
 * @swagger
 * /api/transactions/update_record/{record_id}/{user_id}:
 *   patch:
 *     summary: Update a financial transaction record (Admin only)
 *     description: |
 *       Updates an existing transaction record for a specific user.
 *
 *       Access Control:
 *       - Only Admin (role_id = 1) is allowed
 *
 *       Features:
 *       - Partial update (only provided fields will be updated)
 *       - Validates category_id and type combination
 *       - Ensures record belongs to the specified user
 *       - Logs activity after successful update
 *
 *       Validation Rules:
 *       - type must be "income" or "expense"
 *       - amount must be a positive number
 *       - category_id must match the selected type
 *
 *     tags:
 *       - Transactions
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: record_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *         description: ID of the transaction record
 *
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the user who owns the record
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 1200.50
 *
 *               currency:
 *                 type: string
 *                 example: INR
 *
 *               category_id:
 *                 type: integer
 *                 example: 2
 *
 *               description:
 *                 type: string
 *                 example: Updated electricity bill
 *
 *           examples:
 *             updateAmount:
 *               summary: Update amount only
 *               value:
 *                 amount: 2000
 *
 *             updateMultiple:
 *               summary: Update multiple fields
 *               value:
 *                 amount: 1500
 *                 type: expense
 *                 category_id: 2
 *                 description: Grocery update
 *
 *             updateCurrency:
 *               summary: Update currency
 *               value:
 *                 currency: USD
 *
 *     responses:
 *       200:
 *         description: Transaction updated successfully
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
 *                   example: Transaction updated successfully
 *
 *       400:
 *         description: |
 *           Bad Request:
 *           - No data provided
 *           - Invalid type
 *           - Negative amount
 *           - Invalid category and type combination
 *
 *       401:
 *         description: Unauthorized (user not authenticated)
 *
 *       403:
 *         description: Forbidden (only admin allowed)
 *
 *       404:
 *         description: Record not found
 *
 *       500:
 *         description: Internal server error
 */

router.patch('/update_record/:record_id/:user_id', auth_middleware, authLimiter, admin_auth, update_record_validations, transactions.update_record);

// Deleting records (Soft deletion)
/**
 * @swagger
 * /api/transactions/delete_record/{record_id}:
 *   patch:
 *     summary: Soft delete a financial transaction record (Admin only)
 *     description: |
 *       Soft deletes an existing transaction record by setting `is_deleted = true`
 *       and storing the `deleted_by` user.
 *
 *       Access Control:
 *       - Only Admin (role_id = 1) is allowed
 *
 *     tags:
 *       - Transactions
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: record_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       400:
 *         description: Record already deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 */

router.patch('/delete_record/:record_id', auth_middleware, admin_auth, transactions.delete_record);


module.exports = router;