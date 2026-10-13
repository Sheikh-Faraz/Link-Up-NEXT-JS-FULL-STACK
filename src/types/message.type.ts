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

  // Legacy
  fileUrl?: string;   // where file/image is stored
  fileType?: string;  // like "image/png" or "application/pdf"

  attachments?: Attachment[]; // For files like images, files, pdfs, audios etc

  
  // Forwarded message metadata
  isForwarded?: boolean;
  forwardedFrom?: string | null;
  forwardedFromMessageId?: string | null;
  forwardedBy?: string | null;
};


export interface ReplyToMessage {
  text?: string; 
  fileUrl?: string; 
  fileType?: string; 
  fileName?: string;
  fileSize?: number;
  attachments?: Attachment[];
};


export interface LastMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  fileName?: string;
  fileType?: string;
  attachments?: {
    fileName: string;
    fileType?: string;
  }[];
  seenBy?: string[];           // users who have seen the message
  createdAt: string;
}


export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  filePublicId?: string;
  fileResourceType?: string;
  fileSize?: number;
}