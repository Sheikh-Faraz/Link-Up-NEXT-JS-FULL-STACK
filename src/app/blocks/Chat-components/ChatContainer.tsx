import ChatHeader from "./Chat-Header"
import ChatMessages from "./Chat-Messages-Container"
import ChatInput from "./Chat-Input"

export default function ChatContainer() {    
  return (
    <div className="flex flex-col min-h-0 h-full"> 

      {/* HEADER OF CHAT WHICH DIPLAYS SELECTED USER'S INFO */}
      <div className="relative z-10 bg-background/90 backdrop-blur-md">
        <ChatHeader />
        <div className="absolute left-0 right-0 -bottom-12 h-16 bg-linear-to-b from-background/90 to-transparent pointer-events-none" />
      </div>
      
      {/* <ChatHeader /> */}
    
      {/* MESSAGES CONTAINER DISPAYING ALL THE MESSAGES */}
      <div className="
          flex-1 overflow-y-auto min-h-0 mx-6
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50
        ">
        <ChatMessages />
      </div>
      
      {/* INPUT AREA FOR SENDING MESSAGES / ENTRING THE MESSAGES FOR SENDING */}
      <div className="relative z-10 bg-background/90 backdrop-blur-md">
        <ChatInput />
        <div className="absolute left-0 right-0 -top-12 h-16 bg-linear-to-t from-background/90 to-transparent pointer-events-none" />
      </div>

    </div>
  );
}
