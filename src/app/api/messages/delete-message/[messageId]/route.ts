import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ messageId: string }> } ) {
  try {

    const currentUser = await getCurrentUser(req);

    const { messageId } = await params;

    const body = await req.json();
    const { deleteForEveryone } = body;

    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    if (deleteForEveryone) {
    //   if (message.sender.toString() !== currentUser._id.toString()) {
    //     return NextResponse.json(
    //       { message: "Only sender can delete for everyone" },
    //       { status: 403 }
    //     );
    //   }

      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          text: "🛇 This message was deleted",
          isEdited: false,
          fileUrl: "",
          fileType: "",
          fileName: "",
          replyTo: [],
        },
        { new: true }
      );

      return NextResponse.json({
        message: "Deleted for everyone",
        updatedMessage,
      });
    }

    // Delete only for user
    message.isDeletedFor.push(currentUser._id);
    await message.save();

    return NextResponse.json({
      message: "Deleted for you",
    });

  } catch (err: any) {
    console.error("Delete message error:", err);
    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}