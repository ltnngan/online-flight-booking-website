const FlightRoute = require("../../models/flight-route.model");

// Lấy danh sách tuyến bay
const getAllFlightRoute = async (req, res) => {
    try {
        const flightRoutes = await FlightRoute.find({ deleted: false });
        return res.status(200).json({ data: flightRoutes });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi lấy danh sách tuyến bay!", error });
    }
}

// Thêm tuyến bay
const createFlightRoute = async (req, res) => {
    try {
        const { fromCity, toCity } = req.body;

        const flightRoutes = await FlightRoute.findOne({
            fromCity,
            toCity,
            deleted: false,
        });

        if (flightRoutes) {
            return res.status(400).json({ message: "Tuyến bay đã tồn tại!" });
        }

        const fromCityFlightRoutes = await FlightRoute.findOne({
            fromCity,
            deleted: false,
        });

        if (fromCityFlightRoutes) {
            fromCityFlightRoutes.toCity.push(toCity);
            await fromCityFlightRoutes.save();
            return res.status(200).json({ message: "Thêm điểm đến thành công!" });
        }

        const newFlightRoute = new FlightRoute(req.body);
        await newFlightRoute.save();

        return res.status(200).json({ data: newFlightRoute });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi tạo tuyến bay!", error });
    }
}

// Xoá thành phố đến khỏi tuyến bay
const deleteToCity = async (req, res) => {
    try {
        const flightRoute = await FlightRoute.findById(req.params.id);

        if (!flightRoute || flightRoute.deleted) {
            return res.status(400).json({ message: "Không tìm thấy tuyến bay!" });
        }

        flightRoute.toCity.splice(req.body.toCityIndex, 1);
        await flightRoute.save();

        return res.status(200).json({ message: "Xoá Thành Phố đến thành công!", data: flightRoute });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi không thể xoá Thành Phố đến khỏi tuyến bay!", error });
    }
}

// Xoá (mềm) tuyến bay
const deleteFlightRoute = async (req, res) => {
    try {
        const flightRoute = await FlightRoute.findById(req.params.id);

        if (!flightRoute || flightRoute.deleted) {
            return res.status(400).json({ message: "Không tìm thấy tuyến bay!" });
        }

        flightRoute.deleted = true;
        flightRoute.deletedAt = new Date();
        await flightRoute.save();

        return res.status(200).json({ message: "Xoá tuyến bay thành công!" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi xoá tuyến bay!", error });
    }
}

module.exports = {
    getAllFlightRoute,
    createFlightRoute,
    deleteToCity,
    deleteFlightRoute,
};