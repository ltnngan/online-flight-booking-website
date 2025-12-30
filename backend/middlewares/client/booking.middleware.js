const Flight = require("../../models/flight.model");

exports.restoreSeats = async (doc, next) => {
  try {
    const flight = await Flight.findById(doc.flight);
    if (!flight) return next();

    const seatCategory = flight.seats.find(
      (s) => s.category === doc.ticketType
    );
    if (seatCategory) {
      seatCategory.available += 1;
      await flight.save();
    }

    next();
  } catch (error) {
    next(error);
  }
};
