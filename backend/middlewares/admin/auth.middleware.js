// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin.model");

exports.authenticateToken = async (req, res, next) => {
  try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; 

        if (!token) {
            return res.status(400).json({ message: "Không tìm thấy token truy cập" });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
            }

            const admin = await Admin.findById(decoded._id).select("-password");

            if (!admin) {
                return res.status(403).json({ message: "Admin không tồn tại" });
            }

            req.admin = admin;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: "lỗi kết nối cơ sở dữ liệu, lỗi hệ thống", error });
    }
};
