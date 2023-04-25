const express = require("express");

// Local Imports
const controller = require("../controllers/booking.controller");

// Middleware Imports
const verifyToken = require("../middlewares/verifyToken");
const validateBooking = require("../middlewares/validations/validateBooking");

// Router
const router = express.Router();

// GET
router.get("/", (req, res) =>
  res.send(
    `<img src="${
      process.env.API_BASE_URL || "http://localhost:5050/"
    }assets/server-running.jpeg" /><h1>Booking রাউট ঠিক আছে।</h1>`
  )
);
router.get("/my", verifyToken, controller.findMyBookings);

// POST
router.post(
  "/:restaurant_slug",
  verifyToken,
  validateBooking,
  controller.createBooking
);

// DELETE
router.delete("/:id", verifyToken, controller.deleteBooking);

module.exports = router;
