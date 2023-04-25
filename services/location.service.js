const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAllLocationService = async () => {
  return await prisma.location.findMany();
};
