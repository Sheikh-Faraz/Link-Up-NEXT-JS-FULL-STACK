"use client";

import toast from "react-hot-toast";
import { createContext, useContext, useState } from "react";

// APIs
import { getMessagesApi, } from "@/services/message.service";

// Interface for User type (you can expand this in user.types.ts)
import type { Message } from "@/types/message.type";
import type { ReplyToMessage } from "@/types/message.type";

// Utility to extract error messages
import { getErrorMessage } from "@/lib/error";


interface messageContextType {
    messages: Message[];
    isMessagesLoading: boolean;

    getMessages: (userId: string) => Promise<void>;
    sendMessage: (receiverId: string, text: string, replyTo?: ReplyToMessage, file?: File, fileName?: string) => Promise<void>;
    editMessage: (messageId: string, newText: string, receiverId: string) => Promise<void>;
    forwardMessage: (messageId: string, receiverId: string) => Promise<void>;
    deleteMessage: (messageId: string, receiverId: string, forEveryone?: boolean) => Promise<void>;
    reactToMessage: (messageId: string, emoji: string) => Promise<void>;

    cancelReply: () => void;

}
    
const messageContext = createContext<messageContextType | undefined>(undefined);    

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);


//  For Getting Messages
    const getMessages = async (userId: string) => {
        
    try {
        setIsMessagesLoading(true);
        const res = await getMessagesApi(userId);
    
        setMessages(res.data);  

    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load messages"));

    } finally {
      setIsMessagesLoading(false);
    }
  };

// For Sending Messages
  const sendMessage = async (receiverId: string , text: string, replyTo?: ReplyToMessage, file?: File, fileName?: string,) => {

    // prevent empty message with no file
    if (!text.trim() && !file) return;      

    try{

      // ===========================================
      const formData = new FormData();
      formData.append("receiverId", receiverId);
      formData.append("text", text);
      formData.append("fileName", fileName || "");

      // ✅ Fix: Convert object to string before appending
      if (replyTo) formData.append("replyTo", JSON.stringify(replyTo));

      if (file) formData.append("file", file);
      // ===========================================

    const res = await sendMessageApi(formData);

    // 3️⃣ Update local state immediately (optimistic UI)
    const newMessage = res.data.sendedMessage; // your backend should return the message

    // // ✅ Append the new message to the existing messages
    setMessages((prev) => [...prev, newMessage]);
      
    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to send message"));

    }
  };


// For Editing Messages
const editMessage = async (messageId: string, newText: string, receiverId: string) => {

    try {
      const res = await editMessageApi(messageId, newText, receiverId);

      const updatedMessage = res.data;

      // Update in local state
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
      );
      toast.success("Message edited");

    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to edit message"));
    }
  };


// For Deleting Message
const deleteMessage = async (messageId: string, receiverId: string, deleteForEveryone = false) => {

    try {
      await deleteMessageApi(messageId, receiverId, deleteForEveryone);

      if (deleteForEveryone) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { 
              ...m, text: "🛇 This message was deleted",
               fileUrl: undefined, 
               fileType: undefined, 
               fileName: undefined, 
               replyTo: undefined, 
              } : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }

      toast.success(deleteForEveryone ? "Deleted for everyone" : "Deleted for you");
      
    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to delete message"));

    }
  };


// For Forwarding Messages
const forwardMessage = async (messageId: string, receiverId: string) => {

    try {
      const res = await forwardMessageApi(messageId, receiverId);

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      toast.success("Message forwarded");
      
    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to forward message"));

    }
  };


// For reacting to Messages
 const reactToMessage = async (messageId: string, emoji: string) => {  
 
    try {
      const res = await reactToMessageApi(messageId, emoji);

      const updatedMessage = res.data;
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
      );

    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to react to message"));

    }
  };


// For Mark As Seen 
  const markAsSeen = async ( receiverId: string ) => {  

    try {
      await markAsSeenApi(receiverId);

      if(!authUser) return;
      setMessages(prev =>
        prev.map(m => {
            
          // ensure seenBy is an array and userId is added only once
          const seenBy = m.seenBy ?? [];
          // if (seenBy.includes(userId)) return m;
          if (seenBy.includes(authUser?._id)) return m;

          return { ...m, seenBy: [...seenBy, authUser?._id] };
        })
      );
    
    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to mark message as seen"));

    }
  };


  return (
    <messageContext.Provider value={{ 
        messages,
        isMessagesLoading,

        getMessages,
        sendMessage,
        editMessage,
        forwardMessage,
        deleteMessage,
        reactToMessage,
        cancelReply
    }}>
      {children}
    </messageContext.Provider>
  );
};

export const useMessages = (): messageContextType => {
  const context = useContext(messageContext);

  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }

  return context;
};
