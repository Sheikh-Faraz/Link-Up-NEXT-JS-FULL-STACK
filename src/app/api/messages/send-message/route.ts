import { NextRequest, NextResponse } from "next/server";

import Message from "@/models/Message";
import { pusher } from "@/lib/pusher";
import { getCurrentUser } from "@/lib/getCurrentUser";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);

    const senderId = currentUser._id;

    const body = await req.json();

    const {
      receiverId,
      text = "",
      replyTo = null,
      attachments = [],
    } = body;

    if (!receiverId) {
      return NextResponse.json(
        { message: "Receiver ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(attachments)) {
      return NextResponse.json(
        { message: "Attachments must be an array" },
        { status: 400 }
      );
    }

    if (attachments.length > MAX_FILES) {
      return NextResponse.json(
        { message: `You can attach up to ${MAX_FILES} files per message.`, },
        { status: 400 }
      );
    }

    const totalSize = attachments.reduce(
      (total: number, file: any) => total + (file.fileSize || 0),
      0
    );

    for (const file of attachments) {
      if (!file.fileName || !file.fileUrl) {
        return NextResponse.json(
          { message: "Invalid attachment data." },
          { status: 400 }
        );
      };

      if (file.fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: `${file.fileName} exceeds the 25 MB file limit.`,  },
          { status: 400 }
        );
      }
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { message: "The total attachment size cannot exceed 50 MB.",  },
        { status: 400 }
      );
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      replyTo,
      attachments,

      // Keep old fields populated for compatibility
      fileName: attachments[0]?.fileName || "",
      fileUrl: attachments[0]?.fileUrl || "",
      fileType: attachments[0]?.fileType || "",
      filePublicId: attachments[0]?.filePublicId || "",
      fileResourceType: attachments[0]?.fileResourceType || "",

      seenBy: [],
    });

    const formattedMessage = {
      _id: message._id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      createdAt: message.createdAt,
      replyTo: message.replyTo,
      attachments: message.attachments,

      fileName: message.fileName,
      fileUrl: message.fileUrl,
      fileType: message.fileType,
      filePublicId: message.filePublicId,
      fileResourceType: message.fileResourceType,

      seenBy: message.seenBy,
    };

    const chatId =
      senderId.toString() < receiverId
        ? `${senderId}-${receiverId}`
        : `${receiverId}-${senderId}`;

    await pusher.trigger(
      `chat-${chatId}`,
      "new-message",
      formattedMessage
    );

    return NextResponse.json(
      { sendedMessage: formattedMessage,  },
      { status: 201,  }
    );
    
  } catch (error) {

    console.error("Send message error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );

  }
}