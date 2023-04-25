const jwt = require("jsonwebtoken");
const { promisify } = require("util");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "you are not logged in",
        error: "Authentication Error",
      });
    }

    const decoded = await promisify(jwt.verify)(
      token,
      process.env.TOKEN_SECRET
    );
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "invalid token",
      error: "Authentication Error",
    });
  }
};
