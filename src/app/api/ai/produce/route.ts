import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { produceContentPackage } from "@/lib/ai/production-agent";

export async function GET() {
  try {
    const assets = db.getAssets();
    return NextResponse.json({ success: true, assets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.idea) {
      return NextResponse.json({ success: false, error: "Missing required 'idea' object" }, { status: 400 });
    }

    const asset = await produceContentPackage({
      idea: body.idea,
      framework: body.framework || "PAS"
    });

    db.saveAsset(asset);
    db.updateIdeaStatus(body.idea.id, "AI_GENERATED");
    db.logAudit("PRODUCE_CONTENT", "CONTENT_ASSET", asset.id, `Produced package for '${body.idea.title}' using framework ${asset.framework}`);

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
