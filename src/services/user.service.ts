import axiosInstance from "@/lib/axios";

// --------------------------------------
// DONE (9). REMAINING (0), TOTAL (9)
// --------------------------------------


// ✅ Done / Tested 
export const getUsersApi = async () => {
  const res = await axiosInstance.get("/user/get-users");
  return res;
};


// ✅ Done / Tested
export const addContactApi = async (UserId: string) => {
  const res = await axiosInstance.post("/user/add-contact",{ targetUserId: UserId });
  return res;
};


// ✅ Done / Tested
export const blockUserApi = async (userId: string) => {
  const res = await axiosInstance.patch(`/user/block-user/${userId}`);
  return res;
};


// ✅ Done / Tested
export const unblockUserApi = async (userId: string) => {
  const res = await axiosInstance.patch(`/user/unblock-user/${userId}`);
  return res;
}


// ✅ Done /  
export const deleteUserApi = async (userId: string) => {
  const res = await axiosInstance.delete(`/user/delete/${userId}`);
  return res;
};


// ✅ Done /  
export const getHiddenUsersApi = async () => {
  const res = await axiosInstance.get("/user/hidden-users");
  return res;
};


// ✅ Done /  
export const restoreUserApi = async (userId: string) => {
  const res = await axiosInstance.post(`/user/restore-user/${userId}`);
  return res;
};


// ✅ Done /  
export const fetchUserInfoApi = async () => {
  const res = await axiosInstance.get("/user/get-user-info");
  return res;
};


// ✅ Done /  
export const updateUserProfileApi = async (formData: FormData) => {
  const res = await axiosInstance.put(
    "/auth/update-profile",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data;
};

// export const updateUserProfileApi = async (data: unknown) => {
//   const res = await axiosInstance.put("/user/update-profile", data);
//   return res;
// };
