import axiosInstance from "@/lib/axios";


// --------------------------------------
// DONE (3). REMAINING (1), TOTAL (4)
// --------------------------------------


// ✅ Done / Tested 
export const checkAuthApi = async () => {
  const res = await axiosInstance.get("/auth/check-auth");
  return res;
};

// ✅ Done / Tested 
export const loginApi = async (data: unknown) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res;
};

// ✅ Done/ --
export const signupApi = async (data: unknown) => {
  const res = await axiosInstance.post("/auth/signup", data);
  return res;
};

export const googleLoginApi = async (token: string) => {
  const res = await axiosInstance.post("/auth/google-login", { token });
  return res;
};

// Apprently Don't Need A Backend-Api for Logout Only Need it If Moven Backend Https Baseed Cookies
