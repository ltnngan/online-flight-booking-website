const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = async (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(file.mimetype);

    if (isValid) {
        return cb(null, true);
    } else {
        return cb(
            new Error(
                "Loại tệp không hợp lệ. Chỉ chấp nhận JPEG, JPG, PNG, GIF, WEBP."
            ),
            false
        );
    }
};

const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB
};

const upload = multer({
  storage,
  fileFilter,
  limits,
}).single("image");

module.exports = upload;