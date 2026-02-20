import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Message from "@/models/Message";

export async function POST(req: NextRequest) {
  try {

    const currentUser = await getCurrentUser(req);
    const senderId = currentUser._id;

    const formData = await req.formData();

    const receiverId = formData.get("receiverId") as string;
    const text = (formData.get("text") as string) || "";
    const fileName = formData.get("fileName") as string;

    let replyTo = formData.get("replyTo") as string | null;
    if (replyTo) replyTo = JSON.parse(replyTo);

    // File (optional)
    const file = formData.get("file") as File | null;

    let fileUrl = "";
    let fileType = "";

    if (file) {
      fileType = file.type;

      // For now simple placeholder
      // later you can upload to cloudinary / s3
      fileUrl = "uploaded-file-url";
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      replyTo,
      fileUrl,
      fileType,
      fileName,
      seenBy: [],
    });

    return NextResponse.json(
      {
        sendedMessage: {
          _id: message._id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          text: message.text,
          createdAt: message.createdAt,
          replyTo: message.replyTo,
          fileUrl: message.fileUrl,
          fileType: message.fileType,
          fileName: message.fileName,
          seenBy: message.seenBy,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
