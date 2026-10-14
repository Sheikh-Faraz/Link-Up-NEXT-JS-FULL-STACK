
import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { pusher } from "@/lib/pusher";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const userId = String(user._id);

    const { id } = await params;
    const { content } = await req.json();

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { message: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    const message = await Message.findById(id);

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Only the original sender can edit the message.
    if (String(message.senderId) !== userId) {
      return NextResponse.json(
        { message: "You cannot edit this message" },
        { status: 403 }
      );
    }

    if (message.text === "🛇 This message was deleted") {
      return NextResponse.json(
        { message: "A deleted message cannot be edited" },
        { status: 400 }
      );
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      {
        text: content.trim(),
        isEdited: true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    const senderId = String(updatedMessage.senderId);
    const receiverId = String(updatedMessage.receiverId);

    const chatId =
      senderId < receiverId
        ? `${senderId}-${receiverId}`
        : `${receiverId}-${senderId}`;

    // Notify both users' chat clients.
    await pusher.trigger(`chat-${chatId}`, "message-edited", {
      updatedMessage: updatedMessage.toObject(),
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Edit message error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}



// import { NextRequest, NextResponse } from "next/server";
// import Message from "@/models/Message";
// import { getCurrentUser } from "@/lib/getCurrentUser";


// export async function PATCH( req: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
//   try {

//     const user = await getCurrentUser(req);
//     const userId = user._id.toString();

//     const { id } = await params;
//     const body = await req.json();
//     const { content } = body;

//     const message = await Message.findById(id);

//     if (!message) {
//       return NextResponse.json(
//         { message: "Message not found" },
//         { status: 404 }
//       );
//     }

//     // Optional security check
//     // if (message.sender.toString() !== userId) {
//     //   return NextResponse.json(
//     //     { message: "Not allowed" },
//     //     { status: 403 }
//     //   );
//     // }

//     const updatedMessage = await Message.findByIdAndUpdate(
//       id,
//       {
//         text: content,
//         isEdited: true,
//       },
//       { new: true }
//     );

//     return NextResponse.json(updatedMessage);

//   } catch (error) {
//     console.log("Edit message error:", error);

//     return NextResponse.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }
