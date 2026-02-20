import axiosInstance from "@/lib/axios";

// --------------------------------------
// DONE (2). TESTED (2/8) REMAINING (6), TOTAL (8)
// --------------------------------------


// 1. ✅ Done / Tested
export const getMessagesApi = (receiverId: string) => {
    const res = axiosInstance.get(`/messages/get-messages/${receiverId}`);
    console.log(res);
    return res;
};


// 2. ✅ Done / Tested
export const sendMessageApi = (formData: FormData) => {
    const res = axiosInstance.post("/messages/send-message", formData);
    return  res;
};


// 3. ✅ Done / 
export const editMessageApi = (messageId: string, newText: string, receiverId: string) => {
    return axiosInstance.patch(`/messages/edit-message/${messageId}`, { content: newText, receiverId });
};


export const deleteMessageApi = (messageId: string, receiverId: string, deleteForEveryone: boolean) => {
    return axiosInstance.delete("/messages/delete", { data: { messageId, receiverId, deleteForEveryone } });
};


export const clearChatApi = (userId: string) => {
    return axiosInstance.delete("/messages/clear-chat", { data: { userId } });
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


export const markAsSeenApi = (messageIds: string) => {
    return axiosInstance.post("/messages/mark-as-seen", { messageIds });
};

