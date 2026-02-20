import axiosInstance from "@/lib/axios";

// --------------------------------------
// DONE (9). TESTED (5/9), REMAINING (0), TOTAL (9)
// --------------------------------------


// 1. ✅ Done / Tested 
export const getUsersApi = async () => {
  const res = await axiosInstance.get("/user/get-users");
  return res;
};


// 2. ✅ Done / Tested
export const addContactApi = async (UserId: string) => {
  const res = await axiosInstance.post("/user/add-contact",{ targetUserId: UserId });
  return res;
};


// 3. ✅ Done / Tested
export const blockUserApi = async (userId: string) => {
  const res = await axiosInstance.patch(`/user/block-user/${userId}`);
  return res;
};


// 4. ✅ Done / Tested
export const unblockUserApi = async (userId: string) => {
  const res = await axiosInstance.patch(`/user/unblock-user/${userId}`);
  return res;
}


// 5. ✅ Done / Tested
export const deleteUserApi = async (userId: string) => {
  const res = await axiosInstance.delete(`/user/delete-user/${userId}`);
  return res;
};


// 6. ✅ Done /  
export const getHiddenUsersApi = async () => {
  const res = await axiosInstance.get("/user/hidden-users");
  return res;
};


// 7. ✅ Done /  
export const restoreUserApi = async (userId: string) => {
  const res = await axiosInstance.post(`/user/restore-user/${userId}`);
  return res;
};


// 8. ✅ Done /  
export const fetchUserInfoApi = async () => {
  const res = await axiosInstance.get("/user/get-user-info");
  return res;
};


// 9. ✅ Done /  
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

