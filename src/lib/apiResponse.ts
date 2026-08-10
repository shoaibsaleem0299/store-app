import { NextResponse } from "next/server";

export function respond({ status, body }: { status: number; body: any }) {
  return NextResponse.json(body, { status });
}
