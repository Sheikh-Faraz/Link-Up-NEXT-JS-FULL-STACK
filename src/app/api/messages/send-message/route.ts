import { NextRequest, NextResponse } from "next/server";

// Models
import Message from "@/models/Message";

// Pusher
import { pusher } from "@/lib/pusher";


import { getCurrentUser } from "@/lib/getCurrentUser";
import { uploadFileToCloudinary } from "@/lib/cloudinary-file-upload";


export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    const senderId = currentUser._id;

    const formData = await req.formData();

    const receiverId = formData.get("receiverId")?.toString();
    const text = formData.get("text")?.toString() || "";
    const fileName = formData.get("fileName")?.toString() || "";

    let replyTo = formData.get("replyTo")?.toString() || null;

    if (replyTo) {
      replyTo = JSON.parse(replyTo);
    }

    const file = formData.get("file");

    // --------------------------------------------------
    // Validate receiver
    // --------------------------------------------------

    if (!receiverId) {
      return NextResponse.json(
        { message: "Receiver ID is required" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // File information
    // --------------------------------------------------

    let fileUrl = "";
    let fileType = "";
    let filePublicId = "";
    let fileResourceType = "";

    // --------------------------------------------------
    // Upload file to Cloudinary
    // --------------------------------------------------

    if (file instanceof File && file.size > 0) {
      console.log("Chat file upload:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const uploaded = await uploadFileToCloudinary(
        file,
        "chat-files"
      );

      fileUrl = uploaded.url;
      filePublicId = uploaded.public_id;
      fileResourceType = uploaded.resource_type;

      // Prefer the browser's MIME type for displaying the file
      fileType = file.type;

      console.log("Chat file uploaded:", {
        url: fileUrl,
        public_id: filePublicId,
        resource_type: fileResourceType,
        format: uploaded.format,
      });
    }

    // --------------------------------------------------
    // Create message
    // --------------------------------------------------

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      replyTo,
      fileUrl,
      fileType,
      fileName,
      filePublicId,
      fileResourceType,
      seenBy: [],
    });

    // --------------------------------------------------
    // Format message for Pusher
    // --------------------------------------------------

    const formattedMessage = {
      _id: message._id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      createdAt: message.createdAt,

      replyTo: message.replyTo,

      fileUrl: message.fileUrl,
      fileType: message.fileType,
      fileName: message.fileName,
      filePublicId: message.filePublicId,
      fileResourceType: message.fileResourceType,

      seenBy: message.seenBy,
    };

    // --------------------------------------------------
    // Pusher chat ID
    // --------------------------------------------------

    const chatId =
      senderId.toString() < receiverId
        ? `${senderId}-${receiverId}`
        : `${receiverId}-${senderId}`;

    await pusher.trigger(
      `chat-${chatId}`,
      "new-message",
      formattedMessage
    );

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return NextResponse.json(
      {sendedMessage: formattedMessage,},
      {status: 201,}
    );
  } catch (error) {
    console.error("Send message error:", error);

    return NextResponse.json(
      {message: "Server error",},
      {status: 500,}
    );
  }
}
