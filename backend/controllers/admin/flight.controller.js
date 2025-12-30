const Flight = require("../../models/flight.model");
const { calculateFlightPrices } = require("../../helpers/price.helper");
const { processThumbnail } = require("../../helpers/image.helper");
const crypto = require("crypto");
const { generateUniqueFlightCode } = require("../../helpers/generate.helper")

// Lấy danh sách chuyến bay
const getAllFlight = async (req, res) => {
  try {
    const flights = await Flight.find({ deleted: false }).lean();
    flights.forEach(flight => {
      flight.seats.forEach(seat => {
        seat.price = calculateFlightPrices(flight, seat);
      });
    });
    return res.status(200).json({ data: flights });
  } catch (error) {
    console.error("Lỗi lấy danh sách chuyến bay:", error);
    return res.status(500).json({ message: "Lỗi khi lấy danh sách tuyến bay!", error });
  }
};

// Lấy chi tiết chuyến bay
const getOneFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id).lean();
    if (!flight || flight.deleted) {
      return res.status(404).json({ message: "Chuyến bay không tồn tại!" });
    }
    flight.seats.forEach((seat) => {
      seat.price = calculateFlightPrices(flight, seat);
    });
    return res.status(200).json({ data: flight });
  } catch (error) {
    console.error("Lỗi lấy chi tiết chuyến bay:", error);
    return res.status(500).json({ message: "Lỗi khi xem chi tiết chuyến bay!", error });
  }
};

// Tạo chuyến bay
const createFlight = async (req, res) => {
  try {
    const flightData = req.body;

    // Parse seats nếu là chuỗi JSON
    if (typeof flightData.seats === "string") {
      try {
        flightData.seats = JSON.parse(flightData.seats);
      } catch (error) {
        return res.status(400).json({ message: "Dữ liệu seats không hợp lệ!" });
      }
    }

    // Kiểm tra seats là mảng và hợp lệ
    if (!Array.isArray(flightData.seats) || flightData.seats.some(seat => 
      !seat.category || typeof seat.available !== "number" || 
      typeof seat.total !== "number" || typeof seat.priceMultiplier !== "number"
    )) {
      return res.status(400).json({ message: "Dữ liệu seats không hợp lệ!" });
    }

    // Loại bỏ các trường không mong muốn trong seats
    flightData.seats = flightData.seats.map(seat => ({
      category: seat.category,
      available: seat.available,
      total: seat.total,
      priceMultiplier: seat.priceMultiplier
    }));

    // Tự động sinh mã chuyến bay
    flightData.flightCode = generateUniqueFlightCode();

    // Xử lý ảnh
    if (req.file) {
      try {
        const imagePath = await processThumbnail(req.file.buffer, req.file.originalname);
        flightData.image = imagePath;
      } catch (error) {
        console.error("Lỗi xử lý ảnh:", error);
        return res.status(500).json({ message: "Lỗi khi xử lý ảnh!", error });
      }
    }

    const newFlight = new Flight(flightData);
    await newFlight.save();
    return res.status(200).json({ message: "Tạo chuyến bay thành công!", data: newFlight });
  } catch (error) {
    console.error("Lỗi tạo chuyến bay:", error);
    return res.status(500).json({ message: "Lỗi tạo chuyến bay!", error: error.message });
  }
};

// Chỉnh sửa chuyến bay
const editFlight = async (req, res) => {
  try {
    // Kiểm tra ID hợp lệ
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID chuyến bay không hợp lệ!" });
    }

    // Tìm chuyến bay
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: "Chuyến bay không tồn tại!" });
    }
    if (flight.deleted) {
      return res.status(400).json({ message: "Chuyến bay đã bị xóa!" });
    }

    // Xử lý dữ liệu cập nhật
    const flightData = { ...req.body };
    delete flightData.flightCode; // Không cho phép cập nhật flightCode

    // Parse seats nếu là chuỗi JSON
    if (typeof flightData.seats === "string") {
      try {
        flightData.seats = JSON.parse(flightData.seats);
      } catch (error) {
        return res.status(400).json({ message: "Dữ liệu seats không hợp lệ!" });
      }
    }

    // Kiểm tra seats là mảng và hợp lệ
    if (!Array.isArray(flightData.seats) || flightData.seats.some(seat => 
      !seat.category || typeof seat.available !== "number" || 
      typeof seat.total !== "number" || typeof seat.priceMultiplier !== "number"
    )) {
      return res.status(400).json({ message: "Dữ liệu seats không hợp lệ!" });
    }

    // Loại bỏ các trường không mong muốn trong seats
    flightData.seats = flightData.seats.map(seat => ({
      category: seat.category,
      available: seat.available,
      total: seat.total,
      priceMultiplier: seat.priceMultiplier
    }));

    // Xử lý ảnh
    if (req.file) {
      try {
        const imagePath = await processThumbnail(req.file.buffer, req.file.originalname);
        flightData.image = imagePath;
      } catch (error) {
        console.error("Lỗi xử lý ảnh:", error);
        return res.status(500).json({ message: "Lỗi khi xử lý ảnh!", error });
      }
    }

    // Cập nhật chuyến bay
    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      flightData,
      { new: true, runValidators: true }
    );

    if (!updatedFlight) {
      return res.status(404).json({ message: "Không thể cập nhật chuyến bay!" });
    }

    return res.status(200).json({ message: "Cập nhật chuyến bay thành công!", data: updatedFlight });
  } catch (error) {
    console.error("Lỗi cập nhật chuyến bay:", error);
    return res.status(500).json({ message: "Lỗi cập nhật chuyến bay!", error: error.message });
  }
};

// Xoá (mềm) chuyến bay
const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight || flight.deleted) {
      return res.status(400).json({ message: "Không tìm thấy chuyến bay!" });
    }
    flight.deleted = true;
    flight.deletedAt = new Date();
    await flight.save();
    return res.status(200).json({ message: "Xoá chuyến bay thành công!" });
  } catch (error) {
    console.error("Lỗi xoá chuyến bay:", error);
    return res.status(500).json({ message: "Lỗi khi xoá chuyến bay!", error });
  }
};

module.exports = {
  getAllFlight,
  getOneFlight,
  createFlight,
  editFlight,
  deleteFlight,
};