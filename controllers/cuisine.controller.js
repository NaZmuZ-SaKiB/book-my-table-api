const services = require("../services/cuisine.service");

exports.getAllCuisine = async (req, res, next) => {
  try {
    const cuisines = await services.getAllCuisineService();
    return res.status(200).json({
      status: "success",
      message: "Got all the cuisines",
      data: cuisines,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not get the cuisines. Please try again later.",
      error: "Internal Server Error",
    });
  }
};
