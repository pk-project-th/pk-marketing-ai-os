import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const url = new URL(req.url);
    const targetServer = url.searchParams.get("server") || process.env.STUDIO_API_URL || "http://127.0.0.1:8200";

    const res = await fetch(`${targetServer.replace(/\/$/, "")}/api/studio/status/${jobId}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Job not found or error (${res.status})` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
