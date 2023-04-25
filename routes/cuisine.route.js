const express = require("express");

// Local Imports
const controller = require("../controllers/cuisine.controller");

// Middleware Imports
const verifyToken = require("../middlewares/verifyToken");

// Router
const router = express.Router();

// GET
router.get("/", controller.getAllCuisine);

module.exports = router;
