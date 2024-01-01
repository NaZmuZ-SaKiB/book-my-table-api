const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

exports.findMyBookingsService = async (id) => {
  const bookings = await prisma.booking.findMany({
    where: {
      booker_id: id,
      booking_time: {
        [Prisma.DateTime]: {
          gt: new Date(),
        },
      },
    },
    include: {
      restaurant: true,
    },
  });

  return bookings;
};

exports.createBookingService = async (bookingData) => {
  const booking = await prisma.booking.create({
    data: bookingData,
  });

  return booking;
};

exports.deleteBookingService = async (id) => {
  await prisma.booking.delete({ where: { id } });

  return;
};
