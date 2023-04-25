const express = require("express");

// Local Imports
const controller = require("../controllers/auth.controller");

// Middleware Imports
const verifyToken = require("../middlewares/verifyToken");
const validateUpdatePassword = require("../middlewares/validations/validateUpdatePassword");
const validateSignup = require("../middlewares/validations/validateSignup");
const validateUpdataUser = require("../middlewares/validations/validateUpdateUser");

// Router
const router = express.Router();

// GET
router.get("/", (req, res) =>
  res.send(
    `<img src="${
      process.env.PORT || "http://localhost:5050/"
    }assets/server-running.jpeg" /><h1>Auth রাউট ঠিক আছে।</h1>`
  )
);
router.get("/me", verifyToken, controller.findMe);
router.get("/signout", verifyToken, controller.signout);

// POST
router.post("/signin", controller.signin);
router.post("/signup", validateSignup, controller.signup);

// PATCH
router.patch("/me", verifyToken, validateUpdataUser, controller.updateUser);
router.patch(
  "/password",
  verifyToken,
  validateUpdatePassword,
  controller.updatePassword
);

module.exports = router;
