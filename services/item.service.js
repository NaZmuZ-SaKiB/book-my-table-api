const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.createItemService = async (itemData) => {
  await prisma.item.create({
    data: itemData,
  });

  return;
};
