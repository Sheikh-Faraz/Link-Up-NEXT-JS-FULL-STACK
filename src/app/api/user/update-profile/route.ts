import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import User from "@/models/User";
import connectDB from "@/lib/db";
import path from "path";
import { writeFile } from "fs/promises";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(req);

    const formData = await req.formData();

    const fullName = formData.get("fullName") as string;
    const about = formData.get("about") as string;
    const file = formData.get("profilePic") as File | null;

    let profilePicPath: string | undefined;

    // 🔹 Handle file upload (if exists)
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads");
      const filePath = path.join(uploadDir, file.name);

      await writeFile(filePath, buffer);

      profilePicPath = `/uploads/${file.name}`;
    }

    const updatedData: { fullName?: string; about?: string; profilePic?: string } = {
      fullName,
      about,
    };

    if (profilePicPath) {
      updatedData.profilePic = profilePicPath;
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      updatedData,
      { new: true }
    ).select("-passwordHash");

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
