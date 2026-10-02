// By the way gpt was saying something that the verify token will not work because next js middlware works in edge runtime for that we have to jose library

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;


  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  // 🔒 If accessing protected route without token
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔒 If logged in user tries to access login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Commented it out because of edge runtime issue, which causes infinite redirect loop.
  // 🔒 Optional: verify token
  // if (token) {
  //   const valid = verifyToken(token);
  //   if (!valid) {
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
};
