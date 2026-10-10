import Image from "next/image";
import avatar from '@/app/images/avatarpic.png'
import { LastMessage } from "@/types/message.type";

// Icons
import { 
  Image as ImageIcon,
  Files,
  Music,
  Clapperboard,
  Check,
  CheckCheck,
} from "lucide-react";

interface ContactProps {
  name: string;
  profilePic: string;
  id: string;
  lastMessage: LastMessage | null;
  currentUserId: string;
  onClick?: () => void;
}

const getAttachmentPreview = (fileType?: string) => {
  if (!fileType) return "📎 File";

  if (fileType.startsWith("image/")) {
    // return "📷 Photo";
    return (
      <span className="flex items-center gap-1">
        <ImageIcon size={16} />
        <span>Photo</span>
      </span>
    );
  }

  if (fileType.startsWith("video/")) {
    // return "🎥 Video";
    return (
      <span className="flex items-center gap-1">
        <Clapperboard size={16} />
        <span>Video</span>
      </span>
    );
  }

  if (fileType.startsWith("audio/")) {
    // return "🎵 Audio";
    return (
      <span className="flex items-center gap-1">
        <Music size={16} />
        <span>Audio</span>
      </span>
    );
  }

  // return "📎 File";
  return (
      <span className="flex items-center gap-1">
        <Files size={16} />
        <span>File</span>
      </span>
    );
};

export default function ContactBlock({
  name,
  profilePic,
  lastMessage,
  onClick,
  currentUserId,
  // id,
}: ContactProps) {

  const imageUrl =
    !profilePic || profilePic.trim() === ""
      ? avatar.src
      : profilePic;

  const initials =
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "?";

  return (
    <div 
      className="flex items-center justify-between py-3 w-full"
      onClick={onClick}
    >
      {/* Left section: avatar + info */}
      <div className="flex items-center gap-3 ml-6 w-full">
        
        {/* Avatar */}
        <div className="relative h-11 w-11 shrink-0">
          {profilePic ? (
            <Image
              src={imageUrl}
              alt={name}
              width={44}
              height={44}
              className="block h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-full
                border
                bg-secondary
                text-sm
                font-semibold
                shadow-xs
              "
            >
              {initials}
            </div>
          )}

          {/* Online status dot */}
          <span
            className="
              absolute
              bottom-0
              right-0
              h-2.5
              w-2.5
              rounded-full
              bg-green-500
              ring-2
              ring-background
            "
          />
        </div>



        {/* Name + Message */}
        <div className="flex flex-col w-full">

          <div className="flex justify-between mr-4">
            <span className="font-medium">{name}</span>
            
            {lastMessage?.createdAt && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>


      <div className="max-w-48 truncate text-sm text-muted-foreground flex items-center gap-1">
        {lastMessage && (
          <>
            {lastMessage.senderId === currentUserId && (
              <span className="font-medium shrink-0">You:</span>
            )}

            <span className="truncate">
              {lastMessage.text ||
                (lastMessage.attachments?.length
                  ? getAttachmentPreview(
                      lastMessage.attachments[0].fileType
                    )
                  : lastMessage.fileName
                    ? getAttachmentPreview(lastMessage.fileType)
                    : "")}
            </span>

            {lastMessage.senderId === currentUserId && (
              lastMessage.seenBy?.some(
                (userId) =>
                  String(userId) === String(lastMessage.receiverId)
              ) ? (
                <CheckCheck
                  // title="Seen"
                  className="size-4 shrink-0 text-[#6FD5AA]"
                />
              ) : (
                <Check
                  // title="Sent"
                  className="size-4 shrink-0"
                />
              )
            )}
          </>
        )}
      </div>



          {/* <div className="max-w-48 truncate text-sm text-muted-foreground flex items-center gap-1">
            {lastMessage?.senderId === currentUserId && (
              <span className="font-medium shrink-0 flex items-center gap-1">
                <span>You:</span>

                <span
                  title={
                    lastMessage?.seenBy?.some(
                      (userId) => String(userId) === String(lastMessage.receiverId)
                    )
                      ? "Seen"
                      : "Sent"
                  }
                  className={
                    lastMessage?.seenBy?.some(
                      (userId) => String(userId) === String(lastMessage.receiverId)
                    )
                      ? "text-[#6FD5AA]"
                      : "text-muted-foreground"
                  }
                >
                  {lastMessage?.seenBy?.some(
                    (userId) => String(userId) === String(lastMessage.receiverId)
                  )
                    ? <CheckCheck className="text-[#6FD5AA] size-4"  /> : <Check className="size-4" />}
                </span>
              </span>
            )}
            {lastMessage && (
              <>
                <span className="font-medium">
                  {lastMessage.senderId === currentUserId ? "You: " : ""}
                </span>

                {lastMessage.text ||
                  (lastMessage.attachments?.length
                    ? getAttachmentPreview(lastMessage.attachments[0].fileType)
                    : lastMessage.fileName
                      ? getAttachmentPreview(lastMessage.fileType)
                      : "")}
              </>
            )}
          </div> */}


        </div>

      </div>

      <div>
      </div>
    </div>
  );
}
