import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { executeWorkflow } from "@/lib/adapters/n8n";

export async function GET() {
  try {
    const workflows = db.getWorkflows();
    const runs = db.getWorkflowRuns();
    return NextResponse.json({ success: true, workflows, runs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workflowId, slug, name, triggerType, payload } = body;

    const run = await executeWorkflow({
      workflowId: workflowId || "wf-manual",
      workflowSlug: slug || "manual-trigger",
      workflowName: name || "Manual Workflow Execution",
      triggerType: triggerType || "MANUAL",
      payload: payload || {}
    });

    db.logAudit("TRIGGER_WORKFLOW", "WORKFLOW", run.workflow_id, `Triggered workflow '${run.workflow_name}' (${run.status})`);

    return NextResponse.json({ success: true, run });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
