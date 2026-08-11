import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export async function withAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = bearerToken || req.cookies.get("token")?.value;
  
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    return user;
  } catch (err) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
}
