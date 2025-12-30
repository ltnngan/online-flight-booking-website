
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // console.log("Received token:", token);

    if (!token) {
      req.user = null;
      // console.log("No token provided, treating as guest");
      return next();
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        // console.log("Token verification failed:", err);
        return res
          .status(403)
          .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
      }

      const user = await User.findById(decoded._id).select("-password");
      // console.log("Found user:", user);

      if (!user || user.deleted || user.status !== "active") {
        return res
          .status(403)
          .json({ message: "Người dùng không tồn tại hoặc không hoạt động" });
      }

      req.user = user;
      // console.log("req.user set to:", req.user);
      next();
    });
  } catch (error) {
    // console.error("Authentication error:", error);
    res
      .status(500)
      .json({ message: "Lỗi kết nối cơ sở dữ liệu hoặc lỗi hệ thống", error });
  }
};
