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

    if (role_id !== 1) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only."
      });
    }

    next();

  } catch (error) {
    console.log("Admin check middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Admin check failed"
    });
  }
};