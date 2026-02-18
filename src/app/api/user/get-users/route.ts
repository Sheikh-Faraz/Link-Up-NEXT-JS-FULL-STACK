import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Contact from "@/models/Contact";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 🔹 Extract token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔹 Verify token
    const decoded = verifyToken(token) as { userId: string };
    const currentUserId = decoded.userId;

    // 1️⃣ Get logged-in user's deleted list
    const loggedInUser = await User.findById(currentUserId).select("isDeletedFor");

    if (!loggedInUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Get all contacts
    const contacts = await Contact.find({ user: currentUserId })
      .populate(
        "contact",
        "UserId fullName profilePic email about blockedUsers isDeletedFor"
      )
      .sort({ createdAt: -1 });

    // 3️⃣ Filter out deleted users
    const filteredContacts = contacts
      .map(c => c.contact)
      .filter(contact => !loggedInUser.isDeletedFor.includes(contact._id));
      
    // const filteredContacts = contacts
    //   .map((c: any) => c.contact)
    //   .filter((contact: any) =>
    //       !loggedInUser.isDeletedFor.includes(contact._id)
    //   );

    return NextResponse.json(filteredContacts);

  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
