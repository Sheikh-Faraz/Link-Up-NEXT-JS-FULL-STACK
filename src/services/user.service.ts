import axiosInstance from "@/lib/axios";

export const getUsersApi = async () => {
  const res = await axiosInstance.get("/user/get-users");
  return res;
};

export const addContactApi = async (UserId: string) => {
  const res = await axiosInstance.post("/user/add-contact",{ targetUserId: UserId });
  return res;
};

export const blockUserApi = async (userId: string) => {
  const res = await axiosInstance.post("/user/block-user", { targetUserId: userId });
  return res;
};

export const unblockUserApi = async (userId: string) => {
  const res = await axiosInstance.post("/user/unblock-user", { targetUserId: userId });
  return res;
}

export const deleteUserApi = async (userId: string) => {
  const res = await axiosInstance.delete(`/user/delete/${userId}`);
  return res;
};

export const getHiddenUsersApi = async () => {
  const res = await axiosInstance.get("/user/hidden-users");
  return res;
};

export const restoreUserApi = async (userId: string) => {
  const res = await axiosInstance.post("/user/restore-user", { targetUserId: userId });
  return res;
};

export const fetchUserInfoApi = async () => {
  const res = await axiosInstance.get("/user/get-user-info");
  return res;
};

export const updateUserProfileApi = async (data: unknown) => {
  const res = await axiosInstance.put("/user/update-profile", data);
  return res;
};
