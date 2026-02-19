"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatContainer from "@/app/blocks/ChatContainer";
import NoChatSelected from "@/app/blocks/NoChatSelected";
import { useEffect } from "react";

// Contexts
import { useGlobalLoading } from "@/context/loading.context";

import { useUser } from "@/context/user.context";
import { useAuth } from "@/context/auth.context";
import { useUI } from "@/context/ui.context";

export default function Home() {

  // Contexts
  const { previewSidebar, isChatOpen, chatOpen } = useUI();
  const { selectedUser } = useUser();
  const { authUser, checkAuth } = useAuth();


  const { setIsLoading } = useGlobalLoading();

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  // useEffect(() => {
  //   checkAuth();
  // }, [authUser, checkAuth]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Open chat when user is selected
  useEffect(() => {
    if (selectedUser) {
      chatOpen(true)
      previewSidebar(true);
    };
  }, [selectedUser]);

  return (
    <div className="flex bg-linear-to-r from-gray-100 to-gray-100 w-full">
      <SidebarProvider>
        {/* Sidebar */}
    
        <div className={`w-full my-4 lg:w-fit ${isChatOpen ? "hidden lg:block" : "block"}`}>
          <AppSidebar />
        </div>

        {/* Chat Area */}
        <div className={`my-4 mx-2 flex-1 overflow-hidden ${!isChatOpen ? "hidden md:block" : "block"}`}>
          <div className="h-full ">
            {/* Chat content */}
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
