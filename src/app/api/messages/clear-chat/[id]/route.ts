import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { deleteMessageFiles } from "@/lib/deleteMessageFiles";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(req);

    const userId = currentUser._id.toString();

    const { id: otherUserId } = await params;

    // ==========================================================
    // FIND ALL MESSAGES BETWEEN BOTH USERS
    // ==========================================================

    const messages = await Message.find({
      $or: [
        {
          senderId: userId,
          receiverId: otherUserId,
        },
        {
          senderId: otherUserId,
          receiverId: userId,
        },
      ],
    });

    if (!messages.length) {
      return NextResponse.json(
        { message: "No messages found" },
        { status: 404 }
      );
    }

    const messagesToDeletePermanently = [];

    // ==========================================================
    // PROCESS EACH MESSAGE
    // ==========================================================

    for (const message of messages) {
      const alreadyDeleted = message.isDeletedFor?.some(
        (id: any) => id.toString() === userId
      );

      if (!alreadyDeleted) {
        message.isDeletedFor.push(currentUser._id);
      }

      const senderId = message.senderId.toString();
      const receiverId = message.receiverId.toString();

      const senderDeleted = message.isDeletedFor.some(
        (id: any) => id.toString() === senderId
      );

      const receiverDeleted = message.isDeletedFor.some(
        (id: any) => id.toString() === receiverId
      );

      const deletedByBoth =
        senderDeleted && receiverDeleted;

      if (deletedByBoth) {
        messagesToDeletePermanently.push(message);
      } else {
        await message.save();
      }
    }

    // ==========================================================
    // PERMANENTLY DELETE MESSAGES THAT BOTH USERS DELETED
    // ==========================================================

    // for (const message of messagesToDeletePermanently) {
    //   // Delete Cloudinary files
    //   await deleteMessageFiles(message);

    //   // Delete MongoDB message
    //   await Message.findByIdAndDelete(message._id);
    // }


    
    // First remove all messages scheduled for permanent deletion.
    // This prevents messages being deleted together from keeping
    // each other's Cloudinary files alive.
    for (const message of messagesToDeletePermanently) {
      await Message.findByIdAndDelete(message._id);
    }

    // Now check remaining database messages before deleting files.
    // Forwarded copies and other messages can still reference them.
    for (const message of messagesToDeletePermanently) {
      await deleteMessageFiles(message);
    }


    return NextResponse.json({
      message: "Chat cleared for you",
      permanentlyDeleted:
        messagesToDeletePermanently.length,
    });

  } catch (error) {
    console.error("Clear chat error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}




// import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Message from "@/models/Message";
// import { getCurrentUser } from "@/lib/getCurrentUser";

// export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     await connectDB();

//     const currentUser = await getCurrentUser(req);
//     const userId = currentUser._id.toString();
//     // const otherUserId = await params;
//     const { id } = await params;

//     // Find messages between both users
//     const messages = await Message.find({
//       $or: [
//         // { senderId: userId, receiverId: otherUserId },
//         { senderId: userId, receiverId: id },
//         // { senderId: otherUserId, receiverId: userId },
//         { senderId: id, receiverId: userId },
//       ],
//     });

//     if (!messages.length) {
//       return NextResponse.json(
//         { message: "No messages found" },
//         { status: 404 }
//       );
//     }

//     // Mark as deleted for current user
//     await Promise.all(
//       messages.map(async (message: any) => {
//         if (!message.isDeletedFor.includes(userId)) {
//           message.isDeletedFor.push(userId);
//           await message.save();
//         }
//       })
//     );

//     return NextResponse.json({
//       message: "Chat cleared for you",
//     });

//   } catch (error) {
//     console.error("Clear chat error:", error);

//     return NextResponse.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }