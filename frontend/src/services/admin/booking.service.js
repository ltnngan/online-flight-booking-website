import axiosAdmin from "./api.service";

// [GET] /admin/bookings - API lấy danh sách đơn vé
export const getAllBookings = () => {
  return axiosAdmin.get("/bookings/");
};
