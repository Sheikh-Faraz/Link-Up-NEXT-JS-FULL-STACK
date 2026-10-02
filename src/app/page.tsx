"use client";

import { cn } from "@/lib/utils";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatContainer from "@/app/blocks/Chat-components/ChatContainer";
import NoChatSelected from "@/app/blocks/Skeletons/NoChatSelected";
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
  const { 
    // authUser, 
    checkAuth, 
  } = useAuth();


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
    // <div className={cn("flex bg-sidebar w-full h-screen overflow-hidden items-center justify-center")}>
    <div className={cn("flex w-full h-screen overflow-hidden items-center justify-center")}>

      <SidebarProvider>

        {/* Sidebar */}
        {/* <div className={`w-full lg:w-fit my-0 lg:my-4 ${isChatOpen ? "hidden lg:block" : "block"}`}> */}
        <div className={`w-full lg:w-fit ${isChatOpen ? "hidden lg:block" : "block"}`}>
          <AppSidebar />
        </div>

        {/* Chat Area */}
        {/* <div className={`my-4 mx-2 w-full h-[calc(100vh-2rem)] min-h-0 ${!isChatOpen ? "hidden md:block" : "block"}`}> */}
        <div className={`mx-2 w-full h-[calc(100vh-1px)] min-h-0 ${!isChatOpen ? "hidden md:block" : "block"}`}>
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>

      </SidebarProvider>
      
    </div>
  );
}
