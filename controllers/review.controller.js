const service = require("../services/review.service");
const {
  getRestaurantBySlugService,
} = require("../services/restaurant.service");
const { findMeService } = require("../services/auth.service");

exports.createReview = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { restaurant_slug: slug } = req.params;

    const { text, rating } = req.body;
    if (!text || !rating) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid data provided.",
        error: "Query Error",
      });
    }

    const user = await findMeService(id);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message:
          "You are not authorized to make this request. Make sure you are logged in.",
        error: "Unauthorized Request",
      });
    }

    const restaurant = await getRestaurantBySlugService(slug);
    if (!restaurant) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid data provided.",
        error: "Query Error",
      });
    }

    const reviewData = {
      first_name: user.first_name,
      last_name: user.last_name,
      text,
      rating,
      restaurant_id: restaurant.id,
      user_id: user.id,
    };

    const review = await service.createReviewService(reviewData);

    return res.status(201).json({
      status: "success",
      message: "Review created successfully.",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not send your review. Please try again later.",
      error: "Internal Server Error",
    });
  }
};
