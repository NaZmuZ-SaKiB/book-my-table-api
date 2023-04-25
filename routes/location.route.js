const express = require("express");

// Local Imports
const controller = require("../controllers/location.controller");

// Middleware Imports
const verifyToken = require("../middlewares/verifyToken");

// Router
const router = express.Router();

// GET
router.get("/", controller.getAllLocation);

module.exports = router;
