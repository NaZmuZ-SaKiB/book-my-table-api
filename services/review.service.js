const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.createReviewService = async (reviewData) => {
  const review = await prisma.review.create({
    data: reviewData,
  });

  return review;
};
