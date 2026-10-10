import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { timestamp, folder } = await req.json();

    if (!timestamp || !folder) {
      return NextResponse.json(
        { message: "timestamp and folder are required" },
        { status: 400 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: "Cloudinary environment variables are missing" },
        { status: 500 }
      );
    }

    const signature = crypto
      .createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    });
    
  } catch (error) {
    
    console.error("Cloudinary signature error:", error);
    return NextResponse.json(
      { message: "Failed to create Cloudinary signature" },
      { status: 500 }
    );

  }
}