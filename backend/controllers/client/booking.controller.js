const Booking = require("../../models/booking.model");
const Flight = require("../../models/flight.model")
const { momoConfig } = require("../../config/momo.config");
const { generateUniqueBookingCode } = require("../../helpers/generate.helper");
const { createMomoPayment } = require("../../helpers/pay.helper");
const { updateFlightSeats } = require("../../helpers/seat.helper")
const { sendBookingConfirmationEmail, sendBookingCancellationEmail } = require("../../helpers/email.helper");

const createBooking = async (req, res) => {
  try {
    const {
      paymentMethod,
      outboundFlight,
      returnFlight, // Có thể null nếu không có chuyến về
      passengers,
      contactInfo,
      totalPrice,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!outboundFlight || !passengers || !contactInfo || !totalPrice) {
      return res
        .status(400)
        .json({ message: "Thiếu dữ liệu cần thiết để tạo booking" });
    }

    // Kiểm tra yêu cầu user cho người dùng đã đăng nhập
    if (req.user && !req.user._id) {
      return res
        .status(400)
        .json({ message: "Thông tin người dùng không hợp lệ" });
    }

    const passengerCount = passengers.length;

    // Trừ số ghế ngay khi tạo booking
    await updateFlightSeats(
      outboundFlight.flightId,
      outboundFlight.seatTypeOutbound,
      passengerCount,
      "decrease"
    );

    if (returnFlight) {
      await updateFlightSeats(
        returnFlight.flightId,
        returnFlight.seatTypeReturn,
        passengerCount,
        "decrease"
      );
    }

    const newBooking = new Booking({
      bookingCode: generateUniqueBookingCode(),
      user: req.user ? req.user._id : undefined,
      contactInfo: contactInfo,
      flight: [
        {
          flightId: outboundFlight.flightId,
          ticketType: outboundFlight.seatTypeOutbound,
          price: outboundFlight.priceOutboundFlight,
        },
        ...(returnFlight
          ? [
              {
                flightId: returnFlight.flightId,
                ticketType: returnFlight.seatTypeReturn,
                price: returnFlight.priceReturnFlight,
              },
            ]
          : []),
      ],
      passengers: passengers,
      totalPrice: totalPrice,
      status: "Pending",
    });

    await newBooking.save();

    if (paymentMethod === "momo") {
      const paymentResponse = await createMomoPayment(newBooking);

      if (paymentResponse.resultCode === 0) {
        newBooking.payment = {
          method: "MoMo",
          orderId: paymentResponse.orderId,
          requestId: paymentResponse.requestId,
          payUrl: paymentResponse.payUrl,
          status: "Pending",
          momo: {
            partnerCode: momoConfig.partnerCode,
            expiresAt: new Date(
              Date.now() + 1 * 60 * 60 * 1000 + 40 * 60 * 1000
            ), // 1 giờ 40 phút
          },
        };
        await newBooking.save();

        return res.status(201).json({
          message: "Đặt vé thành công, đang chờ thanh toán MoMo",
          booking: newBooking,
          paymentUrl: paymentResponse.payUrl,
        });
      } else {
        // Nếu khởi tạo thanh toán thất bại, hoàn lại số ghế
        await updateFlightSeats(
          outboundFlight.flightId,
          outboundFlight.seatTypeOutbound,
          passengerCount,
          "increase"
        );
        if (returnFlight) {
          await updateFlightSeats(
            returnFlight.flightId,
            returnFlight.seatTypeReturn,
            passengerCount,
            "increase"
          );
        }
        newBooking.status = "Cancelled";
        await newBooking.save();
        throw new Error(
          paymentResponse.message || "Khởi tạo thanh toán MoMo thất bại"
        );
      }
    } else {
      // Nếu phương thức thanh toán không hợp lệ, hoàn lại số ghế
      await updateFlightSeats(
        outboundFlight.flightId,
        outboundFlight.seatTypeOutbound,
        passengerCount,
        "increase"
      );
      if (returnFlight) {
        await updateFlightSeats(
          returnFlight.flightId,
          returnFlight.seatTypeReturn,
          passengerCount,
          "increase"
        );
      }
      newBooking.status = "Cancelled";
      await newBooking.save();

      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ" });
    }
  } catch (error) {
    // Rollback số ghế trong trường hợp lỗi bất ngờ
    const { outboundFlight, returnFlight, passengers } = req.body;
    if (outboundFlight && passengers) {
      const passengerCount = passengers.length;
      try {
        await updateFlightSeats(
          outboundFlight.flightId,
          outboundFlight.seatTypeOutbound,
          passengerCount,
          "increase"
        );
        if (returnFlight) {
          await updateFlightSeats(
            returnFlight.flightId,
            returnFlight.seatTypeReturn,
            passengerCount,
            "increase"
          );
        }
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }
    return res
      .status(500)
      .json({ message: "Lỗi khi tạo đặt vé hoặc xử lý thanh toán" });
  }
};

const handleMomoIPN = async (req, res) => {
  try {
    const { resultCode, extraData, transId, amount, signature, responseTime } = req.body;
    // console.log(resultCode);

    const decodedExtraData = JSON.parse(
      Buffer.from(extraData, "base64").toString()
    );
    const booking = await Booking.findById(decodedExtraData.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đặt vé" });
    }

    const passengerCount = booking.passengers.length;

    if (resultCode === 0) {
      // Thanh toán thành công, giữ nguyên số ghế đã trừ
      booking.status = "Completed";
      booking.payment.status = "Completed";
      booking.payment.momo.transId = transId;
      booking.payment.momo.amount = amount;
      booking.payment.momo.signature = signature;
      booking.payment.momo.responseTime = new Date(responseTime);

      await sendBookingConfirmationEmail(
        booking.contactInfo.email,
        booking.bookingCode
      );
    } else {
      // Thanh toán thất bại, hoàn lại số ghế
      await updateFlightSeats(
        booking.flight[0].flightId,
        booking.flight[0].ticketType,
        passengerCount,
        'increase'
      );
      if (booking.flight.length > 1) {
        await updateFlightSeats(
          booking.flight[1].flightId,
          booking.flight[1].ticketType,
          passengerCount,
          'increase'
        );
      }
      booking.status = "Cancelled";
      booking.payment.status = "Failed";
    }

    await booking.save();

    await addBookingExpirationJob(
      booking._id,
      booking.payment?.momo?.expiresAt || booking.payment?.payLater?.dueDate
    );

    return res.status(200).json({ message: "Xử lý IPN thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi xử lý IPN" });
  }
};

const checkExpiredBookings = async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      status: "Pending",
      "payment.method": "MoMo",
      "payment.momo.expiresAt": { $lt: now },
    });

    for (const booking of expiredBookings) {
      const passengerCount = booking.passengers.length;

      // Hoàn lại số ghế cho chuyến bay đi
      await updateFlightSeats(
        booking.flight[0].flightId,
        booking.flight[0].ticketType,
        passengerCount,
        "increase"
      );

      // Nếu có chuyến bay khứ hồi, hoàn số ghế
      if (booking.flight.length > 1) {
        await updateFlightSeats(
          booking.flight[1].flightId,
          booking.flight[1].ticketType,
          passengerCount,
          "increase"
        );
      }

      // Cập nhật trạng thái đặt chỗ
      booking.status = "Cancelled";
      if (booking.payment && booking.payment.status === "Pending") {
        booking.payment.status = "Failed";
      }
      await booking.save();


      //Gửi email thông báo hủy đặt chỗ
      await sendBookingCancellationEmail(
        booking.contactInfo.email,
        booking.bookingCode
      );
    }

    console.log(
      `Đã cập nhật ${expiredBookings.length} đặt vé MoMo hết hạn và hoàn số ghế`
    );
  } catch (error) {
    console.error("Lỗi khi kiểm tra đặt vé hết hạn:", error);
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingCode } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!bookingCode) {
      return res.status(400).json({ message: "Mã đặt vé là bắt buộc" });
    }

    // Tìm booking theo bookingCode
    const booking = await Booking.findOne({ bookingCode });
    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đặt vé" });
    }

    // Kiểm tra trạng thái booking
    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Đặt vé đã bị hủy trước đó" });
    }
    if (booking.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Không thể hủy vé đã hoàn tất thanh toán" });
    }

    const passengerCount = booking.passengers.length;

    // Hoàn lại số ghế cho chuyến bay đi
    await updateFlightSeats(
      booking.flight[0].flightId,
      booking.flight[0].ticketType,
      passengerCount,
      "increase"
    );

    // Nếu có chuyến bay khứ hồi, hoàn lại số ghế
    if (booking.flight.length > 1) {
      await updateFlightSeats(
        booking.flight[1].flightId,
        booking.flight[1].ticketType,
        passengerCount,
        "increase"
      );
    }

    // Cập nhật trạng thái booking
    booking.status = "Cancelled";
    if (booking.payment) {
      booking.payment.status = "Failed";
    }
    await booking.save();

    // Gửi email thông báo hủy
    await sendBookingCancellationEmail(
      booking.contactInfo.email,
      booking.bookingCode
    );

    return res.status(200).json({
      message: "Hủy đặt vé thành công",
      booking: booking,
    });
  } catch (error) {
    console.error("Lỗi khi hủy đặt vé:", error);
    return res.status(500).json({ message: "Lỗi khi hủy đặt vé" });
  }
};

