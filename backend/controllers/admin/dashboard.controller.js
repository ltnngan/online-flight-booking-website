const moment = require("moment");

const Flight = require("../../models/flight.model");
const Booking = require("../../models/booking.model"); // Thay Order bằng Booking
const User = require("../../models/user.model");

exports.getMonthlyStatistics = async (req, res) => {
  try {
    // Lấy 6 tháng gần nhất
    const months = Array.from({ length: 6 }, (_, i) =>
      moment().subtract(i, "months").format("YYYY-MM")
    );

    // Tổng số chuyến bay theo tháng
    const flightsData = await Flight.aggregate([
      {
        $match: { deleted: false, status: { $ne: "Cancelled" } }, // Loại bỏ chuyến bay bị hủy
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalFlights: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Tổng số lượng vé đã bán theo tháng (dựa trên mảng flight trong Booking)
    const ticketsData = await Booking.aggregate([
      { $unwind: "$flight" }, // Tách mảng flight
      {
        $match: { status: "Completed" }, // Chỉ tính các booking đã hoàn thành
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalTickets: { $sum: 1 }, // Mỗi flight trong booking tính là 1 vé
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Tổng số thành viên theo tháng
    const usersData = await User.aggregate([
      {
        $match: { deleted: false, status: "active" }, // Chỉ tính user active
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalPassengers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Doanh thu tổng theo tháng (dựa trên totalPrice của Booking)
    const revenueData = await Booking.aggregate([
      {
        $match: { status: "Completed" }, // Chỉ tính các booking đã hoàn thành
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalPrice" }, // Tính tổng totalPrice
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Kết hợp dữ liệu thành dạng JSON theo từng tháng
    const monthlyData = months.map((month) => ({
      month,
      totalFlights: flightsData.find((d) => d._id === month)?.totalFlights || 0,
      totalTickets: ticketsData.find((d) => d._id === month)?.totalTickets || 0,
      totalPassengers:
        usersData.find((d) => d._id === month)?.totalPassengers || 0,
      totalRevenue: revenueData.find((d) => d._id === month)?.totalRevenue || 0,
    }));

    return res.status(200).json(monthlyData);
  } catch (error) {
    console.error(error); // Log lỗi để debug
    return res.status(500).json({ message: "Lỗi khi lấy thống kê" });
  }
};
