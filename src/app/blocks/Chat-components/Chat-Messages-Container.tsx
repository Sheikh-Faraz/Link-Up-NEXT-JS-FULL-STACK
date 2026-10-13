"use client";

import { useEffect, useRef, useState } from "react";

// Contexts
import { useUser } from "@/context/user.context";
import { useAuth } from "@/context/auth.context";
import { useMessages } from "@/context/messages.context";
import { useUI } from "@/context/ui.context";

// Services
import { getForwardHistoryApi } from "@/services/message.service";

// Skeletons
import MessageSkeleton from "../Skeletons/MessageSkeleton";

// For Notifications
import toast from "react-hot-toast";

// UI Components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Bubble, 
  BubbleContent, 
  // BubbleReactions,
} from "@/components/ui/bubble";

// Icons
import { 
  Edit, 
  Trash2, 
  Ellipsis, 
  MessageSquareText, 
  CornerUpLeft, 
  Copy, 
  Play,
  Volume2,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Search,
  Forward,
  History,

  Check,
  CheckCheck,
  // Paperclip,
  // Image as ImageIcon,
  // Video,
  // Music,
} from "lucide-react";


// For Audio
import AudioMessage from "@/app/blocks/AudioMessage";

// Type
type ForwardHistoryEntry = {
  _id: string;
  recipientId?: {
    _id: string;
    fullName: string;
    profilePic?: string;
  } | null;
  forwardedAt: string;
};


// This is the dropdown the opens for functions like (Reply, Copy, Edit, Delete) based wheather the message is own or not
function MessageDropdown({
  isOwn,
  msg,
  handleCopy,
  setOpenEdit,
  setOpenDelete,
  selectReply,

  setOpenForward,
  setOpenForwardHistory,
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

  setOpenForward: (open: boolean) => void;
  setOpenForwardHistory: (open: boolean) => void;
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

            {/* If the message isn't text then don't allow to copy */}
            {msg.text && (
              <DropdownMenuItem
                className="cursor-pointer focus:bg-muted"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </DropdownMenuItem>
            )}


            
            <DropdownMenuItem
              className="cursor-pointer focus:bg-muted"
              onClick={() => setOpenForward(true)}
            >
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </DropdownMenuItem>

            {isOwn && (
              <DropdownMenuItem
                className="cursor-pointer focus:bg-muted"
                onClick={() => setOpenForwardHistory(true)}
              >
                <History className="mr-2 h-4 w-4" />
                Forward details
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


// If more than a certain amount of images are send then this allows the user to view them cororsuel for better ux
function MediaCarousel({
  attachments,
  initialIndex = 0,
  onClose,
}: {
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const current = attachments[currentIndex];

  const goPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? attachments.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setCurrentIndex((prev) =>
      prev === attachments.length - 1 ? 0 : prev + 1
    );
  };

  // -----------------------------
  // Download Image
  // -----------------------------
  const handleDownload = () => {
    try {
      // Only modify Cloudinary image URLs.
      // Video URLs are completely untouched.
      const downloadUrl = current.fileUrl.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );

      const link = window.document.createElement("a");

      link.href = downloadUrl;
      link.download = current.fileName || "image";
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error("Image download failed:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft") {
        goPrevious();
      }

      if (e.key === "ArrowRight") {
        goNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* -------------------------------- */}
      {/* Close */}
      {/* -------------------------------- */}

      <button
        type="button"
        onClick={onClose}
        className="
          absolute
          right-5
          top-5
          z-20
          flex
          size-9
          items-center
          justify-center
          rounded-full
          bg-black/50
          text-white
          transition
          hover:bg-black/70
        "
        aria-label="Close"
      >
        <X className="size-5" />
      </button>

      {/* -------------------------------- */}
      {/* Download - IMAGE ONLY */}
      {/* -------------------------------- */}

      {current.fileType?.startsWith("image/") && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="
            absolute
            right-16
            top-5
            z-20
            size-9
            rounded-full
            bg-black/50
            text-white
            transition
            hover:bg-black/70
            hover:text-white
            active:scale-95
          "
          aria-label="Download image"
          title="Download image"
        >
          <Download className="size-5" />
        </Button>
      )}

      {/* -------------------------------- */}
      {/* Previous */}
      {/* -------------------------------- */}

      {attachments.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrevious();
          }}
          className="
            absolute
            left-4
            z-20
            flex
            size-10
            items-center
            justify-center
            rounded-full
            bg-black/50
            text-white
            transition
            hover:bg-black/70
            md:left-8
          "
          aria-label="Previous"
        >
          <ChevronLeft className="size-7" />
        </button>
      )}

      {/* -------------------------------- */}
      {/* Content */}
      {/* -------------------------------- */}

      <div
        className="
          flex
          max-h-[90vh]
          max-w-[90vw]
          items-center
          justify-center
        "
        onClick={(e) => e.stopPropagation()}
      >
        {current.fileType?.startsWith("image/") ? (
          <img
            src={current.fileUrl}
            alt={current.fileName}
            className="
              max-h-[85vh]
              max-w-[90vw]
              rounded-md
              object-contain
            "
          />
        ) : current.fileType?.startsWith("video/") ? (
          <video
            key={current.fileUrl}
            src={current.fileUrl}
            controls
            autoPlay
            className="
              max-h-[85vh]
              max-w-[90vw]
              rounded-md
            "
          />
        ) : null}
      </div>

      {/* -------------------------------- */}
      {/* Next */}
      {/* -------------------------------- */}

      {attachments.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="
            absolute
            right-4
            z-20
            flex
            size-10
            items-center
            justify-center
            rounded-full
            bg-black/50
            text-white
            transition
            hover:bg-black/70
            md:right-8
          "
          aria-label="Next"
        >
          <ChevronRight className="size-7" />
        </button>
      )}

      {/* -------------------------------- */}
      {/* Counter */}
      {/* -------------------------------- */}

      {attachments.length > 1 && (
        <div
          className="
            absolute
            bottom-5
            left-1/2
            -translate-x-1/2
            rounded-full
            bg-black/60
            px-3
            py-1.5
            text-sm
            text-white
          "
        >
          {currentIndex + 1} / {attachments.length}
        </div>
      )}
    </div>
  );
}


