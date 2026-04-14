import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/google-sheets";

const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";
const VERIFIED_SHEET = "Verified Database";

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
    const body = await request.json();
    const { rows } = body as {
      rows: {
        set_id: string;
        question_number: string;
        quiz_mode: string;
        question_text: string;
        correct_answer: string;
        wrong_answer_1: string;
        wrong_answer_2: string;
        wrong_answer_3: string;
        youtube_title: string;
        youtube_url: string;
        video_url: string;
        patreon_url: string;
        flags?: string;
      }[];
    };

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    const accessToken = await getAccessToken(email, privateKey);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // 1. Read all existing rows from the Verified Database tab
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(VERIFIED_SHEET + "!A:M")}`;
    const readResp = await fetch(readUrl, { headers: { Authorization: `Bearer ${accessToken}` } });

    let existingRows: string[][] = [];

    if (readResp.ok) {
      const readData = await readResp.json();
      const allValues: string[][] = readData.values || [];
      if (allValues.length > 0) {
        existingRows = allValues.slice(1);
      }
    }

    // 2. Build a lookup from incoming rows keyed by set_id + question_number
    const incomingMap = new Map<string, string[]>();
    for (const r of rows) {
      const key = `${r.set_id}|${r.question_number}`;
      incomingMap.set(key, [
        r.set_id,
        r.question_number,
        r.quiz_mode,
        r.question_text,
        r.correct_answer,
        r.wrong_answer_1 || "",
        r.wrong_answer_2 || "",
        r.wrong_answer_3 || "",
        r.youtube_title || "",
        r.youtube_url || "",
        r.video_url,
        r.flags || "",
        r.patreon_url || "",
      ]);
    }

    // 3. Replace matching rows in-place (col A = set_id, col B = question_number)
    let replacedCount = 0;
    const allRows = existingRows.map((row) => {
      const key = `${(row[0] || "").trim()}|${(row[1] || "").trim()}`;
      if (incomingMap.has(key)) {
        replacedCount++;
        const updated = incomingMap.get(key)!;
        incomingMap.delete(key);
        return updated;
      }
      return row;
    });

    // Append any incoming rows that didn't match an existing row
    for (const newRow of incomingMap.values()) {
      allRows.push(newRow);
    }

    // 4. Clear everything below the header
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(VERIFIED_SHEET + "!A2:M10000")}:clear`;
    await fetch(clearUrl, { method: "POST", headers });

    // 5. Write all rows back in the same order
    if (allRows.length > 0) {
      const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(VERIFIED_SHEET + "!A2")}?valueInputOption=USER_ENTERED`;
      const writeResp = await fetch(writeUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify({ values: allRows }),
      });

      if (!writeResp.ok) {
        const err = await writeResp.text();
        return NextResponse.json(
          { error: "Sheet write failed: " + err },
          { status: 500 }
        );
      }
    }

    const incomingSetIds = new Set(rows.map((r) => r.set_id));
    return NextResponse.json({
      success: true,
      rows_replaced: replacedCount,
      rows_appended: rows.length - replacedCount,
      total_rows: allRows.length,
      replaced_set_ids: Array.from(incomingSetIds),
    });
  } catch (error) {
    console.error("Verify question error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
