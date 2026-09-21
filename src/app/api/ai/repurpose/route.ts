import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { repurposeContent } from "@/lib/ai/repurpose-agent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sourceText = body.sourceText || body.source_text;
    if (!sourceText) {
      return NextResponse.json({ success: false, error: "Missing sourceText" }, { status: 400 });
    }

    const targetPlatforms = body.targetPlatforms || body.target_platforms || ["facebook", "instagram", "tiktok", "lemon8", "x"];

    const result = await repurposeContent({
      sourceText,
      sourceType: body.sourceType || body.source_type || "caption",
      targetPlatforms
    });

    db.saveRepurposed(result);
    db.logAudit("REPURPOSE_CONTENT", "REPURPOSED_CONTENT", result.id, `Repurposed content for ${Object.keys(result.outputs).length} platforms`);

    return NextResponse.json({ success: true, repurposed: result, outputs: result.outputs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
