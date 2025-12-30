const User = require("../../models/user.model")

// Lấy danh sách người dùng
const getAllUser = async (req, res) => {
    try {
        const users = await User.find({ deleted: false });
        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng!", error });
    }
}

// Lấy chi tiết người dùng
const getOneUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
    
        if (!user || user.deleted) {
            return res.status(404).json({ message: "người dùng không tồn tại!" });
        }
    
        return res.status(200).json({ data: user });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi xem chi tiết người dùng!", error });
    }
};

// Xoá (mềm) người dùng
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || user.deleted) {
            return res.status(400).json({ message: "Không tìm thấy tài khoản người dùng!" });
        }

        user.deleted = true;
        user.deletedAt = new Date();
        user.status = "inactive"; 

        await user.save();

        return res.status(200).json({ message: "Xoá tài khoản người dùng thành công!" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi xoá người dùng!" });
    }
};

// Chặn người dùng (không xoá)
const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || user.deleted) {
            return res.status(404).json({ message: "Người dùng không tồn tại hoặc đã bị xoá!" });
        }

        user.status = "banned";
        await user.save();

        return res.status(200).json({ message: "Chặn người dùng thành công!" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi chặn người dùng!", error });
    }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.deleted) {
      return res
        .status(404)
        .json({ message: "Người dùng không tồn tại hoặc đã bị xoá!" });
    }

    if (user.status !== "banned") {
      return res
        .status(400)
        .json({ message: "Người dùng không ở trạng thái bị chặn!" });
    }

    user.status = "active";
    await user.save();

    return res.status(200).json({ message: "Gỡ chặn người dùng thành công!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi gỡ chặn người dùng!", error });
  }
};

module.exports = {
  getAllUser,
  getOneUser,
  deleteUser,
  blockUser,
  unblockUser,
};