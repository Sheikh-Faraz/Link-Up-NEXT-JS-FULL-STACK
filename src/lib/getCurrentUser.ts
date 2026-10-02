import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import connectDB from "./db";
import User from "@/models/User";

export const getCurrentUser = async (req: NextRequest) => {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("Unauthorized");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  const decoded = verifyToken(token) as { userId: string };

  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");

  return user;
};
