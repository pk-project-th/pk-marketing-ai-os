import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compareMarketingHistoricalPerformance } from "@/lib/ai/analytics-agent";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const brand = url.searchParams.get("brand");
    let comparisons = db.getComparisons();
    if (brand && brand !== "all") {
      comparisons = comparisons.filter((c: any) => 
        (c.brand_name && c.brand_name.toLowerCase().includes(brand.toLowerCase()))
      );
    }
    return NextResponse.json({ success: true, comparisons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pastReportId, currentReportId, contextNotes, pastReportData, currentReportData } = body;

    const allReports = db.getAnalytics();
    const pastReport = pastReportData || allReports.find(r => r.id === pastReportId);
    const currentReport = currentReportData || allReports.find(r => r.id === currentReportId);

    if (!pastReport || !currentReport) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุรายงานช่วงในอดีตและช่วงปัจจุบันให้ครบถ้วนเพื่อทำการเปรียบเทียบ" },
        { status: 400 }
      );
    }

    const comparisonResult = await compareMarketingHistoricalPerformance({
      brand_name: pastReport.brand_name || currentReport.brand_name || "ภาพรวม",
      pastReport,
      currentReport,
      contextNotes
    });

    db.saveComparison(comparisonResult);
    db.logAudit(
      "HISTORICAL_COMPARISON",
      "ANALYTICS_REPORT",
      comparisonResult.id,
      `Comparative diagnosis: ${pastReport.period} vs ${currentReport.period}`
    );

    return NextResponse.json({ success: true, comparison: comparisonResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
