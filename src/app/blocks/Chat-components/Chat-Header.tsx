import { useState } from "react";

// Contexts
import { useUser } from "@/context/user.context";
import { useMessages } from "@/context/messages.context";
import { useUI } from "@/context/ui.context";
import { useAuth } from "@/context/auth.context";

// Images
import avatar from '@/app/images/avatarpic.png'

// UI Blocks
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Custom Block
import ProfileSidebar from "../Profile-Info-Sidebar";

// Icons
import { 
  MoreVertical, 
  ArrowLeft, 
  // Video, 
  // Phone, 
} from "lucide-react"


export default function ChatHeader() {

  // Contexts
  const { authUser } = useAuth();
  const { clearChat } = useMessages();
  const { chatOpen } = useUI();
  const { selectUser, selectedUser, blockUser, unblockUser, deleteUser} = useUser();
  
  // const {  onlineUsers,  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; 

  const UserPic = selectedUser?.profilePic;

  const imageUrl = UserPic?.startsWith("http")
  ? UserPic
  : `${BASE_URL}${UserPic}`;

  return (
    <div className="flex items-center justify-between p-4 w-full">  
      
      {/* Left - Avatar + Info */}
      <div className="flex items-center space-x-3">

      <button
          onClick={() => {
            chatOpen(false);
            selectUser(null);
          }}
          className="lg:hidden text-sm p-1 text-gray-400 border rounded-md hover:bg-muted"
      >
            <ArrowLeft className="size-5 max-[425px]:size-4" />
      </button>

        <img 
          src={selectedUser?.profilePic === "" ? avatar.src : imageUrl} 
          // src={selectedUser?.profilePic || avatar.src} 
          alt={selectedUser?.fullName || "User Image"} 
          className="w-10 h-10 rounded-full" 
        />
        <div>
          <h3 className="font-semibold">{selectedUser?.fullName || "User Name"}</h3>
          {/* <p>There was online user comp here</p> */}
          {/* <p className={`text-sm ${onlineUsers.includes(selectedUser?._id || "") ? "text-green-600" : "text-red-600"}`}>
            {onlineUsers.includes(selectedUser?._id || "") ? "Online" : "Offline"}
          </p> */}
          {/* <p className="text-sm">
            last Seen 2:03 pm
          </p> */}
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center space-x-3 mr-2">
        {/* <button className="p-2 rounded-full hover:bg-gray-100">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Phone className="w-5 h-5" />
        </button> */}

        <div className="p-2 rounded-full hover:bg-muted">
          <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-6 w-6 p-0 cursor-pointer">
                           <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>

                      {/* <DropdownMenuContent className="w-full mr-10 border border-red-600" sideOffset={10} align="start"> */}
                      <DropdownMenuContent className="min-w-35 mr-5" sideOffset={10}>
                                      <DropdownMenuItem
                                        className="cursor-pointer my-2"
                                        onClick={() => setIsSidebarOpen(true)}
                                      >
                                        View Profile
                                      </DropdownMenuItem>
                                      
                                      <DropdownMenuItem
                                        className="cursor-pointer my-2"
                                        onClick={() => clearChat(selectedUser?._id || "")}
                                      >
                                        Clear Chat
                                      </DropdownMenuItem>

                                        {/* ================================================================= */}
                                                                                        
                                        {authUser?.blockedUsers?.includes(selectedUser?._id || "") ? 
                                          (
                                            <DropdownMenuItem
                                            onClick={() => unblockUser(selectedUser?._id || "")}
                                            className="cursor-pointer focus:bg-muted"
                                          >
                                            <button
                                              className="cursor-pointer focus:bg-muted"
                                            >
                                              Unblock 
                                            </button>
                                          </DropdownMenuItem>
                                      
                                          )
                                        : selectedUser?.blockedUsers?.includes(authUser?._id || "") ? (null) 
                                        : ( 
                                                                                        
                                        <DropdownMenuItem
                                          onClick={() => blockUser(selectedUser?._id || "")}
                                          className="cursor-pointer focus:bg-muted"
                                        >
                                          <button
                                            className="cursor-pointer focus:bg-muted text-red-400 "
                                          >
                                            Block 
                                          </button>
                                         </DropdownMenuItem>
                                                                                        
                                        )}

                                        {/* ================================================================= */}
                                      
                                      <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer my-2"
                                        onClick={() => deleteUser(selectedUser?._id || "")}
                                      >
                                        Delete 
                                      </DropdownMenuItem>
                      </DropdownMenuContent>
          </DropdownMenu>

          {selectedUser && (
              <ProfileSidebar
                open={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
                user={selectedUser}
              />
          )}

        {/* </button> */}
        </div>
      </div>
    </div>
  )
}
