const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.findAllRestaurantService = async (where) => {
  const restaurants = await prisma.restaurant.findMany({
    where,
    select: {
      id: true,
      name: true,
      main_image: true,
      price: true,
      slug: true,
      reviews: true,
      items: true,
      tables: true,
      location: true,
      cuisine: true,
      bookings: true,
    },
  });

  return restaurants;
};

exports.getRestaurantBySlugService = async (slug) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      reviews: true,
      items: true,
      tables: true,
      location: true,
      cuisine: true,
    },
  });
  return restaurant;
};

exports.createRestaurantService = async (restaurantData) => {
  const restaurant = await prisma.restaurant.create({
    data: restaurantData,
  });

  return restaurant;
};

exports.updateRestaurantService = async (slug, restaurantData) => {
  const restaurant = await prisma.restaurant.update({
    where: { slug },
    data: restaurantData,
  });

  return restaurant;
};

exports.getMyRestaurantsService = async (owner_id) => {
  const restaurants = await prisma.restaurant.findMany({
    where: { owner_id },
    include: {
      reviews: true,
      items: true,
      tables: true,
      location: true,
      cuisine: true,
      bookings: true,
    },
  });

  return restaurants;
};

exports.createTablesService = async (tablesData) => {
  await prisma.table.createMany({
    data: tablesData,
  });

  return;
};
