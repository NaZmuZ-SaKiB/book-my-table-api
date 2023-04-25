const { PrismaClient } = require("@prisma/client");
const validator = require("validator");

module.exports = async (req, res, next) => {
  try {
    const {
      name,
      main_image,
      description,
      open_time,
      close_time,
      price,
      images,
    } = req.body;

    const { id } = req.user;
    const { slug } = req.params;

    if (
      !name ||
      !main_image ||
      !images?.length ||
      !description ||
      !open_time ||
      !close_time ||
      !price
    ) {
      return res.status(403).json({
        status: "fail",
        message: `Please provide all necessary information.`,
        error: "Invalid Data",
      });
    }

    const validatorSchema = [
      {
        valid: validator.isLength(name, { min: 2, max: 40 }),
        errorMessage: "Name is too small!",
      },
      {
        valid: validator.isURL(main_image),
        errorMessage: "Main Image URL is invalid!",
      },
      {
        valid: validator.isLength(description, { min: 20 }),
        errorMessage: "Description is too small!",
      },
      {
        valid: validator.isISO8601(`2023-04-07T${open_time}`),
        errorMessage: "Open time is invalid!",
      },
      {
        valid: validator.isISO8601(`2023-04-07T${close_time}`),
        errorMessage: "Close time is invalid!",
      },
    ];

    const validationErrors = [];

    // Validate Images Array
    const isImages = () => {
      if (!Array.isArray(images)) return false;
      let check = true;

      images.forEach((image) => {
        if (!validator.isURL(image)) check = false;
      });

      return check;
    };

    if (!isImages()) {
      validationErrors.push(
        "Invalid images. It must be an Array of image URLs!"
      );
    }

    // Validate Price
    const isPrice = () => {
      const priceArray = ["REGULAR", "CHEAP", "EXPENSIVE"];
      if (!priceArray.includes(price)) return false;

      return true;
    };

    if (!isPrice()) {
      validationErrors.push("Invalid Price!");
    }

    validatorSchema.forEach((check) => {
      if (!check.valid) {
        validationErrors.push(check?.errorMessage);
      }
    });
    if (validationErrors.length) {
      return res.status(403).json({
        status: "fail",
        message: validationErrors[0],
        error: "Validation Error",
      });
    }

    const prisma = new PrismaClient();

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug,
      },
      select: { id: true, owner_id: true, location: true },
    });
    if (!restaurant || restaurant.owner_id !== id) {
      return res.status(401).json({
        status: "fail",
        message:
          "You are not allowed to make this request. Make sure you are signed in or you are an owner.",
        error: "Unauthorized Request",
      });
    }
    req.location = restaurant.location.name;
    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Error occured during validating restaurant info.",
      error: "Internal Server Error",
    });
  }
};
