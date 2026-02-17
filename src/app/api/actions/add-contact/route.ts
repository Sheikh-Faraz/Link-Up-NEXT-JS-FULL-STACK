import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Contact from "@/models/Contact";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 🔹 Get token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // 🔹 Verify token
    const decoded = verifyToken(token) as { userId: string };
    const currentUserId = decoded.userId;

    const body = await req.json();
    const { targetUserId } = body;

    // 🔹 Find target user by custom UserId
    const targetUser = await User.findOne({ UserId: targetUserId });
    if (!targetUser)
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );

    // 🔹 Prevent self add
    if (targetUser._id.toString() === currentUserId) {
      return NextResponse.json(
        { message: "You cannot add yourself" },
        { status: 400 }
      );
    }

    // 🔹 Check if already added
    const existing = await Contact.findOne({
      user: currentUserId,
      contact: targetUser._id,
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already added this user" },
        { status: 400 }
      );
    }

    // 🔹 Create two-way contact
    await Contact.create({
      user: currentUserId,
      contact: targetUser._id,
    });

    await Contact.create({
      user: targetUser._id,
      contact: currentUserId,
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
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
