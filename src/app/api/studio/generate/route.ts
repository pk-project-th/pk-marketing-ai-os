import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, orientation = "VERTICAL", studioUrl } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ success: false, error: "Topic is required" }, { status: 400 });
    }

    const targetServer = studioUrl || process.env.STUDIO_API_URL || "http://127.0.0.1:8200";

    const res = await fetch(`${targetServer.replace(/\/$/, "")}/api/studio/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({ topic, orientation })
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: `Studio Error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
