const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const processThumbnail = async (buffer, originalname) => {
    const filename = `${Date.now()}-${originalname}`;
    const filePath = path.join(uploadDir, filename);

    await sharp(buffer).toFormat("jpeg").toFile(filePath);

    return `/uploads/${filename}`;
};

module.exports = { processThumbnail };
