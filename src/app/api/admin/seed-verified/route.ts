import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/google-sheets";

const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";
const ORIGINAL_GID = "0";
const VERIFIED_SHEET = "Verified Database";

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQuotes = !inQuotes; current += ch; }
    else if (ch === "\n" && !inQuotes) { lines.push(current); current = ""; }
    else { current += ch; }
  }
  if (current.trim()) lines.push(current);
  if (lines.length < 2) return [];

  function parseFields(line: string): string[] {
    const fields: string[] = [];
    let val = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (q && line[i + 1] === '"') { val += '"'; i++; } else { q = !q; } }
      else if (ch === "," && !q) { fields.push(val); val = ""; }
      else { val += ch; }
    }
    fields.push(val);
    return fields;
  }

  const headers = parseFields(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let r = 1; r < lines.length; r++) {
    if (!lines[r].trim()) continue;
    const values = parseFields(lines[r]);
    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      if (headers[c]) row[headers[c]] = (values[c] || "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  if (url.searchParams.get("secret") === secret) return true;
  return false;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    return NextResponse.json(
      { error: "Google Sheets credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // 1. Fetch all rows from the original sheet (GID 0)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${ORIGINAL_GID}`;
    const csvResp = await fetch(csvUrl, { cache: "no-store" });
    if (!csvResp.ok) {
      return NextResponse.json(
        { error: `Failed to fetch original sheet: ${csvResp.status}` },
        { status: 502 }
      );
    }

    const csvText = await csvResp.text();
    const records = parseCSV(csvText).filter(
      (r) => r.set_id && r.question_text && r.correct_answer
    );

    if (records.length === 0) {
      return NextResponse.json({ error: "No valid rows found in original sheet" }, { status: 400 });
    }

    // 2. Build rows for Verified Database:
    //    All data present EXCEPT video_url (empty) + FLAGS = WRONG_VIDEO
    const values = records.map((r) => [
      r.set_id || "",
      r.question_number || "",
      r.quiz_mode || "",
      r.question_text || "",
      r.correct_answer || "",
      r.wrong_answer_1 || "",
      r.wrong_answer_2 || "",
      r.wrong_answer_3 || "",
      r.youtube_title || "",
      r.youtube_url || "",
      "",              // video_url — left empty
      "WRONG_VIDEO",   // FLAGS
      r["Patreon Link"] || "",
    ]);

    const accessToken = await getAccessToken(email, privateKey);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // 3. Clear the Verified Database tab (keep header row)
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(VERIFIED_SHEET + "!A2:M10000")}:clear`;
    await fetch(clearUrl, { method: "POST", headers });

    // 4. Write all seeded rows
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(VERIFIED_SHEET + "!A2")}?valueInputOption=USER_ENTERED`;
    const writeResp = await fetch(writeUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({ values }),
    });

    if (!writeResp.ok) {
      const err = await writeResp.text();
      return NextResponse.json(
        { error: "Sheet write failed: " + err },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rows_seeded: values.length,
      message: `Seeded ${values.length} rows into "${VERIFIED_SHEET}" with WRONG_VIDEO flags`,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
