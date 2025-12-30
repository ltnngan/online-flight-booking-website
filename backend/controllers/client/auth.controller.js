const bcrypt = require("bcrypt");
const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../helpers/generate.helper");

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "Email đã được đăng ký" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      phone,
    });
    await newUser.save();

    res.status(200).json({
      message: "Đăng ký thành công",
      data: {
        userId: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Đăng ký thất bại", error });
  }
};

// Đăng nhập tài khoản
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, deleted: false });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không hợp lệ" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không hợp lệ" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Tài khoản bị khóa hoặc bị cấm" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar || null,
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

    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ message: "Đăng xuất thất bại", error });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const cookie = req.cookies;

    // Check xem có token hay không
    if (!cookie && !cookie.refreshToken)
      throw new Error("No refresh token in cookies");

    const rs = await jwt.verify(
      cookie.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const response = await User.findOne({
      _id: rs._id,
      refreshToken: cookie.refreshToken,
    });

    return res.status(200).json({
      success: response ? true : false,
      newAccessToken: response
        ? generateAccessToken(response._id)
        : "Refresh token not matched",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi làm mới access token", error });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
};
