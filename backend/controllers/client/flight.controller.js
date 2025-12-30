const Flight = require("../../models/flight.model")
const Booking = require("../../models/booking.model");
const { calculateFlightPrices } = require("../../helpers/price.helper")
const { determineAgeGroup } = require("../../helpers/age.helper");

const searchFlights = async (req, res) => {
  try {
    const { from, to, date, returnDate, tripType, adults, children } =
      req.query;

    const outboundFlights = await Flight.find({
      fromCity: from,
      toCity: to,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
      status: "Scheduled",
    }).lean();

    outboundFlights.forEach((flight) => {
      flight.seats.forEach((seat) => {
        seat.price = calculateFlightPrices(flight, seat);
      });
    });

    let returnFlights = [];

    if (tripType === "roundtrip" && returnDate) {
      returnFlights = await Flight.find({
        fromCity: to,
        toCity: from,
        date: {
          $gte: new Date(returnDate),
          $lt: new Date(
            new Date(returnDate).setDate(new Date(returnDate).getDate() + 1)
          ),
        },
        status: "Scheduled",
      }).lean();

      returnFlights.forEach((flight) => {
        flight.seats.forEach((seat) => {
          seat.price = calculateFlightPrices(flight, seat);
        });
      });
    }

    return res.status(200).json({
      from, to, date, returnDate, tripType, adults, children,
      outboundFlight: outboundFlights,
      returnFlight: tripType === "roundtrip" ? returnFlights : null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi tìm kiếm chuyến bay!" });
  }
};

// Lấy các chuyến bay của tôi - Dành cho khách vãng lai
const getMyFlightsGuest = async (req, res) => {
    try {
        const { bookingCode, contactName } = req.body;

        // Kiểm tra xem cả hai tiêu chí tìm kiếm có được cung cấp không
        if (!bookingCode || !contactName) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp cả mã đặt chỗ và tên người liên hệ'
            });
        }

        const currentDate = new Date();
        let query = {
            status: { $ne: 'Cancelled' }, // Loại bỏ đặt chỗ đã hủy
            'flight.flightId': { $exists: true }
        };

        // Thêm điều kiện tìm kiếm (cả hai đều bắt buộc)
        query.bookingCode = bookingCode;
        query.$or = [
          { "contactInfo.name": contactName },
          { "passengers.name": contactName },
        ];

        const bookings = await Booking.find(query)
          .populate({
            path: "flight.flightId",
            match: {
              // date: { $gte: currentDate }, // Chỉ lấy chuyến bay tương lai
              status: "Scheduled",
              deleted: false,
            },
            select:
              "flightCode fromCity toCity date time duration aircraft basePrice seats status",
          })
          .select(
            "bookingCode flight ticketType price totalPrice status contactInfo passengers"
          )
          .lean();

        // Lọc các đặt chỗ hợp lệ
        const validBookings = bookings.filter(booking => 
            booking.flight.every(f => f.flightId !== null)
        );

        if (validBookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đặt chỗ phù hợp'
            });
        }

        res.status(200).json({
            success: true,
            count: validBookings.length,
            data: validBookings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};

const getCheapFlights = async (req, res) => {
  try {
    const maxPrice = 1000000;

    const flights = await Flight.find({
      basePrice: { $lte: maxPrice },
      status: "Scheduled",
      deleted: false,
    })
      .select("flightCode fromCity toCity date time basePrice image")
      .lean();

    if (!flights || flights.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyến bay giá rẻ phù hợp.",
      });
    }

    console.log(flights);

    res.status(200).json({
      success: true,
      count: flights.length,
      flights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chuyến bay giá rẻ.",
      error: error.message,
    });
  }
};


module.exports = {
  searchFlights,
  getMyFlightsGuest,
  getCheapFlights,
};