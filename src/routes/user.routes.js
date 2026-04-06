const express = require('express');
const router = express.Router();

// Controller import
const user = require('../controllers/user.controller');

// Middleware imports
const register_middleware = require('../middlewares/user.middlewares/create.user.details.middleware');
const auth_middleware = require('../middlewares/user.middlewares/auth.middleware');
const authLimiter = require('../middlewares/rate.limitor/auth.rate.limitor.middleware');
const update_middleware = require('../middlewares/user.middlewares/update.user.details.middleware');
const admin_auth = require('../middlewares/access.check.middleware/admin.check.middleware');
const check_role = require('../middlewares/access.check.middleware/admin&analyst.check');

// Create User
/**
 * @swagger
 * /api/users/create_user:
 *   post:
 *     summary: Create a new user
 *     description: |
 *       Create a new user in the system.
 *       This endpoint is protected and requires authentication (admin).
 *
 *       Logging:
 *       - Logs API hit (INFO)
 *       - Logs duplicate email attempts (WARN)
 *       - Logs invalid role attempts (WARN)
 *       - Logs successful user creation (INFO)
 *       - Logs unexpected errors (ERROR)
 *
 *     tags:
 *       - Users
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
 *               - name
 *               - email
 *               - phone_number
 *               - country_code
 *               - password
 *               - role_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rishabh Sharma
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: rishabh@gmail.com
 *
 *               phone_number:
 *                 type: string
 *                 example: 9876543210
 *
 *               country_code:
 *                 type: string
 *                 example: +91
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Secure@123
 *
 *               role_id:
 *                 type: integer
 *                 example: 1
 *
 *               is_active:
 *                 type: boolean
 *                 example: true
 *
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 10
 *                     name:
 *                       type: string
 *                       example: Rishabh Sharma
 *                     email:
 *                       type: string
 *                       example: rishabh@gmail.com
 *
 *       409:
 *         description: |
 *           Conflict:
 *           - Email already exists
 *           - Invalid role id
 *
 *       401:
 *         description: |
 *           Unauthorized:
 *           - Missing or invalid access token
 *
 *       500:
 *         description: |
 *           Internal Server Error:
 *           - Unexpected error during registration
 *           - Logged using Winston logger
 */

router.post('/create_user', auth_middleware, authLimiter, admin_auth, register_middleware, user.create_user);

// Login user
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     description: |
 *       Authenticate user and generate access & refresh tokens.
 *       Tokens are stored in httpOnly cookies.
 *
 *       Logging:
 *       - Logs login attempts (INFO)
 *       - Logs invalid credentials (WARN)
 *       - Logs system errors (ERROR)
 *
 *     tags:
 *       - Users
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sharmarishabh0025@gmail.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Rishabh@2500
 *
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Rishabh Sharma
 *                     email:
 *                       type: string
 *                       example: rishabh@gmail.com
 *                     access_token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       400:
 *         description: |
 *           Bad Request:
 *           - Missing email or password
 *           - Invalid password
 *
 *       401:
 *         description: |
 *           Unauthorized:
 *           - User not found
 *
 *       500:
 *         description: |
 *           Internal Server Error:
 *           - Unexpected server error
 *           - Logged using Winston logger
 */

router.post('/login', authLimiter, user.login);

// Logout User
/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: User logout
 *     description: |
 *       Logs out the authenticated user by:
 *       - Deleting tokens from the database
 *       - Clearing access & refresh token cookies
 *       - Recording logout activity in activity logs
 *
 *       Logging:
 *       - Logs API hit (INFO)
 *       - Logs successful logout (INFO)
 *       - Logs system errors (ERROR)
 *
 *     tags:
 *       - Users
 *
 *     security:
 *       - cookieAuth: []
 *
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: Logout successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Rishabh Sharma
 *                     email:
 *                       type: string
 *                       example: rishabh@gmail.com
 *
 *       401:
 *         description: |
 *           Unauthorized:
 *           - Missing or invalid access token
 *
 *       500:
 *         description: |
 *           Internal Server Error:
 *           - Unexpected error during logout
 *           - Logged using Winston logger
 */

router.post('/logout', auth_middleware, user.logout);

// Update User Details (only admins can)
/**
 * @swagger
 * /api/users/update/{user_id}:
 *   patch:
 *     summary: Update user details (Only Admins)
 *     description: |
 *       Update user details based on role and ownership.
 *
 *       Rules:
 *       - Admin can update user details such as phone_number, country_code, role_id, is_Active (except password of others)
 *       - Users can update their own details such as phone_number, country_code and password
 *       - Password update is restricted to self only
 *
 *       Logging:
 *       - Logs update attempts (INFO)
 *       - Logs unauthorized password updates (WARN)
 *       - Logs user not found cases (WARN)
 *       - Logs system errors (ERROR)
 *
 *     tags:
 *       - Users
 *
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *           example: 14
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *
 *               phone_number:
 *                 type: string
 *                 example: 8700854566
 *
 *               country_code:
 *                 type: string
 *                 example: +91
 *
 *               role_id:
 *                 type: integer
 *                 example: 2
 *
 *               is_active:
 *                 type: boolean
 *                 example: true
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewPassword@123
 *
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User details updated successfully
 *                 activityMessage:
 *                   type: string
 *                   example: "For user_id: 14 UPDATED: phone_number, country_code"
 *
 *       400:
 *         description: |
 *           Bad Request:
 *           - Password update not allowed for other users
 *           - Invalid input data
 *
 *       401:
 *         description: |
 *           Unauthorized:
 *           - Invalid or missing authentication token
 *
 *       403:
 *         description: |
 *           Forbidden:
 *           - User does not have permission to update other users
 *
 *       404:
 *         description: |
 *           Not Found:
 *           - Target user not found
 *
 *       429:
 *         description: |
 *           Too Many Requests:
 *           - Rate limit exceeded
 *
 *       500:
 *         description: |
 *           Internal Server Error:
 *           - Unexpected server error
 *           - Logged using Winston logger
 */

