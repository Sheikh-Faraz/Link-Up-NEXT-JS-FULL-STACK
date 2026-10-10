"use client";

import { useState, useEffect, useRef } from "react";

// Contexts
import { useUser } from "@/context/user.context";
import { useAuth } from "@/context/auth.context";
import { useMessages } from "@/context/messages.context";
import { useUI } from "@/context/ui.context";

// UI Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Voice Recorder Custom
import VoiceRecorder from "@/app/blocks/VoiceRecorder";

// Toast for notiffications
import toast from "react-hot-toast";

// Icons
import { 
  Smile, 
  Paperclip, 
  X, 
  SendHorizontal, 
  MoreVertical, 
  LoaderCircle,
  Image as ImageIcon,
  Clapperboard,
  Music,
  Files,
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";


export default function ChatInput() {

    // Contexts
    const { authUser } = useAuth();
    const { selectedUser, unblockUser, deleteUser } = useUser();
    const { sendMessage } = useMessages();
    const { replyingTo, cancelReply, isPreviewing, previewingToggle } = useUI();


    // States
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<File[]>([]);

    const [showPreview, setShowPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const pickerRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // New Refs
    const imageInputRef    = useRef<HTMLInputElement | null>(null);
    const documentInputRef = useRef<HTMLInputElement | null>(null);
    const audioInputRef    = useRef<HTMLInputElement | null>(null);
    const videoInputRef    = useRef<HTMLInputElement | null>(null);

    // Contants/limits
    const MAX_FILES = 10;
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

    // const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; 


    // I think this manages / uploads voice recording
    const handleVoiceBlob = async (blob: Blob) => {
      if (!selectedUser) return;

      // Create a File (so your existing sendMessage logic that expects File works)
      const fileName = `voice-${Date.now()}.webm`;
      const voiceFile = new File([blob], fileName, { type: blob.type || "audio/webm" });

      // Prepare reply payload same as you do for text reply
      let replyData;
      if (replyingTo) {
        replyData = {
          text: replyingTo.text || "",
          fileUrl: replyingTo.fileUrl || "",
          fileType: replyingTo.fileType || "",
          fileName: replyingTo.fileName || "",
        };
      };

      setIsUploading(true);
      await sendMessage(
        selectedUser._id, 
        "", 
        replyData, 
        [voiceFile], 
        // voiceFile, 
        // voiceFile.name
      );
      previewingToggle(false);
      setIsUploading(false);

      // clear reply and UI if needed
      cancelReply();
    };


    // Close emoji picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
          setShowEmojiPicker(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    // 🧮 Format file size helper
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };


    // For sending/making message
    const handleSend = async () => {
      if ((!message.trim() && files.length === 0) || !selectedUser) {
        return;
      }
      
      let replyData;
      if (replyingTo) {
        replyData = {
          text: replyingTo.text || "",
          fileUrl: replyingTo.fileUrl || "",
          fileType: replyingTo.fileType || "",
          fileName: replyingTo.fileName || "",
        };
      }

      setIsUploading(true);
      await sendMessage(
        selectedUser._id,
        message, 
        replyData,
        files,
        // file || undefined,
        // file?.name || "",
      )

      setIsUploading(false);

      setMessage("");
      setFiles([]);
      // setFile(null);
      setShowPreview(false);
      cancelReply(); // clear the reply box
    };

    
    const handleEmojiClick = (emojiData: EmojiClickData) => {
      setMessage((prev) => prev + emojiData.emoji);
    };


    const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const selectedFiles = Array.from(e.target.files || []);

      if (selectedFiles.length === 0) return;

      const newFiles = [...files];

      for (const file of selectedFiles) {
        if (newFiles.length >= MAX_FILES) {
          toast.error(`You can select up to ${MAX_FILES} files.`);
          break;
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is larger than 25 MB.`);
          continue;
        }

        const currentTotal = newFiles.reduce(
          (total, item) => total + item.size,
          0
        );

        if (currentTotal + file.size > MAX_TOTAL_SIZE) {
          toast.error("Total attachments cannot exceed 50 MB.");
          break;
        }

        const duplicate = newFiles.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        );

        if (duplicate) {
          continue;
        }

        newFiles.push(file);
      }

      // setFiles(newFiles);

      setFiles(newFiles);

      if (newFiles.length > 0) {
        setShowPreview(true);
      }

      e.target.value = "";
    };


    // const handleFileChange = (
    //   e: React.ChangeEvent<HTMLInputElement>
    // ) => {
    //   const selectedFile = e.target.files?.[0];

    //   if (!selectedFile) return;

    //   if (selectedFile.size > MAX_FILE_SIZE) {
    //     toast.error("File must be smaller than 25 MB");
    //     e.target.value = "";
    //     return;
    //   }

    //   setFile(selectedFile);
    //   setShowPreview(true);
    // };

  return (
    <div className="relative p-3 w-full max-[560px]:p-1">

      {/* Emoji picker popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-24 max-[560px]:right-5 z-50" ref={pickerRef}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={window.innerWidth < 560 ? 260 : 320}
            height={window.innerWidth < 560 ? 250 : 400}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

        {/* ===================== Preview Dialog ===================== */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Attachments</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="flex items-center gap-3 border rounded-md p-2"
                >
                  {/* Image preview */}
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-16 h-16 object-cover rounded-md"
                      controls
                    />
                  ) : file.type.startsWith("audio/") ? (
                    <div className="w-16 h-16 flex items-center justify-center rounded-md bg-muted">
                      🎵
                    </div>
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center rounded-md bg-muted">
                      <Paperclip className="size-5 text-muted-foreground" />
                    </div>
                  )}

                  {/* File information */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Remove file */}
                  <button
                    type="button"
                    onClick={() => {
                      setFiles((prev) =>
                        prev.filter((_, fileIndex) => fileIndex !== index)
                      );
                    }}
                    className="p-1 text-muted-foreground hover:text-red-500"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <p className="text-xs text-muted-foreground">
              {files.length}/{MAX_FILES} files ·{" "}
              {formatFileSize(
                files.reduce((total, file) => total + file.size, 0)
              )}{" "}
              / 50 MB
            </p>

            {/* Input for text */}
            <input
              type="text"
              placeholder="Enter message..."
              className="flex-1 px-2 py-2 max-[560px]:p-1 max-[320px]:text-xs rounded-md text-sm border"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isUploading}
            />

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                >
                Cancel
              </Button>

              <Button
                variant="outline"
                onClick={handleSend}
                disabled={isUploading || files.length === 0}
              >
                {isUploading ? (
                  <LoaderCircle className="animate-spin size-5" />
                ) : (
                  <>
                    {/* <SendHorizontal className="size-4" /> */}
                    {/* <SendHorizontal className="size-4 mr-1" /> */}
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* ======================================================================================================== */}
              {/* Main input area */}
      {/* ======================================================================================================== */}

       {authUser?.blockedUsers?.includes(selectedUser?._id || "") ? 
       (
        <div className="p-4 text-center text-red-500 font-medium">
          You have blocked this user. Unblock to send messages.
          <div className="flex mt-4 items-center justify-center">
            <Button
              variant="outline"
              onClick={() => {
                // Unblock user logic
                if (selectedUser) {
                  unblockUser(selectedUser._id);
                }
              }}
              className="mt-2 flex-1 bg-green-600 text-white"
            >
              Unblock 
            </Button>
            <Button
              onClick={() => {
                // Delete user logic
                if (selectedUser) {
                  deleteUser(selectedUser._id);
                }
              }}
              variant="destructive"
              className="mt-2 flex-1"
            >
              Delete 
            </Button>
          </div>
        </div>
       )
      //  : selectedUser?.blockedUsers?.includes(authUser?._id || "") ? (
       : selectedUser?.hasBlockedMe ? (
          <div className="p-4 text-center text-red-500 font-medium">
            You were blocked by this user. You can’t send messages.
          </div>
        ) 
        : (      
      <div 
        className={`flex items-center space-x-2 rounded-xl p-3 mx-2 shadow-xs dark:border-input dark:bg-input/30`}
      >
      {!isPreviewing &&
        <>
        <input
          type="text"
          placeholder="Enter message..."
          className="flex-1 px-2 py-2 max-[560px]:p-1 max-[320px]:text-xs rounded-md text-sm outline-none border-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isUploading}
        />

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* New Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />


        {/* On click opens the emjois to be selected from */}
        <button
          className="p-2 hover:text-[#6FD5AA] relative cursor-pointer max-[560px]:hidden"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          disabled={isUploading}
        >
          <Smile className="size-4" />
        </button>


        {/* On click opens dropdown for different type of document to send/select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 hover:text-[#6FD5AA] cursor-pointer"
              disabled={isUploading}
            >
              <Paperclip className="size-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">

            <DropdownMenuItem
              onClick={() => imageInputRef.current?.click()}
              className="cursor-pointer"
            >
              <ImageIcon />
              <span className="ml-2">Photos</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => documentInputRef.current?.click()}
              className="cursor-pointer"
            >
              <Files />
              <span className="ml-2">Documents</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => audioInputRef.current?.click()}
              className="cursor-pointer"
            >
              <Music />
              <span className="ml-2">Audio</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => videoInputRef.current?.click()}
              className="cursor-pointer"
            >
              <Clapperboard />
              <span className="ml-2">Videos</span>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>

        {/* <button
          className="p-2 hover:text-[#6FD5AA] cursor-pointer max-[560px]:hidden"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Paperclip className="size-4" />
        </button> */}



        <div className="hidden max-[560px]:block">
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer bg-gray-50 hover:bg-gray-200 flex items-center justify-center rounded-full border">
                    <MoreVertical className="size-5 max-[320px]:size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-max w-fit">

                    <DropdownMenuItem>
                      <button
                        className="cursor-pointer w-fit flex"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        disabled={isUploading}
                      >
                        <Smile className="size-4" />
                        <span className="ml-2">Emoji</span>
                      </button>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <button
                        className="cursor-pointer w-fit flex"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Paperclip className="size-5 max-[320px]:size-4" />
                        <span className="ml-2">Document</span>
                      </button>
                    </DropdownMenuItem>

                </DropdownMenuContent>
        </DropdownMenu>
                                                        
        </div>

        </>
      }

        <div className={`${isPreviewing ? 'w-full' : ''}`}>
          <VoiceRecorder onSend={handleVoiceBlob} autoSend={false} />
        </div>

      {!isPreviewing && <>
        <button
          onClick={handleSend}
          disabled={isUploading}
          className="bg-black p-2 mr-3 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full transition"
        >
          <span  className="block max-[560px]:hidden">  
            {isUploading ? 
              <LoaderCircle className="animate-spin size-4"/> 
                : 
              <SendHorizontal className="size-4"/>
            }
          </span>
          <span className="hidden max-[560px]:block">
            {isUploading ? 
              <LoaderCircle className="animate-spin size-5 max-[320px]:size-4"/> 
                : 
              <SendHorizontal className="size-5 max-[320px]:size-4"/>
              }
          </span>
        </button>
      </>}
      </div>
       )
      }
    </div>
  );
};