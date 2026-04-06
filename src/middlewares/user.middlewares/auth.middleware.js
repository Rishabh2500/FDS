const jwt = require("jsonwebtoken");
const { User, Role, Token, FinancialRecord, ActivityLogs, Category } = require('../../models');

module.exports = async (req, res, next) => {
  try {
    const access_token = req.cookies?.access_token;
    const refresh_token = req.cookies?.refresh_token;

    if (access_token) {
      try {
        const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (err) {
        console.log("Access token expired → rotating tokens");
      }
    }

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    let decodedRefresh;

    try {
      decodedRefresh = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const storedToken = await Token.findOne({
      where: {
        user_id: decodedRefresh.user_id,
        refresh_token
      }
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not recognized"
      });
    }

    const newAccessToken = jwt.sign(
      { user_id: decodedRefresh.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { user_id: decodedRefresh.user_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    const newExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await Token.update(
      {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: newExpiresAt
      },
      {
        where: {
          user_id: decodedRefresh.user_id,
          refresh_token
        }
      }
    );

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 3 * 24 * 60 * 60 * 1000
    });

    req.user = { user_id: decodedRefresh.user_id };

    next();

  } catch (error) {
    console.log("Auth Error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};