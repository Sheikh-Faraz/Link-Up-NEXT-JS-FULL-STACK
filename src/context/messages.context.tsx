"use client";

import toast from "react-hot-toast";
import { createContext, useContext, useState } from "react";

// For realtime functionality
import Pusher from "pusher-js";
import { useEffect, useRef } from "react";
import { useUser } from "./user.context"; // 👈 IMPORTANT (selectedUser)

// APIs
import { 
  clearChatApi, 
  deleteMessageApi, 
  editMessageApi, 
  getMessagesApi, 
  sendMessageApi,
  
  
  markMessagesAsSeenApi, 
  forwardMessageApi, 
  reactToMessageApi, 
} from "@/services/message.service";

// Interface for User type (you can expand this in user.types.ts)
import type { ReplyToMessage, Message } from "@/types/message.type";

// Utility to extract error messages
import { getErrorMessage, } from "@/lib/error";

// authUser from Auth Context
import { useAuth } from "./auth.context";


interface messageContextType {
    messages: Message[];
    isMessagesLoading: boolean;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (
      receiverId: string,
      text: string,
      replyTo?: ReplyToMessage,
      files?: File[],
    ) => Promise<void>;

    editMessage: (messageId: string, newText: string, receiverId: string) => Promise<void>;
    forwardMessage: (messageId: string, receiverId: string) => Promise<void>;
    deleteMessage: (messageId: string, receiverId: string, forEveryone?: boolean) => Promise<void>;
    reactToMessage: (messageId: string, emoji: string) => Promise<void>;
    clearChat: (userId: string) => Promise<void>;
    
    markMessagesAsSeen: (userId: string) => Promise<void>;
    // markAsSeen: (receiverId: string) => Promise<void>;
}
    
const messageContext = createContext<messageContextType | undefined>(undefined);    

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  // Importing authUser from Auth Context to use in markAsSeen function
  const { authUser } = useAuth();
  
  // Importing selectedUser from User Context for realtime feature
  const { 
    selectedUser, 
    users, 

    updateUserLastMessage, 
    updateSidebarAfterDelete, 
    updateSidebarLastMessageSeen, 

  } = useUser();
  
  
  const selectedUserRef = useRef(selectedUser);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);


  // FOR PUSHER AND REALTIME MESSAGES
  useEffect(() => {
  if (!authUser || users.length === 0) return;

  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });

  const channels: Pusher.Channel[] = [];

  users.forEach((user) => {
    const chatId =
      authUser._id < user._id
        ? `${authUser._id}-${user._id}`
        : `${user._id}-${authUser._id}`;

    const channel = pusher.subscribe(`chat-${chatId}`);

    channels.push(channel);

    channel.bind("new-message", (newMessage: Message) => {
      // ==========================================================
      // UPDATE SIDEBAR
      // ==========================================================

      const otherUserId =
        newMessage.senderId === authUser._id
          ? newMessage.receiverId
          : newMessage.senderId;

      updateUserLastMessage(otherUserId, {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        text: newMessage.text,
        fileType: newMessage.fileType,
        attachments: newMessage.attachments?.map((attachment) => ({
          fileName: attachment.fileName,
          fileType: attachment.fileType,
        })),
        createdAt: newMessage.createdAt,
        seenBy: newMessage.seenBy?.map(String) ?? [],
      });

      // ==========================================================
      // UPDATE CURRENT CHAT
      // ==========================================================

      const currentSelectedUser = selectedUserRef.current;

      const isIncomingMessage =
        String(newMessage.receiverId) === String(authUser._id);

      const isCurrentConversationOpen =
        String(currentSelectedUser?._id) === String(newMessage.senderId);

      if (isIncomingMessage && isCurrentConversationOpen) {
        void markMessagesAsSeen(newMessage.senderId);
      }


      if (
        currentSelectedUser?._id === newMessage.senderId ||
        currentSelectedUser?._id === newMessage.receiverId
      ) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === newMessage._id)) {
            return prev;
          }

          return [...prev, newMessage];
        });
      }
    });


    // Pusher bind for realtime message read
    channel.bind(
      "messages-seen",
      (data: {
        readerId: string;
        messageSenderId: string;
      }) => {
        // Only the original sender needs to update their sent messages.
        if (String(authUser._id) !== data.messageSenderId) {
          return;
        }

        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            // Update only messages sent by the current user
            // to the person who just read them.
            const isMessageFromMe =
              String(msg.senderId) === String(authUser._id);

            const isMessageToReader =
              String(msg.receiverId) === data.readerId;

            if (!isMessageFromMe || !isMessageToReader) {
              return msg;
            }

            return {
              ...msg,
              seenBy: Array.from(
                new Set([
                  ...(msg.seenBy || []).map(String),
                  data.readerId,
                ])
              ),
            };
          })
        );
      }
    );


    // Pusher bind for realtime message read to update sidebar
    channel.bind(
      "messages-seen",
      (data: { readerId: string; messageSenderId: string }) => {
        // This sidebar update is relevant to the sender's browser.
        if (String(authUser?._id) !== String(data.messageSenderId)) return;

        // Update the contact's latest-message receipt in the sidebar.
        updateSidebarLastMessageSeen(
          data.readerId,
          data.messageSenderId
        );
      }
    );

  });

  return () => {
    channels.forEach((channel) => {
      channel.unbind_all();
      channel.unsubscribe();
    });

    pusher.disconnect();
  };
}, [authUser, users]);



