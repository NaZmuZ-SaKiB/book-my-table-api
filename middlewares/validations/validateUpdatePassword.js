const { PrismaClient } = require("@prisma/client");
const validator = require("validator");

const comparePassword = require("../../utils/comparePassword");

module.exports = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { currentPass, newPass, confirmNewPass, type } = req.body;

    if (type === "FORGOT") {
      if (!newPass || !confirmNewPass) {
        return res.status(403).json({
          status: "fail",
          message: `Please provide all necessary information.`,
          error: "Invalid Data",
        });
      }
    } else {
      if (!currentPass || !newPass || !confirmNewPass) {
        return res.status(403).json({
          status: "fail",
          message: `Please provide all necessary information.`,
          error: "Invalid Data",
        });
      }
    }

    if (newPass !== confirmNewPass) {
      return res.status(403).json({
        status: "fail",
        message: `Passwords do not match. Make sure you entered same password twice.`,
        error: "Validation Error",
      });
    }

    const isStrong = validator.isStrongPassword(newPass);
    if (!isStrong) {
      return res.status(403).json({
        status: "fail",
        message: `Password is week.`,
        error: "Invalid Data",
      });
    }

    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
        error: "Invalid Request",
      });
    }

    if (type !== "FORGOT") {
      const checkPassword = comparePassword(currentPass, user.password);
      if (!checkPassword) {
        return res.status(401).json({
          status: "fail",
          message: "Current password do not match.",
          error: "Invalid Request",
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Error occured during validating your info.",
      error: "Internal Server Error",
    });
  }
};
