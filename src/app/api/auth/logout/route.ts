import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middlewares/withAuth";

export async function POST(req: NextRequest) {
  // Check who is making the request using the Bearer token or cookie
  const userOrResponse = await withAuth(req);
  
  // If they aren't authenticated, they can't log out
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse;
  }

  const user = userOrResponse;

  const response = NextResponse.json({ 
    success: true, 
    message: `User ${user.email} logged out successfully`,
    user: user
  });
  
  // Remove the token cookie (for browser users)
  response.cookies.delete("token");

  return response;
}

export async function GET(req: NextRequest) {
  return POST(req);
}
