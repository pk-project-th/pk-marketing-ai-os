import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateContentIdeas, getLastFailoverMeta } from "@/lib/ai/idea-agent";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const stage = url.searchParams.get("stage");
    const status = url.searchParams.get("status");

    let ideas = db.getIdeas();

    if (stage) {
      ideas = ideas.filter(i => (i as any).pipeline_stage === stage);
    }
    if (status) {
      ideas = ideas.filter(i => i.status === status);
    }

    return NextResponse.json({ success: true, ideas });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support client-to-server idea synchronization
    if (body.syncIdeas && Array.isArray(body.syncIdeas)) {
      const saved = db.saveIdeas(body.syncIdeas);
      return NextResponse.json({ success: true, count: saved.length, ideas: saved });
    }

    const generated = await generateContentIdeas(body);
    const failoverMeta = getLastFailoverMeta();
    
    // Save to database
    const saved = db.saveIdeas(generated);
    db.logAudit(
      "GENERATE_IDEAS",
      "CONTENT_IDEA",
      `batch-${Date.now()}`,
      `Generated ${saved.length} ideas (Engine: ${failoverMeta.modelUsed || body.aiEngine || "AI"}, Failover: ${failoverMeta.isFailover ? "YES" : "NO"})`
    );

    return NextResponse.json({ success: true, ideas: saved, meta: failoverMeta });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing idea id" }, { status: 400 });
    }

    let updated = null;

    if (action === "ACCEPT") {
      updated = db.updateIdea(id, {
        status: "ACCEPTED",
        pipeline_stage: "MEDIA"
      });
      db.logAudit("ACCEPT_IDEA", "CONTENT_IDEA", id, "Accepted idea and forwarded to Step 2: Media Studio");
    } else if (action === "REJECT") {
      updated = db.updateIdea(id, {
        status: "REJECTED"
      });
      db.logAudit("REJECT_IDEA", "CONTENT_IDEA", id, "Rejected idea");
    } else if (action === "ADVANCE_STAGE") {
      const nextStage = updates?.pipeline_stage || "REPURPOSE";
      updated = db.updateIdea(id, {
        pipeline_stage: nextStage,
        ...(updates || {})
      });
      db.logAudit("ADVANCE_STAGE", "CONTENT_IDEA", id, `Advanced idea to stage: ${nextStage}`);
    } else if (updates) {
      updated = db.updateIdea(id, updates);
    }

    return NextResponse.json({ success: true, idea: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing idea id" }, { status: 400 });
    }

    db.deleteIdea(id);
    db.logAudit("DELETE_IDEA", "CONTENT_IDEA", id, "Deleted idea");

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
