import axiosInstance from "@/lib/axios";


// --------------------------------------
// DONE (4). TESTED (4/4), REMAINING (0), TOTAL (4)
// --------------------------------------


// 1. ✅ Done / Tested 
export const checkAuthApi = async () => {
  const res = await axiosInstance.get("/auth/check-auth");
  return res;
};

// 2. ✅ Done / Tested 
export const loginApi = async (data: unknown) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res;
};

// 3. ✅ Done/ --
export const signupApi = async (data: unknown) => {
  const res = await axiosInstance.post("/auth/signup", data);
  return res;
};

// 4. ✅ Done/ Tested
export const googleLoginApi = async (token: string) => {
  const res = await axiosInstance.post("/auth/google", { token });
  return res;
};

// Apprently Don't Need A Backend-Api for Logout Only Need it If Moven Backend Https Baseed Cookies