// This shows gird or corosuel based on the amount of images/videos send
function MediaGrid({
  attachments,
  isOwn,
  type,
}: {
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
  isOwn?: boolean;
  type: "image" | "video";
}) {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const visibleAttachments = attachments.slice(0, 4);
  const remaining = attachments.length - visibleAttachments.length;

  const openCarousel = (index: number) => {
    setSelectedIndex(index);
    setCarouselOpen(true);
  };

  return (
    <>
      <div
        className={`grid gap-1 mb-2 ${
          attachments.length === 1
            ? "grid-cols-1"
            : attachments.length === 2
              ? "grid-cols-2"
              : "grid-cols-2"
        } max-w-[320px]`}
      >
        {visibleAttachments.map((attachment, index) => {
          const isLastVisible =
            index === visibleAttachments.length - 1;

          const showRemaining = isLastVisible && remaining > 0;

          return (
            <button
              key={`${attachment.fileUrl}-${index}`}
              type="button"
              onClick={() => openCarousel(index)}
              className={`
                relative overflow-hidden rounded-md
                ${attachments.length === 1 ? "aspect-auto" : "aspect-square"}
                bg-muted
              `}
            >
              {type === "image" ? (
                <img
                  src={attachment.fileUrl}
                  alt={attachment.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={attachment.fileUrl}
                  muted
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              )}

              {/* +N overlay */}
              {showRemaining && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    +{remaining}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {carouselOpen && (
        <MediaCarousel
          attachments={attachments}
          initialIndex={selectedIndex}
          onClose={() => setCarouselOpen(false)}
        />
      )}
    </>
  );
}


// If a single file is send
function AttachmentPreview({
  attachment,
  isOwn,
}: {
  attachment: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  };
  isOwn?: boolean;
}) {
  const fileType = attachment.fileType || "";

  // IMAGE
  if (fileType.startsWith("image/")) {
    return (
      <MediaGrid
        attachments={[attachment]}
        isOwn={isOwn}
        type="image"
      />
    );
  }

  // VIDEO
  if (fileType.startsWith("video/")) {
    return (
      <MediaGrid
        attachments={[attachment]}
        isOwn={isOwn}
        type="video"
      />
    );
  }

  // AUDIO
  if (fileType.startsWith("audio/")) {
    return (
      <div className="mb-2 max-w-full">
        <AudioMessage
          src={attachment.fileUrl}
        />
      </div>
      // <div className="mb-2 max-w-full bg-green-600">
      //   <audio
      //     controls
      //     src={attachment.fileUrl}
      //     className="max-w-full bg-red-600"
      //   />
      // </div>
    );
  }

  // For downloading document/file
          const handleDownload = () => {
              try {
                // Tell Cloudinary to download the file
                const downloadUrl = attachment.fileUrl.replace(
                  "/upload/",
                  "/upload/fl_attachment/"
                );

                const link = window.document.createElement("a");

                link.href = downloadUrl;
                link.download = attachment.fileName || "document";
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                window.document.body.appendChild(link);
                link.click();
                window.document.body.removeChild(link);
              } catch (error) {
                console.error("Document download failed:", error);
              }
            };

  // DOCUMENT
  return (
    // <a
    //   href={attachment.fileUrl}
    //   target="_blank"
    //   rel="noopener noreferrer"
    //   className={`flex items-center gap-3 rounded-md px-3 py-2 mb-2 text-sm hover:opacity-90 transition`}
    // >
    //   <FileText className="size-5 shrink-0" />

    //   <div className="min-w-0 flex-1">
    //     <p className="truncate font-medium">
    //       {attachment.fileName || "Document"}
    //     </p>

    //     {attachment.fileSize && (
    //       <p className="text-xs opacity-70">
    //         {(attachment.fileSize / (1024 * 1024)).toFixed(1)} MB
    //       </p>
    //     )}
    //   </div>
    // </a>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  transition-colors
                "
              >
                {/* File Icon */}
                <div
                  className="
                    flex
                    size-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-muted
                  "
                >
                  <FileText className="size-5 text-muted-foreground" />
                </div>

                {/* File Information */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {attachment.fileName || "Document"}
                  </p>

                  {attachment.fileSize && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {(attachment.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  )}
                </div>

                {/* Download */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  aria-label="Download document"
                  title="Download"
                  className="
                    size-8
                    shrink-0
                    rounded-full
                    text-muted-foreground
                    transition-all
                    duration-200
                    hover:bg-muted
                    hover:text-foreground
                    active:scale-95
                  "
                >
                  <Download className="size-4" />
                </Button>
              </div>
  );
}


// If a certain amount of files is send
function AttachmentsPreview({
  attachments,
  isOwn,
}: {
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
  isOwn?: boolean;
}) {
  if (!attachments.length) return null;

  const images = attachments.filter((file) =>
    file.fileType?.startsWith("image/")
  );

  const videos = attachments.filter((file) =>
    file.fileType?.startsWith("video/")
  );

  const audios = attachments.filter((file) =>
    file.fileType?.startsWith("audio/")
  );

  const documents = attachments.filter(
    (file) =>
      !file.fileType?.startsWith("image/") &&
      !file.fileType?.startsWith("video/") &&
      !file.fileType?.startsWith("audio/")
  );

  return (
    <div className="space-y-2">

      {/* IMAGES */}
      {images.length > 0 && (
        <MediaGrid
          attachments={images}
          isOwn={isOwn}
          type="image"
        />
      )}

      {/* VIDEOS */}
      {videos.length > 0 && (
        <MediaGrid
          attachments={videos}
          isOwn={isOwn}
          type="video"
        />
      )}

      {/* AUDIO */}
      {audios.length > 0 && (
        <div className="space-y-8">
          {audios.map((audio, index) => (
            <div
              key={`${audio.fileUrl}-${index}`}
              className="my-6"
            >
              <AudioMessage
                src={audio.fileUrl}
              />
            </div>
          ))}
        </div>
      )}



      {/* DOCUMENTS */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((document, index) => {
            const handleDownload = () => {
              try {
                // Tell Cloudinary to download the file
                const downloadUrl = document.fileUrl.replace(
                  "/upload/",
                  "/upload/fl_attachment/"
                );

                const link = window.document.createElement("a");

                link.href = downloadUrl;
                link.download = document.fileName || "document";
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                window.document.body.appendChild(link);
                link.click();
                window.document.body.removeChild(link);
              } catch (error) {
                console.error("Document download failed:", error);
              }
            };

            return (
              <div
                key={`${document.fileUrl}-${index}`}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  transition-colors
                "
              >
                {/* File Icon */}
                <div
                  className="
                    flex
                    size-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-muted
                  "
                >
                  <FileText className="size-5 text-muted-foreground" />
                </div>

                {/* File Information */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {document.fileName || "Document"}
                  </p>

                  {document.fileSize && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {(document.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  )}
                </div>

                {/* Download */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  aria-label="Download document"
                  title="Download"
                  className="
                    size-8
                    shrink-0
                    rounded-full
                    text-muted-foreground
                    transition-all
                    duration-200
                    hover:bg-muted
                    hover:text-foreground
                    active:scale-95
                  "
                >
                  <Download className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      {/* {documents.length > 0 && (
        <div className="space-y-1">
          {documents.map((document, index) => (
            <a
              key={`${document.fileUrl}-${index}`}
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:opacity-90 transition`}
            >
              <FileText className="size-5 shrink-0" />

            <div>

              <div className="min-w-0 flex-1 flex gap-2">
                <p className="truncate font-medium">
                  {document.fileName || "Document"}
                </p>

                {document.fileSize && (
                  <p className="text-xs opacity-70">
                    ( {(document.fileSize / (1024 * 1024)).toFixed(1)} MB )
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button className="bg-white text-black dark:bg-black dark:text-white p-1 rounded-full">Download</button>
                <button className="bg-white p-1 rounded-full">Preview</button>
              </div>

            </div>

            </a>
          ))}
        </div>
      )} */}

    </div>
  );
}


// This is for single individual message bubble
function MessageBubble({
  id,
  time,
  isOwn,
  replyTo,
  msg,
  isEdited = false,

  // isText = true,
}: {
  id: string;
  time: string;
  isOwn?: boolean;
  isText?: boolean;
  isEdited?: boolean;
  seenby?: string[];

  msg: {
    text?: string;
    attachments?: {
      fileName: string;
      fileUrl: string;
      fileType?: string;
      filePublicId?: string;
      fileResourceType?: string;
      fileSize?: number;
    }[];

    // Old -- Keeping this for old messages
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    filePublicId?: string;
    fileResourceType?: string;

    seenBy?: string[];

    // For message forwarding
    isForwarded?: boolean;
    forwardedFrom?: string | null;
    forwardedBy?: string | null;
    forwardedFromMessageId?: string | null;
  };

   replyTo?: string | null;

}) {

    // Contexts
    const { editMessage, deleteMessage, forwardMessage } = useMessages();
    const { selectReply } = useUI();
    const { selectedUser, users } = useUser();

    // States
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [newText, setNewText] = useState(msg.text || "");

    const [openForward, setOpenForward] = useState(false);
    const [forwardSearch, setForwardSearch] = useState("");
    const [selectedForwardIds, setSelectedForwardIds] = useState<string[]>([]);
    const [isForwarding, setIsForwarding] = useState(false);
   
   
    const [openForwardHistory, setOpenForwardHistory] = useState(false);
    const [forwardHistory, setForwardHistory] = useState<ForwardHistoryEntry[]>([]);
    const [isForwardHistoryLoading, setIsForwardHistoryLoading] = useState(false);


  useEffect(() => {
    if (!openForwardHistory) return;

    let active = true;

    const loadForwardHistory = async () => {
      setIsForwardHistoryLoading(true);

      try {
        const res = await getForwardHistoryApi(id);

        if (active) {
          setForwardHistory(res.data.history ?? []);
        }
      } catch (error) {
        if (active) {
          setForwardHistory([]);
          toast.error("Failed to load forwarding details.");
        }
      } finally {
        if (active) {
          setIsForwardHistoryLoading(false);
        }
      }
    };

    void loadForwardHistory();

    return () => {
      active = false;
    };
  }, [openForwardHistory, id]);

    
    const filteredForwardUsers = users.filter((user) =>
      user.fullName
        .toLowerCase()
        .includes(forwardSearch.trim().toLowerCase())
    );

    const toggleForwardRecipient = (userId: string) => {
      setSelectedForwardIds((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    };

    const handleForward = async () => {
      if (selectedForwardIds.length === 0 || isForwarding) return;

      setIsForwarding(true);

      try {
        await forwardMessage(id, selectedForwardIds);

        setOpenForward(false);
        setSelectedForwardIds([]);
        setForwardSearch("");
      } catch {
        // The context already displays the error toast.
      } finally {
        setIsForwarding(false);
      }
    };

    // To copy text to clipboard handler
    const handleCopy = async () => {
      await navigator.clipboard.writeText(String(msg.text || ""));
      toast.success("Message copied to clipboard");
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


    // For showing seen 
    const isSeen = msg.seenBy?.some(
      (userId) => String(userId) === String(selectedUser?._id)
    );

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

            setOpenForward={setOpenForward}
            setOpenForwardHistory={setOpenForwardHistory}
          /> 
        }
      </div>

      
      {/* This is the message box showing the content of the message send */}

      <Bubble {...(!isOwn && { variant: "muted" })}>

        <BubbleContent>

          {/* {msg.isForwarded && ( */}
          {msg.isForwarded && !(msg.text === "🛇 This message was deleted") && (
            <div className="mb-2 flex items-center gap-2 text-xs italic text-muted-foreground">
              <Forward className="size-3.5" />
              Forwarded
            </div>
          )}

        {/* This is the reply preview showing for the message that was selected to reply to */}
        {Array.isArray(replyTo) && replyTo.length > 0 && (
          <div
            className={`
              mb-3
              rounded-md
              border-l-4
              border-green-400
              px-2
              py-1
              transition-colors
              ${isOwn ? "bg-[#6b626247] dark:bg-[#d4d2d2]" : "bg-[#e5e5e5] dark:bg-[#151515]"}
            `}
          >
            {replyTo[0].fileUrl &&
              replyTo[0].fileType?.startsWith("image/") && (
                <div className="flex items-center gap-2">
                  <ImageWithPreview
                    src={replyTo[0].fileUrl}
                    isReplyToMessagePreview={true}
                  />

                  <span className="truncate text-xs text-muted-foreground">
                    {replyTo[0].fileName || "Image"}
                  </span>
                </div>
              )}

            {replyTo[0].fileUrl &&
              replyTo[0].fileType?.startsWith("video/") && (
                <div className="flex items-center gap-2">
                  <div
                    className="
                      flex
                      size-8
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-md
                      bg-black/10
                      dark:bg-white/10
                    "
                  >
                    <Play className="size-4 text-muted-foreground" />
                  </div>

                  <span className="truncate text-xs text-muted-foreground">
                    {replyTo[0].fileName || "Video"}
                  </span>
                </div>
              )}

            {replyTo[0].fileUrl &&
              replyTo[0].fileType?.startsWith("audio/") && (
                <div className="flex items-center gap-2">
                  <div
                    className="
                      flex
                      size-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      bg-black/10
                      text-muted-foreground
                      dark:bg-white/10
                    "
                  >
                    <Volume2 className="size-4" />
                  </div>

                  <span className="truncate text-xs text-muted-foreground">
                    {replyTo[0].fileName || "Audio"}
                  </span>
                </div>
              )}

            {replyTo[0].fileUrl &&
              replyTo[0].fileType &&
              !replyTo[0].fileType.startsWith("image/") &&
              !replyTo[0].fileType.startsWith("video/") &&
              !replyTo[0].fileType.startsWith("audio/") && (
                <div className="flex items-center gap-2">
                  <div
                    className="
                      flex
                      size-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      bg-black/10
                      text-muted-foreground
                      dark:bg-white/10
                    "
                  >
                    <FileText className="size-4" />
                  </div>

                  <span className="truncate text-xs text-muted-foreground">
                    {replyTo[0].fileName || "File"}
                  </span>
                </div>
              )}

            {replyTo[0].text && (
              <p className="mt-1 line-clamp-2 text-xs">
                {replyTo[0].text}
              </p>
            )}
          </div>
        )}


        {/* 💬 Actual Message Text / File / This is the message regular sending */}
        {/* Attachments */}
        {msg.attachments && msg.attachments.length > 0 ? (
          <AttachmentsPreview                           // For multiple files
            attachments={msg.attachments}
            isOwn={isOwn}
          />
        ) : (
          /* Backward compatibility for old messages */
          msg.fileUrl && (
            <AttachmentPreview                          // For single file
              attachment={{
                fileName: msg.fileName || "Document",
                fileUrl: msg.fileUrl,
                fileType: msg.fileType || "",
                fileSize: undefined,
              }}
              isOwn={isOwn}
            />
          )
        )}


        {msg.text && (
          <p  className={`text-sm transition-all duration-300`}>
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



      {/* Dialog to select users to forward message */}      
      <Dialog
        open={openForward}
        onOpenChange={(open) => {
          setOpenForward(open);

          if (!open) {
            setForwardSearch("");
            setSelectedForwardIds([]);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forward message</DialogTitle>
            <DialogDescription>
              Select one or more contacts to forward this message to.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-md border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />

            <input
              value={forwardSearch}
              onChange={(event) => setForwardSearch(event.target.value)}
              placeholder="Search people..."
              className="h-10 w-full bg-transparent text-sm outline-none"
            />
          </div>

          {selectedForwardIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedForwardIds.length} selected
            </p>
          )}

          <div className="max-h-[40vh] space-y-1 overflow-y-auto">
            {filteredForwardUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No contacts found.
              </p>
            ) : (
              filteredForwardUsers.map((user) => {
                const selected = selectedForwardIds.includes(user._id);

                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => toggleForwardRecipient(user._id)}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                      selected
                        ? "bg-[#6FD5AA]/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt=""
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted font-medium">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {user.fullName}
                    </span>

                    <span
                      className={`flex size-5 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[#6FD5AA] bg-[#6FD5AA] text-black"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selected && <Check className="size-3" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenForward(false)}
              disabled={isForwarding}
            >
              Cancel
            </Button>

            <Button
              onClick={handleForward}
              disabled={selectedForwardIds.length === 0 || isForwarding}
              className="bg-[#6FD5AA] text-black hover:bg-[#5bc69a]"
            >
              {isForwarding
                ? "Forwarding..."
                : `Forward${selectedForwardIds.length > 0 ? ` (${selectedForwardIds.length})` : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Details of forward message */}      
      <Dialog
        open={openForwardHistory}
        onOpenChange={setOpenForwardHistory}
      >
        <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forward details</DialogTitle>
            <DialogDescription>
              Contacts you forwarded this message to.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {isForwardHistoryLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading forwarding details...
              </p>
            ) : forwardHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No forwarding history found for this message.
              </p>
            ) : (
              forwardHistory.map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted"
                >
                  {entry.recipientId?.profilePic ? (
                    <img
                      src={entry.recipientId.profilePic}
                      alt=""
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-medium">
                      {entry.recipientId?.fullName
                        ?.charAt(0)
                        .toUpperCase() || "?"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.recipientId?.fullName || "Unavailable user"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Forwarded{" "}
                      {new Date(entry.forwardedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenForwardHistory(false)}
            >
              Close
            </Button>
          </DialogFooter>
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

            setOpenForward={setOpenForward}
            setOpenForwardHistory={setOpenForwardHistory}
          />
        }
      </div> 

    </div>


      {/* Showing time & Check/seen/read mark/ Of Own & NOT Own */}
      {!isOwn && <div className="text-xs text-gray-500 ml-2 text-start">
          {time}
        </div>
      }

      {isOwn && (
        <div className="text-xs text-gray-500 mr-2 flex justify-end items-center gap-1">
          <span>{time}</span>

          <span
            className={isSeen ? "text-[#6FD5AA]" : ""}
            title={isSeen ? "Seen" : "Sent"}
          >
            {isSeen ? <CheckCheck className="text-[#6FD5AA] size-4"  /> : <Check className="size-4" />}
          </span>
        </div>
      )}

    </div>

  );
}




export default function ChatMessages() {
  
  // Contexts
  const { authUser } = useAuth();
  const { selectedUser, fetchUser } = useUser();
  const { messages, getMessages, isMessagesLoading, markMessagesAsSeen } = useMessages();

  const { replyingTo, cancelReply } = useUI();

  const bottomRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    fetchUser();

    if (selectedUser) {
      const loadConversation = async () => {
        await getMessages(selectedUser._id);
        await markMessagesAsSeen(selectedUser._id);
      };

      loadConversation();
    }
  }, [selectedUser]);

  // useEffect(() => {
  //   fetchUser();
  //   if (selectedUser) {
  //     getMessages(selectedUser._id);
  //     markMessagesAsSeenApi(selectedUser._id);
  //   }
  // }, [selectedUser]);


  // Scroll to bottom ONLY when messages change.
  // Reply selection/cancel will NOT trigger this.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading) return <MessageSkeleton />;

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-gray-50 text-center text-gray-500">
        <MessageSquareText size={45} />
        <p className="mt-6">No messages yet — say hi 👋</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            msg={msg}
            replyTo={msg.replyTo}
            id={msg._id}
            time={new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            isOwn={String(msg.senderId) === String(authUser?._id)}
            isEdited={msg.isEdited}
            // seenby={msg.seenBy}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Sticky Reply Preview */}
      {replyingTo && (
        <div className="shrink-0 mt-2">
          <div
            className="
              flex
              items-center
              gap-3
              rounded-lg
              border
              border-border
              shadow-xs dark:border-input dark:bg-input/30
              px-3
              py-2.5
            "
          >
            {/* Reply indicator */}
            <div className="h-10 w-1 shrink-0 rounded-full bg-[#6FD5AA]" />

            {/* Preview */}
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-xs font-medium text-[#6FD5AA]">
                Replying to
              </p>

              {/* TEXT */}
              {replyingTo.text && !replyingTo.fileUrl && (
                <p className="truncate text-sm text-foreground">
                  {replyingTo.text}
                </p>
              )}

              {/* IMAGE */}
              {replyingTo.fileUrl &&
                replyingTo.fileType?.startsWith("image/") && (
                  <div className="flex items-center gap-2">
                    <img
                      src={replyingTo.fileUrl}
                      alt={replyingTo.fileName || "Image"}
                      className="
                        size-10
                        shrink-0
                        rounded-md
                        object-cover
                      "
                    />

                    <p className="truncate text-sm text-muted-foreground">
                      {replyingTo.fileName || "Image"}
                    </p>
                  </div>
                )}

              {/* VIDEO */}
              {replyingTo.fileUrl &&
                replyingTo.fileType?.startsWith("video/") && (
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        flex
                        size-10
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-md
                        bg-muted
                      "
                    >
                      <video
                        src={replyingTo.fileUrl}
                        muted
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <p className="truncate text-sm text-muted-foreground">
                      {replyingTo.fileName || "Video"}
                    </p>
                  </div>
                )}

              {/* AUDIO */}
              {replyingTo.fileUrl &&
                replyingTo.fileType?.startsWith("audio/") && (
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        flex
                        size-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        bg-muted
                        text-muted-foreground
                      "
                    >
                      <Volume2 className="size-5" />
                    </div>

                    <p className="truncate text-sm text-muted-foreground">
                      {replyingTo.fileName || "Audio"}
                    </p>
                  </div>
                )}

              {/* DOCUMENT / OTHER FILE */}
              {replyingTo.fileUrl &&
                replyingTo.fileType &&
                !replyingTo.fileType.startsWith("image/") &&
                !replyingTo.fileType.startsWith("video/") &&
                !replyingTo.fileType.startsWith("audio/") && (
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        flex
                        size-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        bg-muted
                        text-muted-foreground
                      "
                    >
                      <FileText className="size-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">
                        {replyingTo.fileName || "File"}
                      </p>

                      {replyingTo.fileSize && (
                        <p className="text-xs text-muted-foreground">
                          {(
                            replyingTo.fileSize /
                            (1024 * 1024)
                          ).toFixed(1)}{" "}
                          MB
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Cancel */}
            <button
              type="button"
              onClick={cancelReply}
              aria-label="Cancel reply"
              title="Cancel reply"
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-full
                text-muted-foreground
                transition-all
                hover:bg-muted
                hover:text-foreground
                active:scale-95
              "
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
