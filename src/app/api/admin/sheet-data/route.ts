import { NextRequest, NextResponse } from "next/server";

const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";
const VIDEO_SHEET_GID = "0";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  if (url.searchParams.get("secret") === secret) return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${VIDEO_SHEET_GID}`;
  const resp = await fetch(url, { cache: "no-store" });

  if (!resp.ok) {
    return NextResponse.json(
      { error: `Google Sheets returned ${resp.status}` },
      { status: 502 }
    );
  }

  const csv = await resp.text();
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
