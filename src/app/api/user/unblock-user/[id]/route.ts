import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { User } from "@/types/user.types";  


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const currentUser = await getCurrentUser(req);

    const { id } = await params;

    // 🔹 Check if user is actually blocked
    if (!currentUser.blockedUsers.includes(id)) {
      return NextResponse.json(
        { message: "User not in block list" },
        { status: 400 }
      );
    }

    // 🔹 Remove user from blocked list
    currentUser.blockedUsers = currentUser.blockedUsers.filter((uid: User) => uid.toString() !== id);

    await currentUser.save();

    return NextResponse.json({
      message: "User unblocked successfully",
      blockedUsers: currentUser.blockedUsers,
    });

  } catch (error) {
    console.error("Block user error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
