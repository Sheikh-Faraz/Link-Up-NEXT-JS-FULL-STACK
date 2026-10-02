import { NextRequest, NextResponse } from "next/server";
import type { Types } from "mongoose";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/getCurrentUser";


export async function GET(req: NextRequest) {
  try {

    // 🔹 Get logged in user using reusable helper
    const currentUser = await getCurrentUser(req);

    // 🔹 Populate blocked + deleted users
    const user = await User.findById(currentUser._id)
      .populate("blockedUsers", "UserId fullName profilePic email about")
      .populate("isDeletedFor", "UserId fullName profilePic email about");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    // 🔹 Combine blocked + deleted lists
    const hiddenUsersSet = new Set<string>();

    type PopulatedRef = { _id: Types.ObjectId | string };

    user.blockedUsers.forEach((u: PopulatedRef) =>
      hiddenUsersSet.add(u._id.toString())
    );

    user.isDeletedFor.forEach((u: PopulatedRef) =>
      hiddenUsersSet.add(u._id.toString())
    );

    // 🔹 Fetch full user objects
    const hiddenUsers = await User.find({
      _id: { $in: Array.from(hiddenUsersSet) },
    }).select("UserId fullName profilePic email about blockedUsers isDeletedFor");

    return NextResponse.json(hiddenUsers);

  } catch (error) {
    console.error("Get hidden/blocked users error:", error);

    return NextResponse.json(
      { message:"Server error" },
    );
  }
}
