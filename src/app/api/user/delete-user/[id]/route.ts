import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function DELETE(req: NextRequest, params : Promise<{id: string}>) {
  try {

    // 🔹 Logged-in user (from JWT)
    const currentUser = await getCurrentUser(req);

    // const { id: targetUserId } = await params; // user to delete (ObjectId)
    const { id } = await params; // user to delete (ObjectId)
    const targetUserId  = id; // user to delete (ObjectId)

    if (!currentUser) {
      console.log("This is the current user message failed 404 console");

      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 🔹 Avoid duplicate entries
    if (!currentUser.isDeletedFor.includes(targetUserId)) {
      currentUser.isDeletedFor.push(targetUserId);
      await currentUser.save();
    }

    return NextResponse.json({
      message: "User deleted for you",
    });

  } catch (error) {
    console.error("Delete user error:", error);

    return NextResponse.json(
      { message: "Server Error"},
      { status: 500 }
    );
  }
}
