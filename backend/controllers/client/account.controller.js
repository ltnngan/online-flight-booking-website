const User = require("../../models/user.model")

const Flight = require("../../models/flight.model");
const Booking = require("../../models/booking.model");
const { processThumbnail } = require("../../helpers/image.helper");

const getAccountInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findOne({ _id: userId, deleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    // Trả về thông tin người dùng
    return res.status(200).json({
      success: true,
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tài khoản:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server!", error: error.message });
  }
};

// Cập nhật người dùng
const updateAccount = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const userId = req.params.id;

    console.log("ID nhận được từ params:", userId);
    console.log("fullName nhận được từ params:", fullName);
    console.log("phone nhận được từ params:", phone);

    const user = await User.findOne({ _id: userId, deleted: false });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    if (req.file) {
      const imagePath = await processThumbnail(
        req.file.buffer,
        req.file.originalname
      );
      user.avatar = imagePath;
    }

    user.fullName = fullName || user.fullName;
    user.phone = phone || user.phone;

    await user.save();

    return res.status(200).json({
      message: "Cập nhật người dùng thành công!",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi cập nhật người dùng!", error });
  }
};

// Xoá (mềm) người dùng
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, deleted: false });

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        user.deleted = true;
        user.deletedAt = new Date();
        user.status = "inactive";
        await user.save();

        return res.status(200).json({ message: "Xoá tài người thành công!" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi xoá người dùng!", error });
    }
};

// Lấy các chuyến bay của tôi - Dành cho người đã đăng nhập
const getMyFlightsAuthenticated = async (req, res) => {
    try {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để xem các chuyến bay của bạn'
            });
        }

        const currentDate = new Date();
        const bookings = await Booking.find({
          user: req.user._id, // Lấy theo ID người dùng
          status: { $ne: "Cancelled" }, // Loại bỏ đặt chỗ đã hủy
          "flight.flightId": { $exists: true },
        })
          .populate({
            path: "flight.flightId",
            match: {
              date: { $gte: currentDate }, // Chỉ lấy chuyến bay tương lai
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

// Lấy lịch sử chuyến bay (giữ nguyên như cũ)
const getFlightHistory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để xem lịch sử chuyến bay'
            });
        }

        const currentDate = new Date();
        const bookings = await Booking.find({
          user: req.user._id,
          status: { $ne: "Pending" },
        })
          .populate({
            path: "flight.flightId",
            match: {
              date: { $lt: currentDate },
              deleted: false,
            },
            select:
              "flightCode fromCity toCity date time duration aircraft basePrice status",
          })
          .select(
            "bookingCode flight ticketType price totalPrice status contactInfo passengers createdAt"
          )
          .sort({ "flight.flightId.date": -1 })
          .lean();

        const validBookings = bookings.filter(booking => 
            booking.flight.every(f => f.flightId !== null)
        );

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

module.exports = {
  getAccountInfo,
  updateAccount,
  deleteAccount,
  getMyFlightsAuthenticated,
  getFlightHistory,
};