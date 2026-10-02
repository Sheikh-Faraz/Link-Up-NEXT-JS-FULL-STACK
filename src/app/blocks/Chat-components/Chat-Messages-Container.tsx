"use client";

import { useEffect, useRef, useState } from "react";

// Contexts
import { useUser } from "@/context/user.context";
import { useAuth } from "@/context/auth.context";
import { useMessages } from "@/context/messages.context";
import { useUI } from "@/context/ui.context";

// Skeletons
import MessageSkeleton from "../Skeletons/MessageSkeleton";

// UI Components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble";

// Icons
import { 
  Edit, 
  Trash2, 
  Ellipsis, 
  MessageSquareText, 
  CornerUpLeft, 
  Copy, 
  // CheckCheck, 
} from "lucide-react";



// This is the dropdown the opens for functions like (Reply, Copy, Edit, Delete) based wheather the message is own or not
function MessageDropdown({
  isOwn,
  msg,
  handleCopy,
  setOpenEdit,
  setOpenDelete,
  selectReply,
}: {
  isOwn: boolean;
  msg: {
    text?: string;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    filePublicId?: string;
    fileResourceType?: string;
  };

  handleCopy: () => void;
  setOpenEdit: (open: boolean) => void;
  setOpenDelete: (open: boolean) => void;
  selectReply: (msg: { text?: string; fileUrl?: string; fileType?: string; fileName?: string }) => void;
}) {
  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>

        {/* Button to open dropdown for actoins on message */}
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 p-0 cursor-pointer"
        >
          <Ellipsis className="size-4" />
        </Button>

      </DropdownMenuTrigger>


      <DropdownMenuContent 
        align={isOwn ? "end" : "start"} 
        className="w-36"
      >
        {/* If the message was delete then only show delete option and not others */}
        {msg.text === "🛇 This message was deleted" ? (
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onClick={() => setOpenDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        ) : (
          <>
            {/* Reply to message */}
            <DropdownMenuItem
              className="cursor-pointer focus:bg-muted"
              onClick={() => selectReply(msg)}
            >
              <CornerUpLeft className="h-4 w-4 mr-2" /> 
                Reply
            </DropdownMenuItem>

            {/* If the message is audio then don't allow to copy */}
            {msg.fileType !== "audio" && (
              <DropdownMenuItem
                className="cursor-pointer focus:bg-muted"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy
              </DropdownMenuItem>
            )}

            {/* Allow to edit the message if it is text and own, also opens edit dialog*/}
            {isOwn && msg.text && (
              <DropdownMenuItem
                className="cursor-pointer focus:bg-muted"
                onClick={() => setOpenEdit(true)}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}  

            {/* Delete Message & Open Delete Dialog for confirmation and type of delete */}
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setOpenDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


// If the message was image then on click opens the image in full screen
function ImageWithPreview(
  { 
    src,
    isReplyToMessagePreview,
  }: 
  {
     src: string;
     isReplyToMessagePreview?: boolean;
  }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <img
        src={src}
        alt="Sent image"
        onClick={() => setOpen(true)}
        // className="rounded-lg max-w-62.5 max-h-62.5 object-cover mb-2 cursor-pointer hover:opacity-90 transition"
        className={`${isReplyToMessagePreview ? 'rounded-md max-w-20 max-h-20 object-cover mb-1' : 'rounded-lg max-w-62.5 max-h-62.5 object-cover mb-2 cursor-pointer hover:opacity-90 transition'}`}
      />
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 cursor-zoom-out"
        >
          <img src={src} alt="Full Image Preview" className="max-w-[90%] max-h-[90%]" />
        </div>
      )}
    </>
  );
}


// This is for single individual message bubble
function MessageBubble({
  // children,
  id,
  time,
  isOwn,
  replyTo,
  msg,
  isEdited = false,
  // isText = true,
  // seenby,
}: {
  // children: React.ReactNode;
  id: string;
  time: string;
  isOwn?: boolean;
  isText?: boolean;
  isEdited?: boolean;
  seenby?: string[];
  msg: {
    text?: string;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    filePublicId?: string;
    fileResourceType?: string;
  };
  replyTo?: string | null;
}) {

    // Contexts
    const { editMessage, deleteMessage } = useMessages();
    const { selectReply } = useUI();
    const { selectedUser } = useUser();

    // States
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [newText, setNewText] = useState(msg.text || "");

    // To copy text to clipboard handler
    const handleCopy = async () => {
      await navigator.clipboard.writeText(String(msg.text || ""));
    };

    // To make edit/update message handler
    const handleSaveEdit = async () => {
      await editMessage(id, newText, selectedUser?._id || "");
      setOpenEdit(false);
    };

    // To delete message handler
    const handleDelete = async (forEveryone = false) => {
      await deleteMessage(id, selectedUser?._id || "" , forEveryone);
      setOpenDelete(false);
    };

  return (
    <div className="mb-5"> 

    <div className={`flex mb-2 items-start group ${isOwn ? "justify-end" : ""}`}>
      
      {/* If the message is own then show and pass this version of message actions dropdown */}
      <div className="my-auto mr-2">
        {isOwn && 
          <MessageDropdown
            isOwn={true}
            msg={msg}
            handleCopy={handleCopy}
            setOpenEdit={setOpenEdit}
            setOpenDelete={setOpenDelete}
            selectReply={selectReply}
          /> 
        }
      </div>

      
      {/* This is the message box showing the content of the message send */}
      {/* <div
        className={`relative rounded-md shadow p-2 transition-all duration-200 ${
            isOwn ? "bg-[#363434] text-[#E5E5E5] dark:bg-white dark:text-black" : "bg-[#F5F5F5] text-black dark:bg-[#262626] dark:text-white"
          } ${
            msg.fileType?.startsWith("image/")
              ? "max-w-65"
              : "max-w-sm"
          }`
        }
      > */}

      <Bubble {...(!isOwn && { variant: "muted" })}>

        <BubbleContent>
        {/* This is the reply preview showing above image which with it was send with */}
        {Array.isArray(replyTo) && replyTo.length > 0 && (
          <div
            // ${isOwn ? "border-white/60 bg-[#6FD5AA]" : "border-green-400 bg-gray-100"}
            className={`
              border-l-4 pl-3 pr-2 py-1 mb-2 rounded-md border-green-400 
              ${isOwn ? " bg-[#151515] dark:bg-[#e5e5e5]" : "bg-[#e5e5e5] dark:bg-[#151515]"}
              `}
          >
            {replyTo[0].fileUrl && (
              replyTo[0].fileType?.startsWith("image/") ? (
                <ImageWithPreview 
                  src={replyTo[0].fileUrl} 
                  isReplyToMessagePreview={true}
                />
              ) : (
                <div
                  className={`flex items-center space-x-2 mb-3 text-xs ${
                    isOwn ? "text-white" : "text-gray-700"
                  }`}
                >
                  📎 <span>{replyTo[0].fileName || "Document"}</span>
                </div>
              )
            )}


            {replyTo[0].text && (
              // ${isOwn ? "text-white/90" : "text-gray-700"}`
              // ${isOwn ? "text-green-600" : "text-red-700"}
              <p className={`text-xs line-clamp-2`}>
                {replyTo[0].text}
              </p>
            )}

          </div>
        )}


        {/* 💬 Actual Message Text / File / This is the message regular sending */}
        {msg.fileUrl && (
          <>
            {msg.fileType?.startsWith("image/") ? (
              <ImageWithPreview src={msg.fileUrl} />
            ) : 
            msg.fileType?.startsWith("audio/") ? (
              <div className="mb-2">
                <audio controls src={msg.fileUrl} />
              </div>
            ) : (
              <a
                href={msg.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center space-x-2 ${
                  isOwn ? "bg-[#4CBBA3]" : "bg-gray-100"
                } rounded-md px-2 py-1 mb-2 text-sm hover:opacity-90 transition`}
              >
                <span>📄 {msg.fileName || "Document"}</span>
              </a>
            )}
          </>
        )}


        {msg.text && (
          <p
            // className={`text-sm transition-all duration-300 m-2 ${
            className={`text-sm transition-all duration-300 ${
              msg.text === "🛇 This message was deleted"
                ? `${isOwn ? "italic text-white opacity-70" : "italic text-black opacity-70"}`
                : "opacity-100"
            }`}
          >
            {msg.text}
            {isEdited && (
              <span className="ml-2 text-xs italic opacity-70">(edited)</span>
            )}
          </p>
        )}

        </BubbleContent>

      </Bubble>
      {/* </div> */}

      {/* ===================== Edit Dialog ===================== */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
            <DialogDescription>Modify your message and save changes.</DialogDescription>
              <div className="mt-4 p-10 justify-center bg-muted">
                <div
                  className="relative rounded-lg shadow p-3 w-fit text-white bg-[#6FD5AA] m-auto text-center"
                >
                  {msg.text}
                </div>
              </div>
          </DialogHeader>
          <textarea
            className="w-full border-2 border-gray-300 rounded-md p-2 mt-2 text-sm"
            placeholder="Edit your message..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveEdit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== Delete Dialog ===================== */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-5 space-y-2 items-end">

            {msg.text === "🛇 This message was deleted" ? (

              <Button className="w-fit" variant="destructive" onClick={() => handleDelete(false)}>
                Delete for me
              </Button>

          ):(
            <div className="flex flex-col space-y-2 items-end">
            <Button className="w-fit" variant="destructive" onClick={() => handleDelete(false)}>
              Delete for me ?
            </Button>

            {isOwn && (
            <Button className="w-fit" variant="destructive" onClick={() => handleDelete(true)}>
              Delete for everyone
            </Button>
          )}
            </div>
          )}
            <Button className="w-fit" variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* If the message is NOT own then show and pass this version of message actions dropdown */}
      <div className="my-auto ml-2">
        {!isOwn && 
          <MessageDropdown
            isOwn={false}
            msg={msg}
            handleCopy={handleCopy}
            setOpenEdit={setOpenEdit}
            setOpenDelete={setOpenDelete}
            selectReply={selectReply}
          />
        }
      </div> 

    </div>


      {/* Showing time & Check/seen/read mark/ Of Own & NOT Own */}
      {!isOwn && <div className="text-xs text-gray-500 ml-2 text-start">
          {time}
        </div>
      }

      {isOwn && <div className="text-xs text-gray-500 mr-2 flex justify-end">
          <span>{time}</span>
        </div>
      }
    </div>

  );
}

export default function ChatMessages() {

  //  Contexts
  const { authUser } = useAuth();
  const { selectedUser, fetchUser } = useUser();
  const { messages, getMessages, isMessagesLoading } = useMessages();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUser();
    if (selectedUser) getMessages(selectedUser._id);
    // The getting messagees of the user indicate that the messages are read by me so update the seen status

    // subscribeToMessages();

    // return () => {
    //   unsubscribeFromMessages();
    // }
    
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // if (!selectedUser) {
  //   return (
  //     <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 border border-blue-600">
  //       Select a user to start chatting 💬
  //     </div>
  //   );
  // }

  if (isMessagesLoading) return <MessageSkeleton />;

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 h-full text-center">
        <MessageSquareText size={45} />
        <p className="mt-6">No messages yet — say hi 👋</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          msg={msg}
          replyTo={msg.replyTo} 
          id={msg._id}
          time={new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          isOwn={String(msg.senderId) === String(authUser?._id)}
          isEdited={msg.isEdited}
          seenby={msg.seenBy}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
