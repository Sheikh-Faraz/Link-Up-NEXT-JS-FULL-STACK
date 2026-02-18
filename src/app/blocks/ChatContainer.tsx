import ChatHeader from "./Chat-Header"
import ChatMessages from "./Chat-Messages-Container"
import ChatInput from "./Chat-Input"

export default function ChatContainer() {    
  return (
    <div className="flex flex-col border rounded-lg h-screen">
      <ChatHeader />
    
      <div className="flex-1 overflow-y-auto min-h-0">
        <ChatMessages />
      </div>
      
      <ChatInput />
    </div>
  );
}
