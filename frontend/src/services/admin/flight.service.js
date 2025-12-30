import axiosAdmin from "./api.service";

// [GET] /admin/flights - API lấy danh sách chuyến bay
export const getAllFlights = () => {
  return axiosAdmin.get("/flights/");
};

// [GET] /admin/flights/:id - API lấy chi tiết chuyến bay
export const getOneFlight = (id) => {
  return axiosAdmin.get(`/flights/${id}`);
};

// [POST] /admin/flights/create - API tạo chuyến bay
export const createFlight = (flightData, imageFile) => {
  const formData = new FormData();

  // Sao chép flightData và loại bỏ flightCode nếu có
  const cleanedFlightData = { ...flightData };
  delete cleanedFlightData.flightCode;

  for (const key in cleanedFlightData) {
    if (key === "seats") {
      formData.append(key, JSON.stringify(cleanedFlightData[key])); // Gửi seats dưới dạng chuỗi JSON
    } else {
      formData.append(key, cleanedFlightData[key]);
    }
  }
  if (imageFile) {
    formData.append("image", imageFile);
  }
  return axiosAdmin.post("/flights/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// [PUT] /admin/flights/:id/edit - API cập nhật chuyến bay
export const editFlight = (id, flightData, imageFile) => {
  const formData = new FormData();

  // Sao chép flightData và loại bỏ flightCode nếu có
  const cleanedFlightData = { ...flightData };
  delete cleanedFlightData.flightCode;

  for (const key in cleanedFlightData) {
    if (key === "seats") {
      formData.append(key, JSON.stringify(cleanedFlightData[key]));
    } else {
      formData.append(key, cleanedFlightData[key]);
    }
  }
  if (imageFile) {
    formData.append("image", imageFile);
  }
  return axiosAdmin.put(`/flights/${id}/edit`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// [DELETE] /admin/flights/:id/delete - API xóa mềm chuyến bay
export const deleteFlight = (id) => {
  return axiosAdmin.delete(`/flights/${id}/delete`);
};
