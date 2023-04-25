const services = require("../services/location.service");

exports.getAllLocation = async (req, res, next) => {
  try {
    const locations = await services.getAllLocationService();
    return res.status(200).json({
      status: "success",
      message: "Got all the locations",
      data: locations,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not get the locations. Please try again later.",
      error: "Internal Server Error",
    });
  }
};
