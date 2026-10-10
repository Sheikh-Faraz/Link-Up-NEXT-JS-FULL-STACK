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
// export const sendMessageApi = (formData: FormData) => {
//     const res = axiosInstance.post("/messages/send-message", formData);
//     return  res;
// };


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


export const forwardMessageApi = (receiverId: string, messageId: string) => {

    const formData = new FormData();
    formData.append("receiverId", receiverId);
    formData.append("messageId", messageId);
    // formData.append("fileName", fileName || "");

    // if (file) formData.append("file", file);

    return axiosInstance.post("/messages/forward", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};


export const reactToMessageApi = (messageId: string, reaction: string) => {
    return axiosInstance.post("/messages/react", { messageId, reaction });
};

