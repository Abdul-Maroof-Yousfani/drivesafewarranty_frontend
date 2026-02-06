import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { apiUrl } from "@/lib/actions/constants";

export async function POST(req: NextRequest) {
  try {
    const token = await getAccessToken();
    const incoming = await req.formData();
    const fd = new FormData();
    const file = incoming.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { status: false, message: "No file provided" },
        { status: 400 }
      );
    }
    const name = (file as any).name || "upload";
    fd.append("file", file, name);

    const res = await fetch(apiUrl("/upload/single?category=logos"), {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd,
    });

    const json = await res.json();
    if (!json.status) {
      return NextResponse.json(json, { status: res.status });
    }
    const rawUrl = json.data?.url as string | undefined;
    const url = rawUrl
      ? /^https?:\/\//i.test(rawUrl)
        ? (() => {
            try {
              const u = new URL(rawUrl);
              u.pathname = u.pathname.replace(
                /^\/api(?=\/(uploads|dealer-storage|dealers|master)(\/|$))/,
                ""
              );
              return u.toString();
            } catch {
              return rawUrl;
            }
          })()
        : rawUrl.startsWith("/")
        ? rawUrl
        : `/${rawUrl}`
      : apiUrl(`/upload/${json.data?.id}/download`);

    return NextResponse.json({ status: true, data: { ...json.data, url } });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
