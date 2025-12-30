require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOverride = require("method-override");

const { connect } = require("./config/database");
const systemConfig = require("./config/system");

const clientRoutes = require("./routes/client/index");
const adminRoutes = require("./routes/admin/index");

const {
  checkExpiredBookings,
} = require("./controllers/client/booking.controller");

const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối MongoDB
connect();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 30 },
  })
);
app.use(methodOverride("_method"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

//Cấu hình biến toàn cục
app.locals.prefixAdmin = systemConfig.prefixAdmin;

//Đăng ký route
clientRoutes(app);
adminRoutes(app);

// Chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

cron.schedule("* * * * *", () => {
  console.log("Đang tiến hành kiểm tra các đặt chỗ hết hạn...");

  checkExpiredBookings()
    .then(() => {
      console.log("Đã hoàn tất kiểm tra các đặt chỗ đã hết hạn.");
    })
    .catch((error) => {
      console.error("Đã xảy ra lỗi khi kiểm tra các đặt chỗ đã hết hạn:", error);
    });
});