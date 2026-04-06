const { User, Role, Token, FinancialRecord, ActivityLogs, Category } = require('../models');
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
require('dotenv').config();
const logger = require('../utils/logger');
const { Op } = require("sequelize");

exports.create_user = async (req, res) => {
  try {
    logger.info("Create_user API hit", {
      route: "/api/users/create_user",
      method: "POST",
      requested_by: req.user?.user_id
    });

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    };

    const {
      name,
      email,
      phone_number,
      country_code,
      password,
      role_id,
      is_active
    } = req.validatedData;

    const password_hash = await bcrypt.hash(password, 10);

    const isUser = await User.findOne({ where: { email } });

    if (isUser) {
      logger.warn("Duplicated user cannot be created - Email already exists", { email });

      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    const isRole = await Role.findOne({ where: { id: role_id } });

    if (!isRole) {
      logger.warn("User cannot be created - Invalid role id", {
        role_id,
        email
      });

      return res.status(400).json({
        success: false,
        message: "Enter a valid role id"
      });
    }

    const created_by = req.user?.user_id || null;

    const newUser = await User.create({
      name,
      email,
      phone_number,
      country_code,
      password_hash,
      role_id,
      is_active,
      created_by
    });

    await ActivityLogs.create({
        user_id: req.user?.user_id,
        activity: "Create user",
        activity_at: new Date(),
    });

    logger.info("User created successfully", {
      user_id: newUser.user_id,
      email: newUser.email,
      created_by
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    logger.error("create_user API Error", {
      message: error.message,
      stack: error.stack,
      route: "/api/users/created"
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

exports.login = async (req, res) => {
  try {
    logger.info("Login API hit", {
      route: "/api/users/login",
      method: "POST"
    });

    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn("Login failed - Missing credentials", { email });
      return res.status(400).json({
        success: false,
        message: 'Email Id and password are required'
      });
    }

    const isUser = await User.findOne({ where: { email } });

    if (!isUser) {
      logger.warn("Login failed - User not found", { email });
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, isUser.password_hash);

    if (!isMatch) {
      logger.warn("Login failed - Invalid password", {
        user_id: isUser.user_id,
        email
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const payload = {
      user_id: isUser.user_id,
      email: isUser.email,
      name: isUser.name
    };

    const access_token = JWT.sign(payload, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '15m'
    });

    const refresh_token = JWT.sign(
      { user_id: isUser.user_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '3d' }
    );

    const expires_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await Token.create({
      user_id: isUser.user_id,
      access_token,
      refresh_token,
      expires_at
    });

    await User.update(
      { last_login_at: new Date(),
        is_active: true
       },
      { where: { user_id: isUser.user_id } }
    );

    await ActivityLogs.create({
        user_id: isUser.user_id,
        activity: "Login",
        activity_at: new Date(),
        is_active: isUser.is_active || null
    });

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    logger.info("Login successful", {
      user_id: isUser.user_id,
      email: isUser.email
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user_id: isUser.user_id,
        name: isUser.name,
        email: isUser.email,
        access_token
      }
    });

  } catch (error) {
    logger.error("Login Error", {
      message: error.message,
      stack: error.stack,
      route: "/api/users/login"
    });

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.logout = async (req, res) => {
    try {

        logger.info("Logout API hit", {
            route: "/api/users/logout",
            method: "POST",
            user_id: req.user?.user_id
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        };

        const user_id = req.user.user_id;

        await Token.destroy({
            where: {
                user_id
            }
        });

        await User.update({
            is_active: false 
        },
        { 
            where: { user_id } 
        }
        );

        await ActivityLogs.create({
            user_id,
            activity: "Logout",
            activity_at: new Date(),
            is_active: false
        });

        res.clearCookie('access_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
        });

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
        });

        logger.info("Logout successful", {
            user_id,
            name: req.user.name,
            email: req.user.email,
        });

        return res.status(200).json({
        success: true,
        message: "Logout successful",
        data: {
            user_id,
            name: req.user.name,
            email: req.user.email,
        }
        });
        
    } catch (error) {
        logger.error("Logout Error", {
            message: error.message,
            stack: error.stack,
            route: "/api/users/logout"
        });

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.update = async (req, res) => {
  try {
    logger.info("Update detials API hit", {
        route: "/api/users/update/:user_id",
        method: "PATCH",
        user_id: req.user?.user_id
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    };

    const loggedInUserId = req.user.user_id;
    const targetUserId = parseInt(req.params.user_id);
    const data = { ...req.validatedData };

    const isSelf = loggedInUserId === targetUserId;

    const targetUser = await User.findOne({
      where: { user_id: targetUserId }
    });

    if (!targetUser) {
        logger.warn("Update failed - Target user not found", { targetUserId });

        return res.status(404).json({
        success: false,
        message: "User not found"
        });
    }

    if (isSelf && data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password_hash = hashedPassword;
      delete data.password;
    }

    if (!isSelf && data.password) {
      logger.warn("Unauthorized password update attempt", {
        admin_id: loggedInUserId,
        target_user: targetUserId
      });

      return res.status(400).json({
        success: false,
        message: "Password update not allowed for other users"
      });
    }

    await User.update(data, {
      where: { user_id: targetUserId }
    });

    const updatedFields = Object.keys(data)
      .map(field => field === 'password_hash' ? 'password' : field)
      .filter((field, index, self) => self.indexOf(field) === index);

    const activityMessage = `For user_id: ${targetUserId} UPDATED: ${updatedFields.join(', ')}`;

    await ActivityLogs.create({
      user_id: loggedInUserId,
      activity: activityMessage,
      activity_at: new Date(),
      is_active: isSelf ? true : targetUser.is_active
    });

    logger.info("User updated successfully", {
      updated_by: loggedInUserId,
      target_user: targetUserId,
      updated_fields: updatedFields,
      isSelf,
      activityMessage
    });

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      activityMessage
    });

  } catch (error) {
    logger.error("Update User Details Error", {
      message: error.message,
      stack: error.stack,
      route: "/api/users/update/:user_id"
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

exports.delete = async (req, res) => {
  try {

    logger.info("Delete_user API hit", {
      route: "/api/users/delete_user/:user_id",
      method: "PATCH",
      user_id: req.user?.user_id
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    };

    const loggedInUserId = req.user.user_id;
    const targetUserId = parseInt(req.params.user_id);

    // const adminUser = await User.findOne({
    //   where: { user_id: loggedInUserId }
    // });

    // if (!adminUser || adminUser.role_id !== 1) {
    //   logger.warn("Unauthorized user delete attempt", { loggedInUserId });

    //   return res.status(403).json({
    //     success: false,
    //     message: "Only admins can delete users"
    //   });
    // }

    if (loggedInUserId === targetUserId) {
      logger.warn("Admin cannot delete self", { loggedInUserId });

      return res.status(400).json({
        success: false,
        message: "Admin can only delete others, not self."
      });
    }

    const targetUser = await User.findOne({
      where: { user_id: targetUserId }
    });

    if (!targetUser) {
      logger.warn("Delete_user failed - Target user not found", { targetUserId });

      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (targetUser.is_deleted) {
      return res.status(400).json({
        success: false,
        message: "User already deleted"
      });
    }

    await User.update({
      is_active: false,
      is_deleted: true,
      deleted_by: loggedInUserId
    }, {
      where: { user_id: targetUserId }
    });

    await ActivityLogs.create({
      user_id: loggedInUserId,
      activity: `DELETED USER: ${targetUserId}`,
      activity_at: new Date(),
      is_active: false
    });

    logger.info("User deleted successfully", {
      deleted_by: loggedInUserId,
      target_user: targetUserId
    });

    return res.status(200).json({
      success: true,
      message: `User with user_id: ${targetUserId} deleted by Admin: ${loggedInUserId}`
    });

  } catch (error) {
    logger.error("Delete User Error", {
      message: error.message,
      stack: error.stack,
      route: "/api/users/delete_user/:user_id"
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

exports.users_list = async (req, res) => {
  try {

    logger.info("Users_list API hit", {
      route: "/api/users/users_list",
      method: "GET",
      user_id: req.user?.user_id,
      query: req.query
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    };

    // if (req.user.role_id === 3) {
    //   logger.warn("Viewer cannot access user list", {
    //     user_id: req.user.user_id
    //   });

    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied"
    //   });
    // }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const {
        name,
        email,
        phone_number,
        country_code,
        role_id,
        is_active,
        created_by,
        deleted_by,
        is_deleted
    } = req.query;

    const where = {
        is_deleted: false,
    };

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (phone_number) where.phone_number = { [Op.like]: `%${phone_number}%`};
    if (country_code) where.country_code = country_code;
    if (role_id) where.role_id = role_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (created_by) where.created_by = created_by;
    if (deleted_by) where.deleted_by = deleted_by;
    if (is_deleted !== undefined) where.is_deleted = is_deleted === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: [
        'user_id',
        'name',
        'email',
        'phone_number',
        'country_code',
        'role_id',
        'is_active',
        'is_deleted'
      ],
      limit,
      offset,
      order: [["user_id", "ASC"]],
    });

    await ActivityLogs.create({
      user_id: req.user.user_id,
      activity: `USER LIST FETCHED`,
      activity_at: new Date(),
      is_active: true
    });

    const totalUsers = count;
    const totalPages = Math.ceil(totalUsers / limit);

    logger.info("User list fetched successfully", {
      totalUsers,
      page,
      filters: where
    });

    return res.status(200).json({
        success: true,
        message: "User list fetched successfully",
        data: rows,
        pagination: {
            totalUsers,
            totalPages,
            currentPage: page,
            limit
        }
    });

  } catch (error) {
    logger.error("Userlisting Error", {
      message: error.message,
      stack: error.stack,
      route: "/api/users/users_list"
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};