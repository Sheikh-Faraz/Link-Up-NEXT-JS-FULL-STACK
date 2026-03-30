import ChatHeader from "./Chat-Header"
import ChatMessages from "./Chat-Messages-Container"
import ChatInput from "./Chat-Input"

export default function ChatContainer() {    
  return (
    // <div className="flex flex-col border rounded-lg h-screen">
      // {/* <div className="flex-1 overflow-y-auto h-screen"> */}
      // ORIGINAL ?
    // <div className="flex flex-col border rounded-lg h-screen lg:h-[95vh]">

    <div className="flex flex-col border rounded-lg">
     
      {/* HEADER OF CHAT WHICH DIPLAYS SELECTED USER'S INFO */}
      <ChatHeader />
    
      {/* MESSAGES CONTAINER DISPAYING ALL THE MESSAGES */}
      {/* ORIGINAL DIV */}
      {/* <div className="flex-1 overflow-y-auto min-h-0"> */}
      <div className="h-[67vh] overflow-y-auto border border-red-600">
        <ChatMessages />
      </div>
      
      {/* INPUT AREA FOR SENDING MESSAGES / ENTRING THE MESSAGES FOR SENDING */}
      <ChatInput />


    </div>
  );
}
