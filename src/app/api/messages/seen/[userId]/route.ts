import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { pusher } from "@/lib/pusher";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser(req);
    const currentUserId = currentUser._id;

    const { userId } = await params;

    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (String(currentUserId) === userId) {
      return NextResponse.json(
        { message: "Cannot mark your own messages as seen" },
        { status: 400 }
      );
    }

    // Mark messages sent by the other user to the current user.
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: currentUserId,
        seenBy: { $ne: currentUserId },
        isDeletedFor: { $ne: currentUserId },
      },
      {
        $addToSet: {
          seenBy: currentUserId,
        },
      }
    );

    // Use the same chat channel as new-message events.
    const chatId =
      String(currentUserId) < userId
        ? `${currentUserId}-${userId}`
        : `${userId}-${currentUserId}`;

    // Tell the other browser which user's messages were read.
    await pusher.trigger(`chat-${chatId}`, "messages-seen", {
      readerId: String(currentUserId),
      messageSenderId: userId,
    });

    return NextResponse.json({
      message: "Messages marked as seen",
    });
  } catch (error) {
    console.error("Mark messages as seen error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
