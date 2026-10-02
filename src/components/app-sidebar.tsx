"use client";

import { useState, useEffect } from "react";

// Contexts
import { useAuth } from "@/context/auth.context";
import { useUser } from "@/context/user.context";

// Custom Blocks
import ContactBlock from "@/app/blocks/Contact-block";
import { DialogDemo } from "@/app/blocks/DialogDemo";
import ProfileSidebar from "@/app/blocks/Profile-Info-Sidebar";

// UI Blocks
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu";

// Icons
import { 
  Search, 
  Ellipsis, 
  SquarePlus, 
} from "lucide-react";


// Images
import avatar from "@/app/images/avatarpic.png";



interface User {
  _id: string;
  UserId: string;
  fullName: string;
  profilePic?: string;
  about?: string;
}

export function AppSidebar() {

  // Contexts
  const { selectUser, users, isUsersLoading, getUsers, blockUser, unblockUser, deleteUser } = useUser();
  const { authUser } = useAuth();

  // Base url for images
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; 

  // FOR IMAGES OF USER TO SHOW. A FUNCTION FOR IT 
  const getProfilePic = (pic?: string) => {
  if (!pic || pic.trim() === "") return avatar.src;

  if (pic.startsWith("http") || pic.startsWith("data:")) return pic;

  const cleanPath = pic.startsWith("/") ? pic : `/${pic}`;

  return `${BASE_URL}${cleanPath}`;
  };
  // const getProfilePic = (pic?: string) => {
  // if (!pic) return avatar.src;

  // if (pic.startsWith("http")) return pic;
  // if (pic.startsWith("data:")) return pic;

  // return `${BASE_URL}${pic}`;
  // };

  const [search, setSearch] = useState("");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userForProfile, setUserForProfile] = useState<User | null>(null);

  // ✅ Fetch users on mount
  useEffect(() => {
    getUsers();
  }, []);

  // ✅ Filter users by name
  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sidebar
      collapsible="none"
      className="py-2 bg-card flex flex-col lg:w-[24rem] w-full overflow-y-auto border-r" 
    >
      <SidebarContent className="flex flex-col h-full">

        {/* Added padding on the one below so the contacts will be close to the border */}
        <SidebarGroup className="flex flex-col h-full p-0!"> 

          {/* Header */}
          <div className="flex flex-col space-y-1.5 p-3 py-4 lg:py-3">
            <div className="flex items-center justify-between max-[315px]:flex-col max-[315px]:items-start">
              <h3 className="font-semibold text-2xl">Chats</h3>
              {/* THE COMPONENT USED TO ADD USER BY SOMEONE'S ID */}
              <DialogDemo />
            </div>
          </div>

          {/* Search bar */}
          {/* <div className="flex flex-col space-y-1.5 p-2 mb-4 border border-red-600"> */}
          <div className="flex flex-col space-y-1.5 py-4 px-6 mb-4">
            <div
              tabIndex={0}
              className="flex items-center text-center my-2 p-2 max-[375px]:p-1 rounded-full transition-colors duration-200 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
            >
              <Search className="size-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="ml-2 border-none outline-none focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Users list */}
          <SidebarGroupContent className="flex-1 overflow-y-auto">
            <SidebarMenu>
              {/* Loading state */}
              {isUsersLoading ? (
                <div className="flex justify-center p-34">
                  <Spinner className="size-10"/>
                </div>
              ) : (
                <>
                {/* When filtered users exist */}
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (

                      <div 
                        key={user._id} 
                        onClick={() => selectUser(user)}
                        className="flex justify-between items-center border-b hover:bg-muted cursor-pointer"  
                        // className="relative"
                      >                      
                        <ContactBlock
                          key={user._id}
                          id={user._id || ""}
                          name={user.fullName ?? "Unknown"}
                          profilePic={user.profilePic ?? avatar.src}
                          // onClick={() => selectUser(user)}
                        />
                          <div 
                            // className="absolute top-3 right-3 border border-red-600"
                          >
                                      <DropdownMenu>

                                              <DropdownMenuTrigger asChild>
                                                <Button 
                                                  variant="outline"
                                                  className="rounded-full w-fit mr-6! p-2!"
                                                >
                                                  <Ellipsis className="size-3" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              
                                              <DropdownMenuContent className=" w-fit">
                                                  <DropdownMenuItem
                                                  onClick={() => {
                                                    setIsSidebarOpen(true);
                                                    setUserForProfile(user);
                                                  }}
                                                    className="cursor-pointer focus:bg-gray-200 w-full"
                                                  >
                                                    <button
                                                      className="cursor-pointer focus:bg-gray-200 px-3 py-1"
                                                    >
                                                      View Profile
                                                    </button>
                                                  </DropdownMenuItem>
                                                  
                                                  {/* ================================================================= */}
                                                  
                                                  {authUser?.blockedUsers?.includes(user?._id) ? 
                                                    (
                                                      <DropdownMenuItem
                                                      onClick={() => unblockUser(user._id)}
                                                      className="cursor-pointer focus:bg-gray-200 w-full"
                                                    >
                                                      <button
                                                        className="cursor-pointer focus:bg-gray-200 px-3 py-1"
                                                      >
                                                        Unblock 
                                                      </button>
                                                    </DropdownMenuItem>

                                                    )
                                                  : user?.blockedUsers?.includes(authUser?._id || "") ? (null) 
                                                  : ( 
                                                  
                                                  <DropdownMenuItem
                                                    onClick={() => blockUser(user._id)}
                                                    className="cursor-pointer focus:bg-gray-200 w-full"
                                                  >
                                                    <button
                                                      className="cursor-pointer focus:bg-gray-200 px-3 py-1 text-red-600 "
                                                    >
                                                      Block 
                                                    </button>
                                                  </DropdownMenuItem>
                                                  
                                                  )}
                                                  {/* ================================================================= */}

                                                  <DropdownMenuItem
                                                    onClick={() => deleteUser(user._id)}
                                                    className="cursor-pointer focus:bg-gray-200 w-full"
                                                  >
                                                    <button
                                                      className="cursor-pointer focus:bg-gray-200 px-3 py-1 text-red-600 "
                                                    >
                                                      Delete
                                                    </button>
                                                  </DropdownMenuItem>
                                             </DropdownMenuContent>
                                           </DropdownMenu>
                                   </div>
                      </div>
                    ))
                  ) 

                   : search.trim().length > 0 ? (
                    // 👇 Shown when user types something but no match found
                    <p className="text-center text-gray-500 mt-4">
                      No users found matching <span className="font-semibold">{`"${search}"`}</span>
                    </p>
                    ) : (
                      // 👇 Shown when there are simply no users at all
                    <p className="text-center text-gray-500 mt-4">
                      No users available
                    </p>
                  )
                  
                  }
                </>
              )}

                                {/* Shared Sidebar (Dynamic Data) */}
      {userForProfile && (
        <ProfileSidebar
          open={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          user={userForProfile}
        />
      )}

              {/* When no firends or chats exist */} 
              {users.length < 0 && isUsersLoading && 
              (
                <div className="text-center justify-center py-8 ">
                  <SquarePlus className="m-auto" size={45}/>
                  <p className="mt-6 mb-2">No users currently</p> 
                  <p>Add friends and start chatting!</p> 
                </div>
              )}

            </SidebarMenu>
          </SidebarGroupContent>

        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
