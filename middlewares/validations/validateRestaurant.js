const { PrismaClient } = require("@prisma/client");
const validator = require("validator");

module.exports = async (req, res, next) => {
  try {
    const {
      name,
      main_image,
      images,
      description,
      open_time,
      close_time,
      price,
      location_id,
      cuisine_id,
      tables,
    } = req.body;

    if (
      !name ||
      !main_image ||
      !images?.length ||
      !description ||
      !open_time ||
      !close_time ||
      !price ||
      !location_id ||
      !cuisine_id ||
      !tables
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

    // Validate Tables Array
    const isTables = () => {
      if (!Array.isArray(tables)) return false;
      if (tables.length !== 2) return false;

      let check = true;

      tables.forEach((table) => {
        if (typeof table !== "number") check = false;
      });

      if (tables[0] === 0 && tables[1] === 0) return false;

      return check;
    };

    if (!isTables()) {
      validationErrors.push(
        "Invalid Tables. It must be an Array of two Integers. Both Integers can't be '0'"
      );
    }

    const prisma = new PrismaClient();

    // Validate Location ID
    const location = await prisma.location.findUnique({
      where: { id: location_id },
      select: { name: true },
    });

    if (!location) {
      validationErrors.push("Invalid Location.");
    }

    // Validate Cuisine ID
    const cuisine = await prisma.cuisine.findUnique({
      where: { id: cuisine_id },
      select: { id: true },
    });

    if (!cuisine) {
      validationErrors.push("Invalid Cuisine.");
    }

    // Checking validation schema
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

    req.location = location.name;
    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Error occured during validating restaurant info.",
      error: "Internal Server Error",
    });
  }
};
