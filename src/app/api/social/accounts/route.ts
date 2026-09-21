import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SocialPageAccount } from "@/types";

export async function GET() {
  try {
    const accounts = db.getSocialAccounts();
    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, page_id, brand_name, page_name, platform, access_token, status, auto_sync_enabled } = body;

    if (action === "DELETE") {
      const deleted = db.deleteSocialAccount(id || page_id);
      return NextResponse.json({ success: true, deleted });
    }

    const newOrUpdated: SocialPageAccount = {
      id: id || `soc-${Date.now()}`,
      brand_name: brand_name || "เพจหลัก",
      platform: platform || "facebook",
      page_name: page_name || brand_name || "เพจโซเชียล",
      page_id: page_id || `page-${Date.now()}`,
      access_token: access_token || "",
      status: status || (access_token && access_token.trim().length > 10 ? "CONNECTED" : "SIMULATED"),
      last_synced_at: body.last_synced_at || new Date().toISOString(),
      auto_sync_enabled: auto_sync_enabled ?? true
    };

    const saved = db.saveSocialAccount(newOrUpdated);
    db.logAudit("UPDATE_SOCIAL_ACCOUNT", "SOCIAL_PAGE", saved.page_id, `Updated page connection for ${saved.brand_name}`);

    return NextResponse.json({ success: true, account: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
