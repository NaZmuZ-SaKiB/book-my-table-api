const express = require("express");

// Local Imports
const controller = require("../controllers/review.controller");

// Middleware Imports
const verifyToken = require("../middlewares/verifyToken");

// Router
const router = express.Router();

// GET
router.get("/", (req, res) =>
  res.send(
    `<img src="${
      process.env.PORT || "http://localhost:5050/"
    }assets/server-running.jpeg" /><h1>Review রাউট ঠিক আছে।</h1>`
  )
);

// POST
router.post("/:restaurant_slug", verifyToken, controller.createReview);

module.exports = router;
