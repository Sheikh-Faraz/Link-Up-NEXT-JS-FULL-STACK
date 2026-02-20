import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET( req: NextRequest, { params } : { params: Promise<{ receiverId: string }> }) {
  try {

    const senderId = await getCurrentUser(req);

    const { receiverId } = await params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      isDeletedFor: { $ne: senderId }, // exclude deleted-for-me
    }).sort({ createdAt: 1 }); // oldest first

    return NextResponse.json(messages);

  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
