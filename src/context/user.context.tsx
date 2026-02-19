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

// Interface for User type (you can expand this in user.types.ts)
import type { User } from "@/types/user.types";

// Utility to extract error messages
import { getErrorMessage } from "@/lib/error";

// authUser from Auth Context
import { useAuth } from "./auth.context";


interface userContextType {

    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
    users: User[];
    isUsersLoading: boolean;
    
    fetchUser: () => Promise<void>;                      // DONE

    updateUserProfile: (formData: FormData) => Promise<void>;
    // updateUserProfile: (data: unknown) => Promise<void>; // DONE
    selectUser: (user: User | null) => void;             // DONE
    getUsers: () => Promise<void>;                       // DONE
    addContact: (UserId: string) => Promise<void>;       // DONE
    blockUser: (userId: string) => Promise<void>;        // DONE
    unblockUser: (userId: string) => Promise<void>;      // DONE
    deleteUser: (userId: string) => Promise<void>;       // DONE
    getHiddenOrBlockedUsers: () => Promise<void>;        // DONE
    restoreUser: (userId: string) => Promise<void>;      // DONE

}

const userContext = createContext<userContextType | undefined>(undefined);    

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Importing and authUser from Auth Context to use in function
  const { authUser, setAuthUser } = useAuth();


//   For Selecting User
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
