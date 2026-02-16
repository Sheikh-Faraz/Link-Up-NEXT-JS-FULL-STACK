import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

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
    const { email, password, fullName } = body;

    // 🔹 Check if user exists
    // let existingUser = await User.findOne({ email });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // 🔹 Generate unique UserId
    let UserId;
    let exists = true;

    while (exists) {
      UserId = generateUserId();
    //   exists = await User.findOne({ UserId });
      const user = await User.findOne({ UserId });
      exists = !!user; // ✅ convert to true/false

    }

    // 🔹 Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 🔹 Create user
    const user = await User.create({
      UserId,
      email,
      passwordHash,
      fullName,
      provider: "local",
    });

    // 🔹 Generate JWT
    const token = generateToken(user._id);

    return NextResponse.json({
      token,
      user,
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
