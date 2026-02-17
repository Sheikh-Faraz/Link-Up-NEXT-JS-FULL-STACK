import axiosInstance from "@/lib/axios";

export const addContactApi = async (UserId: string) => {
  const res = await axiosInstance.post("/actions/add-contact",{ targetUserId: UserId });
  return res.data;
};

export const getUsersApi = async () => {
  const res = await axiosInstance.get("/actions/get-users");
  return res.data.users;
};

export const blockUserApi = async (userId: string) => {
  const res = await axiosInstance.post("/actions/block-user", { targetUserId: userId });
  return res.data;
};

export const unblockUserApi = async (userId: string) => {
  const res = await axiosInstance.post("/actions/unblock-user", { targetUserId: userId });
  return res.data;
}

export const deleteUserApi = async (userId: string) => {
  const res = await axiosInstance.delete(`/actions/delete/${userId}`);
  return res.data;
};
