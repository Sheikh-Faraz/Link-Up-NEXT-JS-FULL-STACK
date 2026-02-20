import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/getCurrentUser";


export async function PATCH( req: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {

    const user = await getCurrentUser(req);
    const userId = user._id.toString();

    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    const message = await Message.findById(id);

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Optional security check
    if (message.sender.toString() !== userId) {
      return NextResponse.json(
        { message: "Not allowed" },
        { status: 403 }
      );
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      {
        text: content,
        isEdited: true,
      },
      { new: true }
    );

    return NextResponse.json(updatedMessage);

  } catch (error) {
    console.log("Edit message error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
