import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup");

  // 🔒 If accessing protected route without token
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔒 If logged in user tries to access login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🔒 Optional: verify token
  if (token) {
    const valid = verifyToken(token);
    if (!valid) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

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
