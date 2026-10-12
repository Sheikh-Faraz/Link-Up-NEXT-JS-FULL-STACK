
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { pusher } from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser(req);
    const { userId } = await params;

    if (
      !mongoose.isValidObjectId(userId) ||
      String(currentUser._id) === userId
    ) {
      return NextResponse.json(
        { message: "Invalid conversation user" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const isViewing = body.isViewing;

    if (typeof isViewing !== "boolean") {
      return NextResponse.json(
        { message: "isViewing must be a boolean" },
        { status: 400 }
      );
    }

    const currentUserId = String(currentUser._id);

    const chatId =
      currentUserId < userId
        ? `${currentUserId}-${userId}`
        : `${userId}-${currentUserId}`;

    await pusher.trigger(`chat-${chatId}`, "chat-viewing-status", {
      userId: currentUserId,
      isViewing,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat viewing status error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
