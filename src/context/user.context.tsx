"use client";

import toast from "react-hot-toast";
import { createContext, useContext, useState } from "react";

// APIs
import { 
  
  addContactApi, 
  getUsersApi, 
  blockUserApi, 
  unblockUserApi, 
  deleteUserApi, 
  updateUserProfileApi, 
  fetchUserInfoApi, 
  restoreUserApi, 
  getHiddenUsersApi,  

} from "@/services/user.service";

// Interface for User type
import { Message, LastMessage } from "@/types/message.type";
import { User } from "@/types/user.types";
// import { User, LastMessage } from "@/types/user.types";

// Utility to extract error messages
import { getErrorMessage } from "@/lib/error";

// authUser from Auth Context
import { useAuth } from "./auth.context";

// For realtime functionality
import Pusher from "pusher-js";
import { useEffect } from "react";


interface userContextType {

    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
    
    updateUserLastMessage: (
      userId: string,
      lastMessage: User["lastMessage"] | null
    ) => void;

    updateSidebarLastMessageSeen: (
      readerId: string,
      messageSenderId: string
    ) => void;

    updateSidebarAfterDelete: (
      userId: string,
      remainingMessages: Message[],
      deletedMessage?: Message
    ) => void;

    users: User[];

    setUsers : (users: User[]) => void;  

    isUsersLoading: boolean;
    
    fetchUser: () => Promise<void>;                            

    updateUserProfile: (formData: FormData) => Promise<void>;
    selectUser: (user: User | null) => void;                    
    getUsers: () => Promise<void>;                              
    addContact: (UserId: string) => Promise<void>;              
    blockUser: (userId: string) => Promise<void>;               
    unblockUser: (userId: string) => Promise<void>;             
    deleteUser: (userId: string) => Promise<void>;              
    getHiddenOrBlockedUsers: () => Promise<void>;               
    restoreUser: (userId: string) => Promise<void>;             

}

const userContext = createContext<userContextType | undefined>(undefined);    

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Importing and authUser from Auth Context to use in function
  const { authUser, setAuthUser } = useAuth();


  // FOR REALTIME
  useEffect(() => {
  if (!authUser?._id) return;

  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });

  const channel = pusher.subscribe(`user-${authUser._id}`);

  // 🔴 BLOCK EVENT
  channel.bind("user-blocked", (data: unknown) => {
    const { blockedBy, targetUserId } = data as { blockedBy: string; targetUserId: string };

    // If I blocked someone
    if (blockedBy === authUser._id) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUserId ? { ...u, isBlocked: true } : u
        )
      );
    }

    // if (blockedBy === authUser._id) {
    //   setAuthUser({
    //     ...authUser,
    //     blockedUsers: [...(authUser?.blockedUsers || []), targetUserId],
    //   } as User);
    // }

    // If I got blocked
    if (targetUserId === authUser._id) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === blockedBy ? { ...u, hasBlockedMe: true } : u
        )
      );
    }

    // if (targetUserId === authUser._id) {
    //   setUsers((prev) =>
    //     prev.map((u) =>
    //       u._id === blockedBy ? { ...u, hasBlockedMe: true } : u
    //     )
    //   );
    // }
  });

  // 🟢 UNBLOCK EVENT
  channel.bind("user-unblocked", (data: unknown) => {
    const { unblockedBy, targetUserId } = data as { unblockedBy: string; targetUserId: string };

    if (unblockedBy === authUser._id) {
      setAuthUser({
        ...authUser,
        blockedUsers: (authUser?.blockedUsers || []).filter(
          (id: string) => id !== targetUserId
        ),
      } as User);
    }

    if (targetUserId === authUser._id) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === unblockedBy ? { ...u, hasBlockedMe: false } : u
        )
      );
    }
  });

  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, [authUser]);



// Move user to the top of list code
const updateUserLastMessage = (
  userId: string,
  lastMessage: User["lastMessage"] | null
) => {
  setUsers((prevUsers) =>
    prevUsers
      .map((user) =>
        user._id === userId
          ? {
              ...user,
              lastMessage,
            }
          : user
      )
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;

        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;

        return bTime - aTime;
      })
  );
};


// Update the seen for lastmessage sidebar
const updateSidebarLastMessageSeen = (
  readerId: string,
  messageSenderId: string
) => {
  setUsers((prevUsers) =>
    prevUsers.map((user) => {
      const lastMessage = user.lastMessage;

      // Only update the sidebar entry for the reader.
      if (String(user._id) !== String(readerId) || !lastMessage) {
        return user;
      }

      // Only update if the latest message is from the current user
      // and was sent to the reader who just read it.
      if (
        String(lastMessage.senderId) !== String(messageSenderId) ||
        String(lastMessage.receiverId) !== String(readerId)
      ) {
        return user;
      }

      return {
        ...user,
        lastMessage: {
          ...lastMessage,
          seenBy: Array.from(
            new Set([
              ...(lastMessage.seenBy ?? []).map(String),
              String(readerId),
            ])
          ),
        },
      };
    })
  );
};



