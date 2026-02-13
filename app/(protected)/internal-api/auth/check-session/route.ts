import { NextResponse } from "next/server";
import { checkSession } from "@/lib/auth";

export async function GET() {
  const result = await checkSession();
  
  if (result.valid) {
    return NextResponse.json({ valid: true });
  }

  return NextResponse.json({ valid: false, reason: "session_expired" });
}
