import api from "./axiosInstance";
export const authAPI = {
  register:      (data)  => api.post("/auth/register", data),
  verifyEmail:   (token) => api.get("/auth/verify-email/" + token),
  login:         (data)  => api.post("/auth/login", data),
  logout:        ()      => api.post("/auth/logout"),
  forgotPassword:(data)  => api.post("/auth/forgot-password", data),
  resetPassword: (data)  => api.post("/auth/reset-password", data),
  getCurrentUser:()      => api.get("/auth/me"),
};
