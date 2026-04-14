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

    // 1. Read all existing rows to find where each set_id+question_number lives
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(VERIFIED_SHEET + "!A:B")}`;
    const readResp = await fetch(readUrl, { headers: { Authorization: `Bearer ${accessToken}` } });

    // Map set_id|question_number → sheet row number (1-indexed, row 1 = header)
    const rowIndex = new Map<string, number>();
    // lastRow not needed — append API finds the end automatically

    if (readResp.ok) {
      const readData = await readResp.json();
      const allValues: string[][] = readData.values || [];
      // allValues[0] = header, allValues[1] = row 2, etc.
      for (let i = 1; i < allValues.length; i++) {
        const setId = (allValues[i]?.[0] || "").trim();
        const qNum = (allValues[i]?.[1] || "").trim();
        if (setId) rowIndex.set(`${setId}|${qNum}`, i + 1); // sheet row = i+1
      }
    }

    // 2. Build batch update data — each row targets its exact sheet position
    const batchData: { range: string; values: string[][] }[] = [];
    const appendRows: string[][] = [];
    let updatedCount = 0;

    for (const r of rows) {
      const rowData = [
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
      ];

      const key = `${r.set_id}|${r.question_number}`;
      const sheetRow = rowIndex.get(key);

      if (sheetRow) {
        // Update this exact row in-place
        batchData.push({
          range: `${VERIFIED_SHEET}!A${sheetRow}:M${sheetRow}`,
          values: [rowData],
        });
        updatedCount++;
      } else {
        appendRows.push(rowData);
      }
    }

    // 3. Batch update existing rows in-place (no clear, no rewrite)
    if (batchData.length > 0) {
      const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`;
      const batchResp = await fetch(batchUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          valueInputOption: "USER_ENTERED",
          data: batchData,
        }),
      });

      if (!batchResp.ok) {
        const err = await batchResp.text();
        return NextResponse.json(
          { error: "Batch update failed: " + err },
          { status: 500 }
        );
      }
    }

    // 4. Append any truly new rows that weren't in the sheet yet
    if (appendRows.length > 0) {
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(VERIFIED_SHEET + "!A:M")}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
      const appendResp = await fetch(appendUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ values: appendRows }),
      });

      if (!appendResp.ok) {
        const err = await appendResp.text();
        return NextResponse.json(
          { error: "Append failed: " + err },
          { status: 500 }
        );
      }
    }

    const incomingSetIds = new Set(rows.map((r) => r.set_id));
    return NextResponse.json({
      success: true,
      rows_updated: updatedCount,
      rows_appended: appendRows.length,
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