router.patch('/update/:user_id', auth_middleware, authLimiter, admin_auth, update_middleware, user.update);

// Delete existing user (soft deletion)
/**
 * @swagger
 * /api/users/delete_user/{user_id}:
 *   patch:
 *     summary: Soft delete a user (Admin only)
 *     description: |
 *       Soft deletes a user by setting `is_active = false` and `is_deleted = true`.
 *       The user record is NOT permanently removed from the database.
 *
 *       Access Control:
 *       - Only admins can delete users
 *       - Admin cannot delete their own account
 *
 *       Logging:
 *       - Logs API hit (INFO)
 *       - Logs unauthorized attempts (WARN)
 *       - Logs successful deletion (INFO)
 *       - Logs errors (ERROR)
 *
 *     tags:
 *       - Users
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to be deleted
 *         example: 5
 *
 *     responses:
 *       200:
 *         description: User deleted successfully (soft delete)
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
 *                   example: "User with user_id: 5 deleted by Admin: 1"
 *
 *       400:
 *         description: |
 *           Bad Request:
 *           - Admin attempted to delete self
 *           - User already deleted
 *
 *       401:
 *         description: |
 *           Unauthorized:
 *           - Missing or invalid authentication
 *
 *       403:
 *         description: |
 *           Forbidden:
 *           - Non-admin attempting delete
 *
 *       404:
 *         description: |
 *           Not Found:
 *           - User does not exist
 *
 *       500:
 *         description: |
 *           Internal Server Error:
 *           - Unexpected server error
 *           - Logged using Winston logger
 */

router.patch('/delete_user/:user_id', auth_middleware, authLimiter, admin_auth, user.delete);

// Userlisting
/**
 * @swagger
 * /api/users/users_list:
 *   get:
 *     summary: Get users list with search, filters, and pagination
 *     description: |
 *       Fetch users with support for:
 *       - Pagination
 *       - Filtering (country_code, role_id, is_active, created_by, deleted_by, is_deleted)
 *       - Search (name, email, phone_number)
 *
 *       Authentication:
 *       - Uses httpOnly cookies:
 *         - access_token (required)
 *         - refresh_token (used for token refresh)
 *
 *       Access Control:
 *       - Admin & Analyst allowed
 *       - Viewer (role_id = 3) not allowed
 *
 *       Features:
 *       - Partial search using name, email, and phone_number
 *       - Exact match filters (country_code, role_id, created_by, deleted_by)
 *       - Boolean filters (is_active, is_deleted)
 *
 *     tags:
 *       - Users
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
 *         name: name
 *         schema:
 *           type: string
 *           example: rishabh
 *         description: Search by name (partial match)
 *
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           example: gmail.com
 *         description: Search by email (partial match)
 *
 *       - in: query
 *         name: phone_number
 *         schema:
 *           type: string
 *           example: 9876543210
 *         description: Search by phone number (partial match)
 *
 *       - in: query
 *         name: country_code
 *         schema:
 *           type: string
 *           example: +91
 *         description: Filter by country code (exact match)
 *
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *           example: 2
 *         description: Filter by role ID
 *
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filter active/inactive users
 *
 *       - in: query
 *         name: is_deleted
 *         schema:
 *           type: boolean
 *           example: false
 *         description: Filter deleted users
 *
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filter by creator user ID
 *
 *       - in: query
 *         name: deleted_by
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filter by deleter user ID
 *
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                   example: User list fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Rishabh Sharma
 *                       email:
 *                         type: string
 *                         example: rishabh@gmail.com
 *                       phone_number:
 *                         type: string
 *                         example: 9876543210
 *                       country_code:
 *                         type: string
 *                         example: +91
 *                       role_id:
 *                         type: integer
 *                         example: 1
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                       is_deleted:
 *                         type: boolean
 *                         example: false
 *
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *
 *       401:
 *         description: |
 *           Unauthorized:
 *           - Missing or invalid access_token cookie
 *
 *       403:
 *         description: |
 *           Forbidden:
 *           - Viewer role cannot access this API
 *
 *       429:
 *         description: |
 *           Too Many Requests:
 *           - Rate limit exceeded
 *
 *       500:
 *         description: |
 *           Internal Server Error
 */

router.get('/users_list', auth_middleware, check_role, user.users_list);

module.exports = router;