//  For Getting Messages
    const getMessages = async (receiverId: string) => {
        
    try {

        setIsMessagesLoading(true);
        const res = await getMessagesApi(receiverId);
        setMessages(res.data);  

    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load messages"));

    } finally {
      setIsMessagesLoading(false);
    }
  };


// For Sending Messages
const sendMessage = async (
  receiverId: string,
  text: string,
  replyTo?: ReplyToMessage,
  files?: File[]
) => {
  if (!text.trim() && (!files || files.length === 0)) return;

  try {
    let attachments: any = [];

    if (files && files.length > 0) {
      const { uploadToCloudinary } = await import(
        "@/lib/upload-to-cloudinary"
      );

      attachments = await Promise.all(
        files.map((file) => uploadToCloudinary(file))
      );
    }

    const payload = {
      receiverId,
      text,
      replyTo,
      attachments,
    };

    const { data } = await sendMessageApi(payload);

    const newMessage = data.sendedMessage;

    setMessages((prev) => {
      if (prev.some((m) => m._id === newMessage._id)) {
        return prev;
      }

      return [...prev, newMessage];
    });


    // Move the user messaged to the top of the list
    updateUserLastMessage(receiverId, newMessage);

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


  // For marking messages as seen
  const markMessagesAsSeen = async (userId: string) => {
    if (!authUser?._id || !userId) return;

    try {
      await markMessagesAsSeenApi(userId);

      // Update local messages after the API succeeds.
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          const isFromSelectedUser =
            String(msg.senderId) === String(userId);

          const isToCurrentUser =
            String(msg.receiverId) === String(authUser._id);

          if (!isFromSelectedUser || !isToCurrentUser) {
            return msg;
          }

          return {
            ...msg,
            seenBy: Array.from(
              new Set([
                ...(msg.seenBy ?? []).map(String),
                String(authUser._id),
              ])
            ),
          };
        })
      );
  } catch (err) {
      console.error("Failed to mark messages as seen:", err);
  }};




  // For marking messages as seen 
  // const markMessagesAsSeen = async (userId: string) => {
  //   try {
  //     await markMessagesAsSeenApi(userId);

  //     // Update local messages state so the UI reflects the seen status.
  //     setMessages((prevMessages) =>
  //       prevMessages.map((msg) => {
  //         // Only update messages received from the selected user.
  //         if (String(msg.senderId) === String(userId)) {
  //           return {
  //             ...msg,
  //             seenBy: Array.from(
  //               new Set([
  //                 ...(msg.seenBy || []).map(String),
  //                 String(authUser?._id),
  //               ])
  //             ),
  //           };
  //         }

  //         return msg;
  //       })
  //     );
  //   } catch (err) {
  //     console.error("Failed to mark messages as seen:", err);
  //   }
  // };



