export interface Message {
  _id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  updatedAt?: string;          // for edited messages
  isEdited?: boolean;          // boolean flag if edited
  deletedFor?: string[];       // array of userIds for "delete for me"
  reactions?: {                // emoji reactions
    emoji: string;
    userIds: string[];
  }[];
  replyTo?: string | null;     // message ID this one replies to
  seenBy?: string[];           // users who have seen the message
  // seen?: boolean;           // users who have seen the message
  // ✨ New fields for uploads
  fileUrl?: string;   // where file/image is stored
  fileType?: string;  // like "image/png" or "application/pdf"
};

export interface ReplyToMessage {
  text?: string; 
  fileUrl?: string; 
  fileType?: string; 
  fileName?: string,
};