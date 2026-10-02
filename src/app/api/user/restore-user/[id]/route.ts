import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser(req);

    const { id } = await params; // user you want to restore

    // Check if user is marked as deleted
    const index = currentUser.isDeletedFor.indexOf(id);

    if (index === -1) {
      return NextResponse.json(
        { message: "User is not deleted" },
        { status: 400 }
      );
    }

    // Remove from deleted list
    currentUser.isDeletedFor.splice(index, 1);
    await currentUser.save();

    return NextResponse.json({
      message: "User restored successfully",
    });

  } catch (error) {
    console.error("Restore user error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
