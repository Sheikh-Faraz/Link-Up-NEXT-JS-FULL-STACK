"use client"

import { useEffect } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";

import RestoreSidebar  from "@/app/blocks/Restore-Chat-components/Restore-Chat-Sidebar";
import RestoreChatContainer from "@/app/blocks/Restore-Chat-components/Restore-Chat-Container";
import NoChatSelected from '@/app/blocks/NoChatSelected copy';

// Contexts
import { useUser } from "@/context/user.context";
import { useUI } from "@/context/ui.context";
import { useGlobalLoading } from "@/context/loading.context";


export default function RestoreContactPage () {

  // Contexts
  const { selectedUser } = useUser();
  const { previewSidebar, isChatOpen, chatOpen } = useUI();
  const { setIsLoading } = useGlobalLoading();

  // Open chat when user is selected
  useEffect(() => {
    if (selectedUser) { 
      chatOpen(true)
      previewSidebar(true);
    };
  }, [selectedUser]);
        
  useEffect(() =>{
    setIsLoading(false);
  }, [])
  // }, [setIsLoading])
  
    return (
        <div className="flex bg-[hsl(60_4.8%_95.9%)] w-full overflow-hidden">
                
                <SidebarProvider>

                  <div className={`w-full my-4 lg:w-fit ${isChatOpen ? "hidden lg:block" : "block"}`}>
                    <RestoreSidebar />
                  </div>


                  {/* Chat Area */}
                          <div className={`flex-1 my-4 mx-2 w-full overflow-hidden ${!isChatOpen ? "hidden md:block" : "block"}`}>
                            
                            <div className="h-full relative">
                  
                              {/* Chat content */}
                              {!selectedUser ? <NoChatSelected /> : <RestoreChatContainer />}
                            </div>

                          </div>
                </SidebarProvider>
        </div>
    )
}