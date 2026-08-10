import { NextResponse } from "next/server";

export function withErrorHandler(handler: (...args: any[]) => Promise<any>) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (err: any) {
      console.error(err);
      return NextResponse.json(
        { success: false, message: err.message ?? "Internal server error" },
        { status: 500 }
      );
    }
  };
}
