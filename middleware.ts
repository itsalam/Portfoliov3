import { NextRequest, NextResponse } from "next/server";
import { CARD_MENU_GROUP } from "./components/Grid/consts";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Example: Redirect all dynamic routes to a specific URL
  const baseName = pathname.split("/")[1];
  const allowedBaseNames = [
    "_next",
    "icon.svg",
    "static",
    "favicon.svg",
    "studio",
  ];

  if (allowedBaseNames.includes(baseName)) {
    return NextResponse.next();
  } else if (baseName && !(baseName in CARD_MENU_GROUP)) {
    return NextResponse.redirect(new URL("/", request.url));
  } else {
    NextResponse.next();
  }
  // Example: Handle custom logic for dynamic routes
  // You can also manipulate the request or response here

  // If no custom logic is needed, return NextResponse.next()
}

export const config = {
  // Specify which paths to apply this middleware to
  matcher: ["/:path*"],
};
