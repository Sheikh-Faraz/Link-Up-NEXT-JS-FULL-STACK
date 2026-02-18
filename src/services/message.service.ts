import axiosInstance from "@/lib/axios";
import { ReplyToMessage } from "@/types/message.type";

export const getMessagesApi = (userId: string) => {
    return axiosInstance.get(`/messages/${userId}`);
};

export const sendMessageApi = (formData: FormData) => {

    // if (replyTo) formData.append("replyTo", JSON.stringify(replyTo));
    // if (file) formData.append("file", file);

    // Stating a dummy api for now
    return axiosInstance.put("/messages/sendMessage", formData);
    // return axiosInstance.post("/messages/send", formData, {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //     },
    // });
};

export const editMessageApi = (messageId: string, newText: string, receiverId: string) => {
    return axiosInstance.put("/messages/edit", { messageId, newText, receiverId });
};

export const deleteMessageApi = (messageId: string, receiverId: string, deleteForEveryone: boolean) => {
    return axiosInstance.delete("/messages/delete", { data: { messageId, receiverId, deleteForEveryone } });
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

export const clearChatApi = (userId: string) => {
    return axiosInstance.delete("/messages/clear-chat", { data: { userId } });
};