// Update sidebar when a message is deleted
const updateSidebarAfterDelete = (
  userId: string,
  remainingMessages: Message[],
  deletedMessage?: Message
) => {
  let latestMessage: Message | undefined = undefined;

  if (remainingMessages.length > 0) {
    latestMessage = remainingMessages[remainingMessages.length - 1];
  }

  setUsers((prevUsers) =>
    prevUsers
      .map((user) => {
        if (user._id !== userId) {
          return user;
        }

        // A remaining message exists.
        if (latestMessage) {
          const sidebarMessage: LastMessage = {
            _id: latestMessage._id,
            senderId: latestMessage.senderId,
            receiverId: latestMessage.receiverId,
            text: latestMessage.text,
            fileType: latestMessage.fileType,
            attachments: latestMessage.attachments?.map((attachment) => ({
              fileName: attachment.fileName,
              fileType: attachment.fileType,
            })),
            createdAt: latestMessage.createdAt,
            seenBy: latestMessage.seenBy?.map(String) ?? [],
          };

          return {
            ...user,
            lastMessage: sidebarMessage,
          };
        }

        // No messages remain.
        // If a deleted-for-everyone message was supplied,
        // show the deleted placeholder.
        if (deletedMessage) {
          const sidebarMessage: LastMessage = {
            _id: deletedMessage._id,
            senderId: deletedMessage.senderId,
            receiverId: deletedMessage.receiverId,
            text: "🛇 This message was deleted",
            attachments: [],
            createdAt: deletedMessage.createdAt,
          };

          return {
            ...user,
            lastMessage: sidebarMessage,
          };
        }

        // No messages at all.
        return {
          ...user,
          lastMessage: null,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;

        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;

        return bTime - aTime;
      })
  );
};


  //  For Selecting User
  const selectUser = (user: User | null) => {
    setSelectedUser(user);
  };


//   For Fetching/Getting Users
  const getUsers = async () => {
    try {
      setIsUsersLoading(true);

      const res = await getUsersApi();

      setUsers(res.data);

    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load users"));

    } finally {
      setIsUsersLoading(false);
    }
  };

  
//   For Blocking User
  const blockUser = async (userId: string) => {

  try {
    const res = await blockUserApi(userId);

    // ✅ Update local state to reflect blocked user instantly
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, isBlocked: true } : u
      )
    );

    toast.success(res.data.message || "User blocked");

  } catch (err) {
      toast.error(getErrorMessage(err, "Failed to block user"));
  }
};

// For Unblocking User
const unblockUser = async (userId: string) => {

  try {
    const res = await unblockUserApi(userId); 

    toast.success(res.data.message || "User unblocked");

  } catch (err) {
    toast.error(getErrorMessage(err, "Failed to unblock user"));

  }
};


// For Deleting User
const deleteUser = async (userId: string) => {
  try {
    // const data = await deleteUserApi(userId); 
    await deleteUserApi(userId); 

    // ✅ Remove the deleted user from local list
    setUsers(prev => prev.filter(user => user._id !== userId));   

    // If the deleted user is currently selected, clear selection
    if ( selectedUser && selectedUser._id === userId ) {
      setSelectedUser(null);
    }

    toast.success("Contact deleted for you");

  } catch (err) {
    toast.error(getErrorMessage(err, "Failed to delete user"));

  }
};


//   For Adding Contact
    const addContact = async (UserId: string) => {
        
    try {
      setIsUsersLoading(true);

      const res = await addContactApi(UserId);
      
      const newContact = res.data.friend; // your backend should return the added friend object

      // ✅ Append the new contact to the existing users list
      setUsers((prevUsers) => [...prevUsers, newContact]);

      toast.success("Contact added successfully!");

    } catch (err) {

    //   Summarized all the commented to a file and using in other funcs
    //   let message = "Add Contact failed";

    //   if (typeof err === "string") {
    //     message = err;
    //   } else if (err instanceof Error) {
    //     message = err.message;
    //   } else if (err && typeof err === "object" && "response" in err) {
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const axiosErr = err as any;
    //     message = axiosErr?.response?.data?.message || message;
    //   }

        toast.error(getErrorMessage(err, "Add Contact failed"));

    } finally {
      setIsUsersLoading(false);
    }
  };


// Get users for Restore-Sidebar
const getHiddenOrBlockedUsers = async () => {
  try {
    const res = await getHiddenUsersApi();

    // return res.data; // You can store in state if needed
    setUsers(res.data);

  } catch (err) {
        toast.error(getErrorMessage(err, "Failed to fetch hidden users"));
  }
};


// Restoring the deleted-for-me user
const restoreUser = async (userId: string) => {

  try {
    const res = await restoreUserApi(userId);

    if(!(authUser?.blockedUsers?.includes(selectedUser?._id || ""))) {
    // ✅ Remove the user from deleted-for-me list
    setUsers(prev => prev.filter(user => user._id !== userId));   

    // If the deleted user is currently selected, clear selection
    if ( selectedUser && selectedUser._id === userId ) {
      setSelectedUser(null);
    }
  }

    toast.success(res.data.message || "User restored successfully");
    
  } catch (err) {
        toast.error(getErrorMessage(err, "Failed to restore user"));

  }
};

// Fetch user details
const fetchUser = async () => {
  
      try {
        const res = await fetchUserInfoApi(); 

        setAuthUser(res.data);

      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to fetch user info"));
        
      }
    };

// Update User Details
  const updateUserProfile = async (formData: FormData) => {
    try {
      const res = await updateUserProfileApi(formData);

      setAuthUser(res.data);

      toast.success("Profile updated successfully");

    }
    catch (err) {
        toast.error(getErrorMessage(err, "Failed to update profile"));

    }
  };


  return (
    <userContext.Provider value={{ 
        users,
        setSelectedUser,
        setUsers,

        updateUserLastMessage,
        updateSidebarLastMessageSeen,
        updateSidebarAfterDelete,

        isUsersLoading,
        selectedUser,

        fetchUser,
        updateUserProfile,
        selectUser,
        getUsers,
        blockUser,
        unblockUser,
        addContact,
        deleteUser,
        getHiddenOrBlockedUsers,
        restoreUser,
    }}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = (): userContextType => {
  const context = useContext(userContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
