const bcrypt = require("bcryptjs");
const validator = require("validator");

// Local Imports
const services = require("../services/auth.service");
const { generateToken } = require("../utils/token");

exports.findMe = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await services.findMeService(id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
        error: "Invalid Request",
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Fetched user ${user.first_name} ${user.last_name}`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not find user info. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).json({
        status: "fail",
        message: "Please provide your email and password.",
        error: "Invalid Data",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid email provided.",
        error: "Invalid Data",
      });
    }

    const user = await services.signinService(email, password);
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Make sure you have entered correct email and password.",
        error: "Invalid Credentials",
      });
    }

    const token = generateToken(user);

    return res
      .status(200)
      .cookie("jwt", token, {
        secure: true,
        httpOnly: true,
      })
      .json({
        status: "success",
        message: `Logged in as ${user.first_name} ${user.last_name}`,
        data: user,
        token,
      });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not signin. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, city, phone } = req.body;

    const user = await services.signupService({
      first_name,
      last_name,
      email,
      password: bcrypt.hashSync(password),
      city,
      phone,
    });

    const token = generateToken(user);

    return res
      .status(200)
      .cookie("jwt", token, {
        secure: true,
        httpOnly: true,
      })
      .json({
        status: "success",
        message: `Created account as ${user.first_name} ${user.last_name}`,
        data: user,
      });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not signup. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.signout = async (req, res, next) => {
  try {
    res
      .cookie("jwt", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: true,
      })
      .json({
        status: "success",
        message: "Logged out successfully.",
      });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not logout. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { first_name, last_name, email, city, phone } = req.body;

    const user = await services.updateUserService(id, {
      first_name,
      last_name,
      email,
      city,
      phone,
    });

    const token = generateToken(user);

    return res
      .status(200)
      .cookie("jwt", token, {
        secure: true,
        httpOnly: true,
      })
      .json({
        status: "success",
        message: `Updated account of ${user.first_name} ${user.last_name}`,
        data: user,
      });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not update your info. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { newPass } = req.body;

    const hashedPassword = bcrypt.hashSync(newPass);
    await services.updatePasswordService(id, hashedPassword);

    return res.status(200).json({
      status: "success",
      message: `Password updated.`,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not change password. Please try again later.",
      error: "Internal Server Error",
    });
  }
};
