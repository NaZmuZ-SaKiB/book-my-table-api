const { PrismaClient } = require("@prisma/client");
const validator = require("validator");

// Local Imports
const services = require("../services/item.service");

const prisma = new PrismaClient();

exports.createItem = async (req, res, next) => {
  try {
    const { name, price, description } = req.body;
    const { restaurant_slug: slug } = req.params;
    const { id } = req.user;

    const isPrice = price
      ? validator.isCurrency(price, [{ allow_negatives: false }])
      : false;

    if (!name || !price || !description || !isPrice) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid data provided.",
        error: "Query Error",
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true, owner_id: true },
    });

    if (!restaurant || restaurant.owner_id !== id) {
      return res(404).json({
        status: "fail",
        message:
          "Restaurant not found. Make sure you are an owner of this restaurant.",
        error: "Not found",
      });
    }

    await services.createItemService({
      name,
      price: `$${price}`,
      description,
      restaurant_id: restaurant.id,
    });

    return res.status(200).json({
      status: "success",
      message: "Successfully added new item.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not create item. Please try again later.",
      error: "Internal Server Error",
    });
  }
};
