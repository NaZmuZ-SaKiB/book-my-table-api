const express = require("express");
const cors = require("cors");

const app = express();

const cookieParser = require("cookie-parser");

// Middlewares
app.use(express.json());
app.use(express.static("./"));
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

// Routes
const authRoutes = require("./routes/auth.route");
const restaurantRoutes = require("./routes/restaurant.route");
const bookingRoutes = require("./routes/booking.route");
const itemRoutes = require("./routes/item.route");
const reviewRoutes = require("./routes/review.route");
const locationRoutes = require("./routes/location.route");
const cuisineRoutes = require("./routes/cuisine.route");

app.get("/", (req, res) => {
  return res.send(
    `<img src="${
      process.env.PORT || "http://localhost:5050/"
    }assets/server-running.jpeg" /><h1>সার্ভার ঠিক আছে।</h1>`
  );
});

app.use("/auth", authRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/booking", bookingRoutes);
app.use("/item", itemRoutes);
app.use("/review", reviewRoutes);
app.use("/location", locationRoutes);
app.use("/cuisine", cuisineRoutes);

module.exports = app;
