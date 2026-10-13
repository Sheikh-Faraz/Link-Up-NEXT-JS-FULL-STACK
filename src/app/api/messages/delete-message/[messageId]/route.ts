import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { deleteMessageFiles } from "@/lib/deleteMessageFiles";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
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
    
    const currentUserId = currentUser._id.toString();


    
    const isParticipant =
      message.senderId.toString() === currentUserId ||
      message.receiverId.toString() === currentUserId;

    if (!isParticipant) {
      return NextResponse.json(
        { message: "You cannot delete this message" },
        { status: 403 }
      );
    };

    // ==========================================================
    // DELETE FOR EVERYONE
    // ==========================================================

    if (deleteForEveryone) {
      // If you want only the sender to be able to use
      // "Delete for Everyone", uncomment this.
      //
      if (message.senderId.toString() !== currentUserId) {
        return NextResponse.json(
          { message: "Only sender can delete for everyone" },
          { status: 403 }
        );
      }

      // Delete every Cloudinary file associated with message
      await deleteMessageFiles(message);

      // Keep the MongoDB message, but turn it into
      // a deleted-message placeholder.
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          text: "🛇 This message was deleted",

          isEdited: false,

          // Legacy file fields
          fileName: "",
          fileUrl: "",
          fileType: "",
          filePublicId: "",
          fileResourceType: "",

          // New attachment system
          attachments: [],

          // Reply information
          replyTo: [],
        },
        { new: true }
      );

      return NextResponse.json({
        message: "Deleted for everyone",
        updatedMessage,
        permanentlyDeleted: false,
      });
    }

    // ==========================================================
    // DELETE FOR ME
    // ==========================================================

    const alreadyDeleted = message.isDeletedFor?.some(
      (id: any) => id.toString() === currentUserId
    );

    if (!alreadyDeleted) {
      message.isDeletedFor.push(currentUser._id);
    }

    // ==========================================================
    // CHECK IF BOTH USERS HAVE DELETED THE MESSAGE
    // ==========================================================

    const senderId = message.senderId.toString();
    const receiverId = message.receiverId.toString();

    const senderDeleted = message.isDeletedFor.some(
      (id: any) => id.toString() === senderId
    );

    const receiverDeleted = message.isDeletedFor.some(
      (id: any) => id.toString() === receiverId
    );

    const deletedByBoth = senderDeleted && receiverDeleted;

    // ==========================================================
    // BOTH USERS DELETED IT
    // ==========================================================

    if (deletedByBoth) {
      // Delete all associated Cloudinary files
      await deleteMessageFiles(message);

      // Permanently remove the MongoDB message
      await Message.findByIdAndDelete(messageId);

      return NextResponse.json({
        message: "Message permanently deleted",
        permanentlyDeleted: true,
      });
    }

    // Only this user deleted it.
    await message.save();

    return NextResponse.json({
      message: "Deleted for you",
      permanentlyDeleted: false,
    });

  } catch (err: any) {
    console.error("Delete message error:", err);

    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}



