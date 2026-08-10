import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export async function withAuth(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  
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