// For Deleting Message
const deleteMessage = async (
  messageId: string,
  receiverId: string,
  deleteForEveryone = false
) => {
  try {
    const res = await deleteMessageApi(
      messageId,
      receiverId,
      deleteForEveryone
    );

    // ==========================================================
    // DELETE FOR EVERYONE
    // ==========================================================

    if (deleteForEveryone) {
      setMessages((prev) => {
        const updatedMessages = prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                text: "🛇 This message was deleted",

                fileUrl: undefined,
                fileType: undefined,
                filePublicId: undefined,
                fileResourceType: undefined,
                fileSize: undefined,

                attachments: [],

                replyTo: undefined,
              }
            : m
        );

        const deletedMessage = updatedMessages.find(
          (m) => m._id === messageId
        );

        updateSidebarAfterDelete(
          receiverId,
          updatedMessages,
          deletedMessage
        );

        return updatedMessages;
      });

      toast.success("Deleted for everyone");

      return;
    }

    // ==========================================================
    // DELETE FOR ME
    // ==========================================================

    setMessages((prev) => {
      const updatedMessages = prev.filter(
        (m) => m._id !== messageId
      );

      updateSidebarAfterDelete(
        receiverId,
        updatedMessages
      );

      return updatedMessages;
    });

    if (res.data.permanentlyDeleted) {
      toast.success("Message permanently deleted");
    } else {
      toast.success("Deleted for you");
    }

  } catch (err) {
    toast.error(
      getErrorMessage(err, "Failed to delete message")
    );
  }
};


// const deleteMessage = async (messageId: string, receiverId: string, deleteForEveryone = false) => {

//     try {
//       await deleteMessageApi(messageId, receiverId, deleteForEveryone);

//       if (deleteForEveryone) {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m._id === messageId ? { 
//               ...m, text: "🛇 This message was deleted",
//                fileUrl: undefined, 
//                fileType: undefined, 
//                fileName: undefined, 
//                replyTo: undefined, 
//               } : m
//           )
//         );
//       } else {
//         setMessages((prev) => prev.filter((m) => m._id !== messageId));
//       }

//       toast.success(deleteForEveryone ? "Deleted for everyone" : "Deleted for you");
      
//     } catch (err) {
//         toast.error(getErrorMessage(err, "Failed to delete message"));

//     }
//   };


// For Clearing Chat
const clearChat = async (userId: string) => {  
 
  try {
    const res = await clearChatApi(userId);

    setMessages([]);

    toast.success(res.data.message || "Chat cleared successfully");

  } catch (err) {
    toast.error(getErrorMessage(err, "Failed to clear chat"));
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
  // const markAsSeen = async ( receiverId: string ) => {  

  //   try {
  //     await markAsSeenApi(receiverId);

  //     if(!authUser) return;
  //     setMessages(prev =>
  //       prev.map(m => {
            
  //         // ensure seenBy is an array and userId is added only once
  //         const seenBy = m.seenBy ?? [];
  //         // if (seenBy.includes(userId)) return m;
  //         if (seenBy.includes(authUser?._id)) return m;

  //         return { ...m, seenBy: [...seenBy, authUser?._id] };
  //       })
  //     );
    
  //   } catch (err) {
  //       toast.error(getErrorMessage(err, "Failed to mark message as seen"));

  //   }
  // };



  return (
    <messageContext.Provider value={{ 
        messages,
        isMessagesLoading,

        getMessages,
        sendMessage,
        editMessage,
        deleteMessage,
        clearChat,
        

        forwardMessage,
        reactToMessage,

        // markAsSeen,
        markMessagesAsSeen,
        

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
