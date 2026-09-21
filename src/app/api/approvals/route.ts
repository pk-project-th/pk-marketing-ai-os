import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const platform = url.searchParams.get("platform");
    let approvals = db.getApprovals();
    if (platform && platform !== "all") {
      approvals = approvals.filter(a => (a.entity_type?.toLowerCase() === platform.toLowerCase() || (a as any).platform?.toLowerCase() === platform.toLowerCase()));
    }
    return NextResponse.json({ success: true, approvals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, action, reviewer, reason, content_preview, title } = body;

    // Support creation via POST
    if ((!action && !id) || action === "CREATE") {
      const newItem = db.createApproval({
        title: body.title,
        content_preview: body.content_preview,
        entity_type: body.entity_type || "CONTENT",
        entity_id: body.entity_id || `item-${Date.now()}`,
        source: body.source || "System",
        image_url: body.image_url,
        media_urls: body.media_urls,
        media_blueprint: body.media_blueprint,
        platform: body.platform,
        media_type: body.media_type,
        scheduled_at: body.scheduled_at,
        publish_mode: body.publish_mode || "MANUAL",
        recommended_time: body.recommended_time,
        connection_status: body.connection_status || "NOT_CONNECTED",
        brand_name: body.brand_name || "เพจหลัก",
        is_series: body.is_series || false,
        episode: body.episode,
        status: body.status || "HUMAN_REVIEW"
      });
      return NextResponse.json({ success: true, item: newItem, approval: newItem });
    }

    const existing = db.getApprovals().find((a) => a.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Approval item not found" }, { status: 404 });
    }

    if (action === "EXECUTE") {
      const updated = db.updateApprovalStatus(id, "EXECUTED", reviewer || "Marketing Lead");
      db.logAudit(
        "APPROVAL_EXECUTE",
        existing.entity_type,
        existing.entity_id,
        `Dispatched item '${existing.title}' to social publisher`,
        reviewer || "Marketing Lead"
      );
      return NextResponse.json({ success: true, approval: updated, item: updated });
    }

    if (action === "SCHEDULE") {
      const updated = db.updateApproval(id, {
        status: "SCHEDULED" as any,
        scheduled_at: body.scheduled_at,
        publish_mode: "AUTO",
        reviewed_by: reviewer || "User Approved",
        reviewed_at: new Date().toISOString()
      });
      db.logAudit(
        "APPROVAL_SCHEDULE",
        existing.entity_type,
        existing.entity_id,
        `Approved and scheduled post '${existing.title}' for ${body.scheduled_at}`,
        reviewer || "Marketing Lead"
      );
      return NextResponse.json({ success: true, approval: updated, item: updated });
    }

    if (action === "EDIT" || action === "UPDATE") {
      const updated = db.updateApproval(id, {
        ...(title ? { title } : {}),
        ...(content_preview ? { content_preview } : {}),
        ...(body.scheduled_at ? { scheduled_at: body.scheduled_at } : {}),
        ...(body.publish_mode ? { publish_mode: body.publish_mode } : {}),
        ...(body.connection_status ? { connection_status: body.connection_status } : {})
      });
      return NextResponse.json({ success: true, approval: updated, item: updated });
    }

    let newStatus = "APPROVED";
    if (action === "REJECT") newStatus = "REJECTED";

    const updated = db.updateApprovalStatus(id, newStatus, reviewer || "Marketing Lead", reason);
    return NextResponse.json({ success: true, approval: updated, item: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const newItem = db.createApproval({
      title: body.title,
      content_preview: body.content_preview,
      entity_type: body.entity_type || "CONTENT",
      entity_id: body.entity_id,
      source: body.source,
      image_url: body.image_url,
      media_urls: body.media_urls,
      media_blueprint: body.media_blueprint,
      platform: body.platform,
      media_type: body.media_type,
      scheduled_at: body.scheduled_at,
      publish_mode: body.publish_mode || "MANUAL",
      recommended_time: body.recommended_time,
      connection_status: body.connection_status || "NOT_CONNECTED",
      brand_name: body.brand_name || "เพจหลัก",
      is_series: body.is_series || false,
      episode: body.episode,
      status: body.status || "HUMAN_REVIEW"
    });
    return NextResponse.json({ success: true, approval: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const all = url.searchParams.get("all");

    if (all === "true") {
      const list = db.getApprovals();
      for (const item of list) {
        db.deleteApproval(item.id);
      }
      return NextResponse.json({ success: true, deletedAll: true, count: list.length });
    }

    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    db.deleteApproval(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
