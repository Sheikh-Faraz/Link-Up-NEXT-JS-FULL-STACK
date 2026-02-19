import { NextRequest, NextResponse } from "next/server";
import Contact from "@/models/Contact";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);

    const body = await req.json();
    const { targetUserId } = body;

    // 🔹 Find target user
    const targetUser = await User.findOne({ UserId: targetUserId });
    if (!targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 🔹 Prevent self add
    if (targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { message: "You cannot add yourself" },
        { status: 400 }
      );
    }

    // 🔹 Check existing
    const existing = await Contact.findOne({
      user: currentUser._id,
      contact: targetUser._id,
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already added this user" },
        { status: 400 }
      );
    }

    // 🔹 Create two-way relation
    await Contact.create({
      user: currentUser._id,
      contact: targetUser._id,
    });

    await Contact.create({
      user: targetUser._id,
      contact: currentUser._id,
    });

    return NextResponse.json(
      {
        message: "Contact added successfully!",
        friend: {
          _id: targetUser._id,
          fullName: targetUser.fullName,
          email: targetUser.email,
          UserId: targetUser.UserId,
          profilePic: targetUser.profilePic,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Add contact error:", error);

    // if (error.message === "Unauthorized") {
    //   return NextResponse.json(
    //     { message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
