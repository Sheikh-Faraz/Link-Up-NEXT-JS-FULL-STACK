import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔹 Generate UserId like: SGH-15A-456987
function generateUserId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  const part1 = Array.from({ length: 3 }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join("");

  const part2 = `${digits[Math.floor(Math.random() * 10)]}${
    digits[Math.floor(Math.random() * 10)]
  }${letters[Math.floor(Math.random() * letters.length)]}`;

  const part3 = Array.from({ length: 6 }, () =>
    digits[Math.floor(Math.random() * 10)]
  ).join("");

  return `${part1}-${part2}-${part3}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { token } = body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return NextResponse.json(
        { message: "Invalid Google token" },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await User.findOne({ email: payload.email });

    // Create user if not exists
    if (!user) {
      let UserId;
      let exists = true;

      while (exists) {
        UserId = generateUserId();
        exists = !!(await User.findOne({ UserId }));
      }

      user = await User.create({
        UserId,
        email: payload.email,
        fullName: payload.name,
        provider: "google",
        profilePic: payload.picture,
      });
    }

    // Generate JWT
    const jwtToken = generateToken(user._id);

    return NextResponse.json({
      token: jwtToken,
      user,
    });

  } catch (error) {
    console.error("Google login error:", error);

    return NextResponse.json(
      { message: "Google login failed" },
      { status: 500 }
    );
  }
}