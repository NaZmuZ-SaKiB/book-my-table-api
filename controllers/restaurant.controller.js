const { PrismaClient } = require("@prisma/client");
const slug = require("slug");

// Local Imports
const services = require("../services/restaurant.service");
const { makeOwnerService } = require("../services/auth.service");
const findAvailableTables = require("../utils/findAvailableTables");

const prisma = new PrismaClient();

exports.findAllRestaurant = async (req, res, next) => {
  try {
    const { where } = req.query || {};
    const restaurants = await services.findAllRestaurantService(where);
    return res.status(200).json({
      status: "success",
      message: "Successfully fetched all restaurants.",
      data: restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not find any restaurants. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.getRestaurantBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const restaurant = await services.getRestaurantBySlugService(slug);
    if (!restaurant) {
      return res.status(500).json({
        status: "fail",
        message: `No restaurant found with slug: "${slug}"`,
        error: "Invalid Request",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Successfully fetched restaurant.",
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not find restaurant. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.getMyRestaurants = async (req, res, next) => {
  try {
    const { id } = req.user;
    const restaurants = await services.getMyRestaurantsService(id);

    return res.status(200).json({
      status: "success",
      message: "Successfully fetched your restaurants.",
      data: restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not find your restaurants. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.createRestaurant = async (req, res, next) => {
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
    const location = req.location;
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message:
          "You are not allowed to make this request. Make sure you are signed in.",
        error: "Unauthorized Request",
      });
    }

    const restaurantData = {
      name,
      main_image,
      images,
      description,
      open_time,
      close_time,
      slug: slug(`${name} ${location} ${new Date().getTime()}`),
      price,
      location_id,
      cuisine_id,
      owner_id: id,
    };

    const restaurant = await services.createRestaurantService(restaurantData);

    const tablesData = [];
    for (let i = 0; i < tables[0]; i++) {
      tablesData.push({
        seats: 4,
        restaurant_id: restaurant.id,
      });
    }
    for (let i = 0; i < tables[1]; i++) {
      tablesData.push({
        seats: 2,
        restaurant_id: restaurant.id,
      });
    }

    await services.createTablesService(tablesData);

    if (user.role === "USER") {
      await makeOwnerService(id);
    }

    return res.status(200).json({
      status: "success",
      message: `Created restaurant ${restaurant.name}`,
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not create your restaurants. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.updateRestaurant = async (req, res, next) => {
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

    const { slug: restaurantSlug } = req.params;

    const restaurantData = {
      name,
      main_image,
      description,
      open_time,
      close_time,
      price,
      images,
      slug: slug(`${name} ${req.location} ${new Date().getTime()}`),
    };

    const restaurant = await services.updateRestaurantService(
      restaurantSlug,
      restaurantData
    );

    return res.status(200).json({
      status: "success",
      message: "Successfully saved changes.",
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not update your restaurants. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.fetchAvailabilities = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { day, time, partySize } = req.query;

    if (!day || !time || !partySize) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid data provided.",
        error: "Query Error",
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug,
      },
      select: {
        tables: true,
        open_time: true,
        close_time: true,
      },
    });

    if (!restaurant) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid data provided.",
        error: "Query Error",
      });
    }

    const searchTimesWithTables = await findAvailableTables({
      day,
      time,
      restaurant,
      res,
    });

    if (!searchTimesWithTables) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid data provided.",
        error: "Query Error",
      });
    }

    // Checking time is available or not
    const availabilities = searchTimesWithTables
      .map((t) => {
        const sumSeats = t.tables.reduce((sum, table) => sum + table.seats, 0);
        return {
          time: t.time,
          available: sumSeats >= parseInt(partySize),
        };
      })
      .filter((availability) => {
        const timeIsAfterOpeningHour =
          new Date(`${day}T${availability.time}`) >=
          new Date(`${day}T${restaurant.open_time}`);
        const timeIsBeforeClosingHour =
          new Date(`${day}T${availability.time}`) <=
          new Date(`${day}T${restaurant.close_time}`);

        return timeIsAfterOpeningHour && timeIsBeforeClosingHour;
      });

    return res.status(200).json({
      status: "success",
      message: "Successfully got the data.",
      data: availabilities,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not get the data. Please try again later.",
      error: "Internal Server Error",
    });
  }
};
