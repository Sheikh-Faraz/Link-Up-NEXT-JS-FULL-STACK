import axios from "axios";

// export const loginApi = async (data: { email: string; password: string }) => {
export const loginApi = async (data: unknown) => {
  const res = await axios.post("/api/auth/login", data);
  return res.data;
};


export const signupApi = async (data: unknown) => {
  const res = await axios.post("/api/auth/signup", data);
  return res.data;
};

