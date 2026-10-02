import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/getCurrentUser";

import { uploadToCloudinary } from "@/lib/cloudinary-upload";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(req);

    const formData = await req.formData();

    const fullName = formData.get("fullName")?.toString() || "";
    const about = formData.get("about")?.toString() || "";

    const file = formData.get("profilePic");

    let profilePicUrl: string | undefined;
    let profilePicPublicId: string | undefined;

    // ======================================================
    // PROFILE IMAGE UPLOAD
    // ======================================================
    //
    // If the user selected a new profile picture:
    //
    // File
    //   ↓
    // uploadToCloudinary()
    //   ↓
    // Cloudinary
    //   ↓
    // URL + public_id
    //
    // We then save those values in MongoDB.
    // ======================================================

    if (file instanceof File && file.size > 0) {
      // Only allow image files.
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            message: "Only image files are allowed",
          },
          {
            status: 400,
          }
        );
      }

      // console.log("Profile image upload:", {
      //   name: file.name,
      //   type: file.type,
      //   size: file.size,
      // });

      // Use the same Cloudinary helper that is already
      // working in your Blog CMS.
      const uploaded = await uploadToCloudinary(
        file, 
        "profile-pictures"
      );

      profilePicUrl = uploaded.url;
      profilePicPublicId = uploaded.public_id;

      console.log("Profile image uploaded:", {
        url: profilePicUrl,
        public_id: profilePicPublicId,
      });
    }

    // ======================================================
    // PREPARE USER DATA
    // ======================================================
    //
    // Name and about are always updated.
    //
    // Profile picture fields are only updated when a new
    // image was uploaded.
    // ======================================================

    const updatedData: {
      fullName: string;
      about: string;
      profilePic?: string;
      profilePicPublicId?: string;
    } = {
      fullName,
      about,
    };

    if (profilePicUrl && profilePicPublicId) {
      updatedData.profilePic = profilePicUrl;
      updatedData.profilePicPublicId = profilePicPublicId;
    }

    // ======================================================
    // UPDATE USER IN MONGODB
    // ======================================================

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      updatedData,
      {
        new: true,
      }
    ).select("-passwordHash");

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    // This will now print the actual Cloudinary error,
    // including any additional information returned by
    // Cloudinary.
    console.error("Update profile error:", error);

    return NextResponse.json(
      {
        message: "Server error",
        error:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}