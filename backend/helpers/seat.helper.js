const Flight = require("../models/flight.model")

const updateFlightSeats = async (
  flightId,
  ticketType,
  quantity,
  action = "decrease"
) => {
  try {
    const flight = await Flight.findById(flightId);
    if (!flight) {
      throw new Error("Không tìm thấy chuyến bay");
    }

    const seatCategory = flight.seats.find(
      (seat) => seat.category === ticketType
    );
    if (!seatCategory) {
      throw new Error("Không tìm thấy loại ghế này");
    }

    if (action === "decrease") {
      if (seatCategory.available < quantity) {
        throw new Error("Không đủ ghế trống");
      }
      seatCategory.available -= quantity;
    } else if (action === "increase") {
      seatCategory.available += quantity;
      if (seatCategory.available > seatCategory.total) {
        seatCategory.available = seatCategory.total; // Đảm bảo không vượt quá số ghế tối đa
      }
    }

    await flight.save();
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = { updateFlightSeats };