import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const targetServer = url.searchParams.get("server") || process.env.STUDIO_API_URL || "http://127.0.0.1:8200";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${targetServer.replace(/\/$/, "")}/health`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        online: true,
        server: targetServer,
        data
      });
    } else {
      return NextResponse.json({
        success: false,
        online: false,
        server: targetServer,
        status: res.status
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      online: false,
      server: targetServer,
      error: error.message
    });
  }
}
