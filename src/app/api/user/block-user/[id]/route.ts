import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function PATCH( req: NextRequest, params : Promise<{ id: string }> ) {
  try {

    const currentUser = await getCurrentUser(req);

    // const { id: targetUserId } = await params;
    const { id } = await params;
    const targetUserId  = id;

    // 🔹 Prevent self block
    if (currentUser._id.toString() === targetUserId) {
      return NextResponse.json(
        { message: "You cannot block yourself" },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 🔹 Check if already blocked
    if (currentUser.blockedUsers.includes(targetUserId)) {
      return NextResponse.json(
        { message: "User already blocked" },
        { status: 400 }
      );
    }

    // 🔹 Add to blocked list
    currentUser.blockedUsers.push(targetUserId);
    await currentUser.save();

    return NextResponse.json({
      message: "User blocked successfully",
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
