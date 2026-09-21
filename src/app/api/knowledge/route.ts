import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { KnowledgeDocument } from "@/types";

export async function GET() {
  try {
    const documents = db.getKnowledge();
    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, title, content, tags, verified } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, category, and content are required" },
        { status: 400 }
      );
    }

    const newDoc: KnowledgeDocument = {
      id: `kb-${Date.now()}`,
      category,
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      verified: verified !== undefined ? Boolean(verified) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const saved = db.saveKnowledge(newDoc);

    db.logAudit(
      "CREATE_KNOWLEDGE",
      "KNOWLEDGE",
      saved.id,
      `Added verified knowledge document: '${saved.title}' [${saved.category}]`,
      "Marketing Lead"
    );

    return NextResponse.json({ success: true, document: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
