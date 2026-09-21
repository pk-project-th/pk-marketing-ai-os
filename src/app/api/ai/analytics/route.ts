import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeMarketingPerformance } from "@/lib/ai/analytics-agent";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const brand = url.searchParams.get("brand");
    let reports = db.getAnalytics();
    if (brand && brand !== "all") {
      reports = reports.filter(r => r.brand_name?.toLowerCase().includes(brand.toLowerCase()) || r.title?.toLowerCase().includes(brand.toLowerCase()));
    }
    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const report = await analyzeMarketingPerformance({
      title: body.title || `รายงานสถิติ — ${body.brand_name || "ภาพรวม"}`,
      brand_name: body.brand_name,
      period: body.period || "ปัจจุบัน",
      dataSource: body.dataSource || "MANUAL",
      metrics: body.metrics,
      notes: body.notes
    });
    db.saveAnalytics(report);
    db.logAudit("ANALYZE_PERFORMANCE", "ANALYTICS_REPORT", report.id, `Generated 9-point diagnostic for ${report.title}`);

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing report id" }, { status: 400 });
    }
    db.deleteAnalytics(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
