const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAllCuisineService = async () => {
  return await prisma.cuisine.findMany();
};
