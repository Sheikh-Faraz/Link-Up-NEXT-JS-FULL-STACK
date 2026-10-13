
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getCurrentUser } from "@/lib/getCurrentUser";
import Message from "@/models/Message";
import ForwardHistory from "@/models/ForwardHistory";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const currentUser = await getCurrentUser(req);
    const { messageId } = await params;

    if (!mongoose.isValidObjectId(messageId)) {
      return NextResponse.json(
        { message: "Invalid message ID" },
        { status: 400 }
      );
    }

    const history = await ForwardHistory.find({
      sourceMessageId: messageId,
      forwardedBy: currentUser._id,
    })
      .sort({ forwardedAt: -1 })
      .populate("recipientId", "fullName profilePic")
      .populate("forwardedMessageId", "createdAt text attachments")
      .lean();

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error("Get forward history error:", error);

    return NextResponse.json(
      { message: "Failed to get forward history" },
      { status: 500 }
    );
  }
}
