import axiosInstance from "@/lib/axios";
import type { ReplyToMessage } from "@/types/message.type";


// --------------------------------------
// DONE (4). TESTED (4/8) REMAINING (4), TOTAL (8)
// --------------------------------------


// 1. ✅ Done / Tested
export const getMessagesApi = (receiverId: string) => {
    const res = axiosInstance.get(`/messages/get-messages/${receiverId}`);
    console.log(res);
    return res;
};


// 2. ✅ Done / Tested
export const sendMessageApi = (
data: {
  receiverId: string;
  text: string;
  replyTo?: ReplyToMessage;
  attachments: any[];
}) => {
  return axiosInstance.post("/messages/send-message", data);
};


// 3. ✅ Done /  Tested
export const editMessageApi = (messageId: string, newText: string, receiverId: string) => {
    return axiosInstance.patch(`/messages/edit-message/${messageId}`, { content: newText, receiverId });
};


// 4. ✅ Done /  Tested
export const deleteMessageApi = (messageId: string, receiverId: string, deleteForEveryone: boolean) => {
    return axiosInstance.delete(`/messages/delete-message/${messageId}`, { data: { receiverId, deleteForEveryone } });
};


// 5. ✅ Done /  Tested
export const clearChatApi = (userId: string) => {
    return axiosInstance.delete(`/messages/clear-chat/${userId}`);
};


// 6. ✅ Done /  Tested
export const markMessagesAsSeenApi = (userId: string) => {
    return axiosInstance.patch(`/messages/seen/${userId}`);
};


// 7. ✅ Done /  Tested
export const forwardMessageApi = (
  messageId: string,
  receiverIds: string[]
) => {
  return axiosInstance.post("/messages/forward", {
    messageId,
    receiverIds,
  });
};


// 8. ✅ Done /  Tested
export const getForwardHistoryApi = (messageId: string) => {
  return axiosInstance.get(`/messages/forward-history/${messageId}`);
};


export const reactToMessageApi = (messageId: string, reaction: string) => {
    return axiosInstance.post("/messages/react", { messageId, reaction });
};

