import axios from "axios";
// import axiosInstance from "@/lib/axios";

export const checkAuthApi = async () => {
  // const res = await axiosInstance.get("/api/auth/check-auth");
  const res = await axios.get("/api/auth/check-auth");
  return res;
};

export const loginApi = async (data: unknown) => {
  // const res = await axiosInstance.post("/api/auth/login", data);
  const res = await axios.post("/api/auth/login", data);

  return res;
};

export const signupApi = async (data: unknown) => {
  // const res = await axiosInstance.post("/api/auth/signup", data);
  const res = await axios.post("/api/auth/signup", data);
  return res;
};

export const googleLoginApi = async (token: string) => {
  // const res = await axiosInstance.post("/api/auth/google-login", { token });
  const res = await axios.post("/api/auth/google-login", { token });
  return res;
};

export const logoutApi = async () => {
  // const res = await axiosInstance.post("/api/auth/logout");
  const res = await axios.post("/api/auth/logout");
  return res;
};