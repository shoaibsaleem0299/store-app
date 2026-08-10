import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export function withRole(allowedRoles: string[]) {
  return async (req: NextRequest) => {
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
      const user: any = jwt.verify(token, JWT_SECRET);
      
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ success: false, message: "Forbidden: Insufficient permissions" }, { status: 403 });
      }

      return user;
    } catch (err) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
  };
}
