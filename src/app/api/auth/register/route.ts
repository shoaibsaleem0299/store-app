import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.profile.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const user = await prisma.profile.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        fullName,
        role: "customer",
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true, data: { user: { id: user.id, email: user.email } } });

    response.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
  }
}
