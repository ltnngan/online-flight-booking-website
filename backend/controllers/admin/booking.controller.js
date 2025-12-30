const Booking = require("../../models/booking.model")

// Lấy danh sách đơn vé
const getAllBooking = async (req, res) => {
    try {
        const bookings = await Booking.find()
          .populate("flight.flightId")
          .populate("user");

        return res.status(200).json({ data: bookings });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi lấy danh sách đơn vé!", error });
    }
}

module.exports= { getAllBooking }
