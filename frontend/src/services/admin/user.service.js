import axiosAdmin from "./api.service";

// [GET] /admin/users - API lấy danh sách người dùng
export const getAllUsers = () => {
  return axiosAdmin.get("/users/");
};

// [GET] /admin/users/:id - API lấy chi tiết người dùng
export const getOneUser = (id) => {
  return axiosAdmin.get(`/users/${id}`);
};

// [DELETE] /admin/users/:id/delete - API xóa mềm người dùng
export const deleteUser = (id) => {
  return axiosAdmin.delete(`/users/${id}/delete`);
};

export const blockUser = (id) => {
  return axiosAdmin.patch(`/users/${id}/block`);
};

// [PATCH] /admin/users/:id/unblock - API gỡ chặn người dùng
export const unblockUser = (id) => {
  return axiosAdmin.patch(`/users/${id}/unblock`);
};