import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    return NextResponse.json(user);

  } catch (error){
    console.error("Get user info error:", error);
    
    return NextResponse.json(
          { message: "Server error" },
          { status: 500 }
    );

  }
}