const getBookingPaymentUrl = async (req, res) => {
  try {
    const { bookingCode } = req.query; // Hoặc req.body tùy bạn thiết kế

    if (!bookingCode) {
      return res.status(400).json({ message: "Mã đặt vé là bắt buộc" });
    }

    const booking = await Booking.findOne({ bookingCode });
    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đặt vé" });
    }

    // Kiểm tra trạng thái booking
    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Đặt vé không thể thanh toán do đã hoàn tất hoặc bị hủy",
      });
    }

    // Kiểm tra thời gian hết hạn của MoMo
    const now = new Date();
    if (booking.payment.momo.expiresAt < now) {
      // Nếu đã hết hạn, hủy booking và hoàn ghế
      const passengerCount = booking.passengers.length;
      await updateFlightSeats(
        booking.flight[0].flightId,
        booking.flight[0].ticketType,
        passengerCount,
        "increase"
      );
      if (booking.flight.length > 1) {
        await updateFlightSeats(
          booking.flight[1].flightId,
          booking.flight[1].ticketType,
          passengerCount,
          "increase"
        );
      }
      booking.status = "Cancelled";
      booking.payment.status = "Failed";
      await booking.save();

      return res.status(400).json({ message: "Link thanh toán đã hết hạn" });
    }

    // Trả về link thanh toán nếu vẫn hợp lệ
    return res.status(200).json({
      message: "Link thanh toán MoMo",
      bookingCode: booking.bookingCode,
      paymentUrl: booking.payment.payUrl,
      expiresAt: booking.payment.momo.expiresAt,
    });
  } catch (error) {
    console.error("Lỗi khi lấy link thanh toán:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports = {
  createBooking,
  handleMomoIPN,
  checkExpiredBookings,
  cancelBooking,
  getBookingPaymentUrl,
};
