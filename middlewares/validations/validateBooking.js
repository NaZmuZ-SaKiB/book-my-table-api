const { PrismaClient } = require("@prisma/client");

// Local Imports
const findAvailableTables = require("../../utils/findAvailableTables");

module.exports = async (req, res, next) => {
  try {
    const { restaurant_slug: slug } = req.params;
    const { day, time, partySize } = req.query;

    if (!day || !time || !partySize)
      return res.status(403).json({
        status: "fail",
        message: `Please provide all necessary information.`,
        error: "Invalid Data",
      });

    const prisma = new PrismaClient();

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        tables: true,
        open_time: true,
        close_time: true,
      },
    });
    if (!restaurant)
      return res.status(404).json({
        status: "fail",
        message: "Restaurant not found.",
        error: "Invalid Data Provided",
      });

    if (
      new Date(`${day}T${time}`) < new Date(`${day}T${restaurant.open_time}`) ||
      new Date(`${day}T${time}`) > new Date(`${day}T${restaurant.close_time}`)
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Restaurant is not open at that time.",
        error: "Invalid Data Provided",
      });
    }

    const searchTimesWithTables = await findAvailableTables({
      day,
      time,
      restaurant,
      res,
    });

    if (!searchTimesWithTables)
      return res.status(403).json({
        status: "fail",
        message: "Invalid data provided.",
        error: "Query Error",
      });

    const searchTimeWithTables = searchTimesWithTables.find(
      (t) => t.date.toISOString() === new Date(`${day}T${time}`).toISOString()
    );

    if (!searchTimeWithTables)
      return res.status(400).json({
        status: "fail",
        message: "Can not book. Seats are booked at this time.",
        error: "Table Not Available",
      });

    const tablesCount = {
      2: [],
      4: [],
    };

    searchTimeWithTables.tables.forEach((table) => {
      if (table.seats === 2) tablesCount[2].push(table.id);
      else tablesCount[4].push(table.id);
    });

    req.tablesCount = tablesCount;
    req.restaurant = restaurant;

    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Error occured during validating booking info.",
      error: "Internal Server Error",
    });
  }
};
