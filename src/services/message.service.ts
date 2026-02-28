import axiosInstance from "@/lib/axios";

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
export const sendMessageApi = (formData: FormData) => {
    const res = axiosInstance.post("/messages/send-message", formData);
    return  res;
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

