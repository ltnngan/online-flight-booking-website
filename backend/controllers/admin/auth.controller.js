const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Thêm jwt để verify token
const Admin = require("../../models/admin.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../helpers/generate.helper");

// Hàm tạo tài khoản admin mặc định
// const createDefaultAdmin = async () => {
//   try {
//     const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

//     if (adminExists) {
//       return;
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

//     const defaultAdmin = new Admin({
//       email: process.env.ADMIN_EMAIL,
//       password: hashedPassword,
//       fullName: "Admin",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     await defaultAdmin.save();
//   } catch (error) {
//     console.error("Lỗi khi tạo tài khoản admin mặc định:", error);
//   }
// };

// Đăng nhập tài khoản
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

    const admin = await Admin.findOne({ email });
    console.log(admin)

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không hợp lệ" });
    }

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    // console.log(hashedPassword);

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    console.log(isPasswordValid);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không hợp lệ" });
    }

    const accessToken = generateAccessToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      data: {
        adminId: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Đăng nhập thất bại", error });
  }
};

// Đăng xuất tài khoản
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({ message: "Bạn đã đăng xuất" });
    }

    const admin = await Admin.findOne({ refreshToken });

    if (admin) {
      admin.refreshToken = null;
      await admin.save();
    }

    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ message: "Đăng xuất thất bại", error });
  }
};

// Làm mới access token
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Không tìm thấy refresh token" });
    }

    const decoded = await jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findOne({
      _id: decoded.adminId,
      refreshToken: refreshToken,
    });

    if (!admin) {
      return res.status(403).json({ message: "Refresh token không hợp lệ" });
    }

    const newAccessToken = generateAccessToken(admin._id);

    res.status(200).json({
      success: true,
      newAccessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi làm mới access token", error });
  }
};

module.exports = {
  // createDefaultAdmin,
  login,
  logout,
  refreshAccessToken, // Export hàm này
};
