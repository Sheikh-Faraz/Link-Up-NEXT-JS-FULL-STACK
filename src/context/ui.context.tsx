"use client";

import { createContext, useContext, useState } from "react";

// Interface for the message object when selecting a message to reply to
import { ReplyToMessage } from "@/types/message.type";


interface UIContextType {

    replyingTo: ReplyToMessage | null; // for replying to messages
    isPreviewing: boolean;
    hsToggle: boolean;
    isChatOpen: boolean;

    previewingToggle: (value: boolean) => void;
    previewSidebar: (value: boolean) => void;
    selectReply: (messsage: ReplyToMessage ) => void;
    cancelReply: () => void;
    chatOpen: (value: boolean) => void;


}

const UIContext = createContext<UIContextType | undefined>(undefined);    

export const UIProvider = ({ children }: { children: React.ReactNode }) => {

    const [replyingTo, setReplyingTo] = useState<ReplyToMessage | null>(null); // for replying to messages
    const [isPreviewing, setIsPreviewing] = useState(false); 

    // For showing backbutton and layout on small screen
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Horizontal sidebar toggle 
    const [hsToggle, setHsToggle] = useState(false);


// Selecting REPLY
const selectReply = (messageObj: ReplyToMessage) => {
    setReplyingTo(messageObj);
};

//   Cancel REPLY
const cancelReply = () => setReplyingTo(null);

// Previewing
const previewingToggle = (value: boolean) => {
    setIsPreviewing(value);
};

// For chat and back button on small screens
const chatOpen = (value: boolean) => {  
    setIsChatOpen(value);
};
  
// For horizontal sidebar on small screeen when chat is open don't show it 
const previewSidebar = (value: boolean) => {  
    setHsToggle(value);
}  

  return (
    <UIContext.Provider value=
    {{ 
        hsToggle,
        previewSidebar,
        isChatOpen,
        chatOpen,
        replyingTo,
        selectReply,
        cancelReply,
        isPreviewing,
        previewingToggle
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }

  return context;
};
