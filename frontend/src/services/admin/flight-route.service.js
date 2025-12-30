import axiosAdmin from "./api.service";

// [GET] /admin/flight-routes - API lấy tất cả các tuyến bay
export const getAllFlightRoutes = () => {
  return axiosAdmin.get("/flight-routes/");
};

// [POST] /admin/flight-routes/create - API tạo mới tuyến bay
export const createFlightRoute = (routeData) => {
  return axiosAdmin.post("/flight-routes/create", routeData);
};

// [PUT] /admin/flight-routes/edit/:id - API chỉnh sửa tuyến bay
export const editFlightRoute = (id, routeData) => {
  return axiosAdmin.put(`/flight-routes/${id}/delete-to-city`, routeData);
};

// [DELETE] /admin/flight-routes/delete/:id - API xoá (mềm) tuyến bay
export const deleteFlightRoute = (id) => {
  return axiosAdmin.delete(`/flight-routes/${id}/delete`);
};
