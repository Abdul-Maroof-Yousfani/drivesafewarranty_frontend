import { NextResponse, NextRequest } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { apiUrl } from "@/lib/actions/constants";

export async function GET(req: NextRequest, ctx: any) {
  try {
    // In some Next.js versions `ctx.params` can be a Promise. Ensure it's unwrapped.
    const params = await (ctx?.params || {});

    const token = await getAccessToken();
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const stateId = params?.stateId;
    if (!stateId) {
      return NextResponse.json({ status: false, data: [], message: "stateId is required" }, { status: 400 });
    }

    const res = await fetch(apiUrl(`/cities/state/${stateId}`), { headers, cache: "no-store" });
    const json = await res.json();
    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json({ status: false, data: [], message: error?.message || "Failed to load cities" }, { status: 500 });
  }
}
