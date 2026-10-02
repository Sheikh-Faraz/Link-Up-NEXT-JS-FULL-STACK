import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(req);
    const userId = currentUser._id.toString();
    // const otherUserId = await params;
    const { id } = await params;

    // Find messages between both users
    const messages = await Message.find({
      $or: [
        // { senderId: userId, receiverId: otherUserId },
        { senderId: userId, receiverId: id },
        // { senderId: otherUserId, receiverId: userId },
        { senderId: id, receiverId: userId },
      ],
    });

    if (!messages.length) {
      return NextResponse.json(
        { message: "No messages found" },
        { status: 404 }
      );
    }

    // Mark as deleted for current user
    await Promise.all(
      messages.map(async (message: any) => {
        if (!message.isDeletedFor.includes(userId)) {
          message.isDeletedFor.push(userId);
          await message.save();
        }
      })
    );

    return NextResponse.json({
      message: "Chat cleared for you",
    });

  } catch (error) {
    console.error("Clear chat error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}