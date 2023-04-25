const express = require("express");

// Local Imports
const controller = require("../controllers/restaurant.controller");

// Middleware Imports
const verifyToken = require("../middlewares/verifyToken");
const validateRestaurant = require("../middlewares/validations/validateRestaurant");
const validateUpdateRestaurant = require("../middlewares/validations/validateUpdateRestaurant");

// Router
const router = express.Router();

// GET
router.get("/", controller.findAllRestaurant);
router.get("/my", verifyToken, controller.getMyRestaurants);
router.get("/:slug", controller.getRestaurantBySlug);
router.get("/:slug/availability", controller.fetchAvailabilities);

// POST
router.post("/", verifyToken, validateRestaurant, controller.createRestaurant);

// PATCH
router.patch(
  "/:slug",
  verifyToken,
  validateUpdateRestaurant,
  controller.updateRestaurant
);

module.exports = router;
