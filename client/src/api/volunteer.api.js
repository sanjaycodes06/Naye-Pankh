import api from "./axiosInstance";
export const volunteerAPI = {
  getProfile:           ()         => api.get("/volunteers/me"),
  updateProfile:        (data)     => api.put("/volunteers/me", data),
  uploadPhoto:          (form)     => api.put("/volunteers/me/photo", form, { headers: { "Content-Type": "multipart/form-data" } }),
  getDashboard:         ()         => api.get("/volunteers/me/dashboard"),
  getTasks:             (params)   => api.get("/volunteers/me/tasks", { params }),
  submitTask:           (id, data) => api.post("/volunteers/me/tasks/" + id + "/submit", data),
  getAttendance:        (params)   => api.get("/volunteers/me/attendance", { params }),
  getCertificates:      ()         => api.get("/volunteers/me/certificates"),
  getNotifications:     (params)   => api.get("/volunteers/me/notifications", { params }),
  markNotificationRead: (id)       => api.patch("/volunteers/me/notifications/" + id + "/read"),
};
