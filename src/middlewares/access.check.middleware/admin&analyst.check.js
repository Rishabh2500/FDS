const { User } = require("../../models");

module.exports = async (req, res, next) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated"
      });
    }

    const user = await User.findOne({
        where: { user_id: req.user.user_id },
        attributes: ['role_id'],
        raw: true
    });

    const role_id = user?.role_id;

    if ([1, 2].includes(role_id)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. Only admin and analyst can but not viewer."
    });

  } catch (error) {
    console.log("Role check middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Role check failed"
    });
  }
};