const { PrismaClient } = require("@prisma/client");
const validator = require("validator");

module.exports = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, city, phone } = req.body;
    if (!first_name || !last_name || !email || !password || !city || !phone) {
      return res.status(403).json({
        status: "fail",
        message: `Please provide all necessary information.`,
        error: "Invalid Data",
      });
    }

    const validatorSchema = [
      {
        valid: validator.isLength(first_name, { min: 2, max: 20 }),
        errorMessage: "First name is invalid!",
      },
      {
        valid: validator.isLength(last_name, { min: 2, max: 20 }),
        errorMessage: "Last name is invalid!",
      },
      {
        valid: validator.isEmail(email),
        errorMessage: "Email is invalid!",
      },
      {
        valid: validator.isMobilePhone(phone),
        errorMessage: "Phone is invalid!",
      },
      {
        valid: validator.isLength(city, { min: 2, max: 20 }),
        errorMessage: "City is invalid!",
      },
      {
        valid: validator.isStrongPassword(password),
        errorMessage: "Password is week!",
      },
    ];

    const validationErrors = [];

    validatorSchema.forEach((check) => {
      if (!check.valid) {
        validationErrors.push(check?.errorMessage);
      }
    });

    if (validationErrors.length) {
      return res.status(403).json({
        status: "fail",
        message: validationErrors[0],
        error: "Validation Error",
      });
    }

    const prisma = new PrismaClient();
    const isUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (isUser) {
      return res.status(409).json({
        status: "fail",
        message: `Email: "${email}" already exists.`,
        error: "Invalid Request",
      });
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
