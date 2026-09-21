import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractAndMapDocument } from "@/lib/ai/document-agent";
import { extractTextFromDocument } from "@/lib/parser";

export async function GET() {
  try {
    const documents = db.getDocuments();
    const templates = db.getFormTemplates();
    return NextResponse.json({ success: true, documents, templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename = "Document.pdf", fileType = "PDF", rawContent, base64Content, templateId } = body;

    let textToProcess = rawContent || "";

    if (base64Content) {
      const buffer = Buffer.from(base64Content, "base64");
      const parsed = extractTextFromDocument(buffer, filename);
      textToProcess = parsed.text;
    } else if (rawContent) {
      const parsed = extractTextFromDocument(rawContent, filename);
      textToProcess = parsed.text;
    }

    if (!textToProcess.trim()) {
      textToProcess = "Empty document or unreadable binary stream. Please paste text manually or check file format.";
    }

    const templates = db.getFormTemplates();
    const selectedTemplate = templates.find(t => t.id === templateId);

    const doc = await extractAndMapDocument(
      filename,
      fileType,
      textToProcess,
      selectedTemplate
    );

    db.saveDocument(doc);
    db.logAudit("EXTRACT_DOCUMENT", "DOCUMENT", doc.id, `Extracted ${doc.fields.length} fields from ${doc.filename}`);

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
