import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "src", "data", "flow-projects.json");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

interface FlowCloudProject {
  id: string;
  toolId: string;
  name: string;
  aspectRatio?: string;
  updatedAt: number;
  data: any;
}

function readProjects(): FlowCloudProject[] {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: FlowCloudProject[]) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    // Keep up to 30 most recent projects
    const trimmed = projects
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 30);
    fs.writeFileSync(STORE_PATH, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.error("[flow-projects] write error:", err);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const toolId = searchParams.get("toolId");
    const all = readProjects();
    const filtered = toolId ? all.filter((p) => p.toolId === toolId) : all;
    return NextResponse.json(
      { success: true, projects: filtered },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project = body.project || body;
    const toolId = String(body.toolId || project?.toolId || "pk-commercial-studio");
    const id = String(project?.id || `proj_${Date.now()}`);
    const name = String(project?.name || project?.title || "Untitled Project");

    const all = readProjects();
    const entry: FlowCloudProject = {
      id,
      toolId,
      name,
      aspectRatio: project?.aspectRatio || "9:16",
      updatedAt: Date.now(),
      data: project
    };

    const next = [entry, ...all.filter((p) => !(p.id === id && p.toolId === toolId))];
    writeProjects(next);

    return NextResponse.json(
      { success: true, id, count: next.filter((p) => p.toolId === toolId).length },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const toolId = searchParams.get("toolId");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const all = readProjects();
    const next = all.filter((p) => !(p.id === id && (!toolId || p.toolId === toolId)));
    writeProjects(next);
    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
