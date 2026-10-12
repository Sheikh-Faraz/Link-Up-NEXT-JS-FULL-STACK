
// import { NextRequest, NextResponse } from "next/server";
// import { getCurrentUser } from "@/lib/getCurrentUser";
// import { pusher } from "@/lib/pusher";

// export async function POST(req: NextRequest) {
//   try {
//     const currentUser = await getCurrentUser(req);
//     const formData = await req.formData();

//     const socketId = String(formData.get("socket_id") ?? "");
//     const channelName = String(formData.get("channel_name") ?? "");
//     const currentUserId = String(currentUser._id);

//     if (!socketId || !channelName.startsWith("presence-chat-")) {
//       return NextResponse.json(
//         { message: "Invalid Pusher authorization request" },
//         { status: 400 }
//       );
//     }

//     const chatId = channelName.slice("presence-chat-".length);
//     const participants = chatId.split("-");

//     if (
//       participants.length !== 2 ||
//       !participants.includes(currentUserId)
//     ) {
//       return NextResponse.json(
//         { message: "Not authorized for this conversation" },
//         { status: 403 }
//       );
//     }

//     const authResponse = pusher.authorizeChannel(
//       socketId,
//       channelName,
//       {
//         user_id: currentUserId,
//         user_info: {},
//       }
//     );

//     return NextResponse.json(authResponse);
//   } catch (error) {
//     console.error("Pusher auth error:", error);

//     return NextResponse.json(
//       { message: "Pusher authorization failed" },
//       { status: 401 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { pusher } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    const formData = await req.formData();

    const socketId = String(formData.get("socket_id") ?? "");
    const channelName = String(formData.get("channel_name") ?? "");
    const currentUserId = String(currentUser._id);

    if (!socketId || !channelName.startsWith("presence-chat-")) {
      return NextResponse.json(
        { message: "Invalid Pusher authorization request" },
        { status: 400 }
      );
    }

    const chatId = channelName.slice("presence-chat-".length);
    const participants = chatId.split("-");

    if (
      participants.length !== 2 ||
      !participants.every((id) => mongoose.isValidObjectId(id)) ||
      !participants.includes(currentUserId)
    ) {
      return NextResponse.json(
        { message: "Not authorized for this conversation" },
        { status: 403 }
      );
    }

    const authResponse = pusher.authorizeChannel(
      socketId,
      channelName,
      {
        user_id: currentUserId,
        user_info: {},
      }
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher authorization error:", error);

    return NextResponse.json(
      { message: "Pusher authorization failed" },
      { status: 401 }
    );
  }
}