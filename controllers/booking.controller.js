const { PrismaClient } = require("@prisma/client");

// Local Imports
const services = require("../services/booking.service");

const prisma = new PrismaClient();

exports.findMyBookings = async (req, res, next) => {
  try {
    const { id } = req.user;
    const bookings = await services.findMyBookingsService(id);
    return res.status(200).json({
      status: "success",
      message: "Successfully fetched your bookings.",
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not find your bookings. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const { day, time, partySize } = req.query;
    const {
      bookerEmail,
      bookerPhone,
      bookerFirstName,
      bookerLastName,
      bookerOccasion,
      bookerRequest,
    } = req.body;
    const restaurant = req.restaurant;
    const tablesCount = req.tablesCount;

    const tablesToBook = [];

    let seatsRemaining = parseInt(partySize);

    while (seatsRemaining > 0) {
      if (seatsRemaining >= 3) {
        if (tablesCount[4].length) {
          tablesToBook.push({ id: tablesCount[4][0] });
          tablesCount[4].shift();
          seatsRemaining -= 4;
        } else {
          tablesToBook.push({ id: tablesCount[2][0] });
          tablesCount[2].shift();
          seatsRemaining -= 2;
        }
      } else {
        if (tablesCount[2].length) {
          tablesToBook.push({ id: tablesCount[2][0] });
          tablesCount[2].shift();
          seatsRemaining -= 2;
        } else {
          tablesToBook.push({ id: tablesCount[4][0] });
          tablesCount[4].shift();
          seatsRemaining -= 4;
        }
      }
    }

    const bookingData = {
      number_of_people: parseInt(partySize),
      booking_time: new Date(`${day}T${time}`),
      booker_email: bookerEmail,
      booker_first_name: bookerFirstName,
      booker_last_name: bookerLastName,
      booker_phone: bookerPhone,
      booker_occasion: bookerOccasion || "",
      booker_request: bookerRequest || "",
      restaurant_id: restaurant.id,
      tables: {
        connect: tablesToBook,
      },
    };

    if (req.body?.booker_id) {
      bookingData.booker_id = req.body?.booker_id;
    }

    const booking = await services.createBookingService(bookingData);

    return res.status(200).json({
      status: "success",
      message: "Completed your reservation.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not create your bookings. Please try again later.",
      error: "Internal Server Error",
    });
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, booker_id: true },
    });

    if (!booking || booking.booker_id !== userId) {
      return res(404).json({
        status: "fail",
        message:
          "Booking not found. Make sure this is your booking and you are signed in.",
        error: "Not found",
      });
    }

    await services.deleteBookingService(parseInt(id));

    return res.status(200).json({
      status: "success",
      message: "Successfully deleted your booking.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Could not delete your bookings. Please try again later.",
      error: "Internal Server Error",
    });
  }
};
