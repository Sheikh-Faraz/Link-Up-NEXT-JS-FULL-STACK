// import axios from "axios";
import axiosInstance from "@/lib/axios";

export const fetchUserInfoApi = async () => {
  const res = await axiosInstance.get("/actions/get-user-info");
  return res.data.user;
};

export const updateUserProfileApi = async (data: unknown) => {
  const res = await axiosInstance.put("/actions/update-profile", data);
  return res.data;
};

export const checkAuthApi = async () => {
  const res = await axiosInstance.get("/api/auth/check-auth");
  return res.data;
};

export const loginApi = async (data: unknown) => {
  const res = await axiosInstance.post("/api/auth/login", data);
  return res.data;
};

export const signupApi = async (data: unknown) => {
  const res = await axiosInstance.post("/api/auth/signup", data);
  return res.data;
};

export const googleLoginApi = async (token: string) => {
  const res = await axiosInstance.post("/api/auth/google-login", { token });
  return res.data;
};

export const logoutApi = async () => {
  const res = await axiosInstance.post("/api/auth/logout");
  return res.data;
};