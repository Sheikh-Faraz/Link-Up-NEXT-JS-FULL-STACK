import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function DELETE(req: NextRequest, { params } : { params: Promise<{id: string}> }) {
  try {

    // 🔹 Logged-in user (from JWT)
    const currentUser = await getCurrentUser(req);

    // This is the id of the targetedUser/ user to delete
    const { id } = await params; // user to delete (ObjectId)

    if (!currentUser) {

      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 🔹 Avoid duplicate entries
    if (!currentUser.isDeletedFor.includes(id)) {
      currentUser.isDeletedFor.push(id);
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
