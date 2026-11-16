import { NextResponse } from "next/server";
import { getErrorMemories, recordErrorMemory, clearErrorMemories } from "@/lib/ai/error-memory";

export async function GET() {
  try {
    const memories = getErrorMemories();
    return NextResponse.json({ success: true, memories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "CLEAR") {
      clearErrorMemories(body.signature);
      return NextResponse.json({ success: true, memories: getErrorMemories() });
    }
    const entry = recordErrorMemory({
      category: body.category || "GOOGLE_FLOW",
      signature: body.signature || `manual:${Date.now()}`,
      message: body.message || "Unknown error",
      resolution: body.resolution || "บันทึกเพื่อหลีกเลี่ยงในครั้งถัดไป",
      cooldownMinutes: body.cooldownMinutes ?? 15
    });
    return NextResponse.json({ success: true, entry, memories: getErrorMemories() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
