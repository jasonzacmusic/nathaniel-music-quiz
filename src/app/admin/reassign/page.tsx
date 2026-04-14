"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SheetRow {
  set_id: string;
  question_number: string;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  video_url: string;
  quiz_mode: string;
  youtube_title: string;
  youtube_url: string;
  "Patreon Link": string;
}

type QuestionStatus = "unverified" | "correct" | "reassigned";

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

export default function ReassignPage() {
  const [allRows, setAllRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [selectedSet, setSelectedSet] = useState<string>("");
  const [setQuestions, setSetQuestions] = useState<SheetRow[]>([]);
  const [statuses, setStatuses] = useState<Record<number, QuestionStatus>>({});
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const cachedRows = useRef<SheetRow[]>([]);

  const getToken = () => sessionStorage.getItem("admin_token") || "";

  const fetchData = useCallback(async () => {
    if (cachedRows.current.length > 0) return cachedRows.current;
    setLoading(true);
    try {
      const resp = await fetch("/api/admin/sheet-data", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resp.status === 401) { window.location.href = "/admin"; return []; }
      if (!resp.ok) throw new Error("Failed to fetch");
      const text = await resp.text();
      const rows = parseCSV(text).filter(
        (r) => r.set_id && r.question_text && r.correct_answer
      ) as unknown as SheetRow[];
      cachedRows.current = rows;
      setAllRows(rows);
      return rows;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Group by set_id
  const setMap = new Map<string, SheetRow[]>();
  for (const r of allRows) {
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, []);
    setMap.get(r.set_id)!.push(r);
  }
  const setIds = Array.from(setMap.keys()).sort();

  const selectSet = useCallback((setId: string) => {
    setSelectedSet(setId);
    const questions = (setMap.get(setId) || []).sort(
      (a, b) => (parseInt(a.question_number) || 0) - (parseInt(b.question_number) || 0)
    );
    setSetQuestions(questions);
    setStatuses({});
    setOverrides({});
    setPreviewUrl("");
    setSaveStatus("idle");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows]);

  // All video URLs in this set (from the original main sheet)
  const availableVideos = setQuestions.map((q) => q.video_url).filter(Boolean);

  const getEffectiveUrl = (i: number) => {
    if (statuses[i] === "reassigned" && overrides[i]) return overrides[i];
    if (statuses[i] === "correct") return setQuestions[i].video_url;
    return "";
  };

  const markCorrect = (i: number) => {
    setStatuses((prev) => ({ ...prev, [i]: "correct" }));
    setOverrides((prev) => { const n = { ...prev }; delete n[i]; return n; });
  };

  const markUnverified = (i: number) => {
    setStatuses((prev) => { const n = { ...prev }; delete n[i]; return n; });
    setOverrides((prev) => { const n = { ...prev }; delete n[i]; return n; });
  };

  const reassign = (i: number, url: string) => {
    setStatuses((prev) => ({ ...prev, [i]: "reassigned" }));
    setOverrides((prev) => ({ ...prev, [i]: url }));
  };

  useEffect(() => {
    if (videoRef.current && previewUrl) {
      videoRef.current.src = previewUrl;
      videoRef.current.load();
    }
  }, [previewUrl]);

  const verifiedCount = Object.values(statuses).filter((s) => s === "correct" || s === "reassigned").length;

  // Check for duplicate video assignments among verified questions
  const assignedUrls = setQuestions
    .map((_, i) => getEffectiveUrl(i))
    .filter((u) => u);
  const hasDuplicates = new Set(assignedUrls).size < assignedUrls.length;

  const seedDatabase = useCallback(async () => {
    if (!confirm("This will clear the Verified Database tab and seed it with all rows from the main sheet (with empty video URLs and WRONG_VIDEO flags). Continue?")) return;
    setSeeding(true);
    try {
      const resp = await fetch("/api/admin/seed-verified", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Seed failed");
      alert(`Seeded ${data.rows_seeded} rows into Verified Database.`);
    } catch (e) {
      alert("Error: " + (e as Error).message);
    } finally {
      setSeeding(false);
    }
  }, []);

  const saveAssignments = useCallback(async () => {
    // Build rows: all data from the main sheet
    // Verified questions get video_url filled in, flag cleared
    // Unverified questions keep video_url empty, flag = WRONG_VIDEO
    const rows = setQuestions.map((q, i) => {
      const status = statuses[i] || "unverified";
      const isVerified = status === "correct" || status === "reassigned";
      const videoUrl = status === "reassigned" ? (overrides[i] || "") : (isVerified ? q.video_url : "");

      return {
        set_id: q.set_id,
        question_number: q.question_number,
        quiz_mode: q.quiz_mode,
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        wrong_answer_1: q.wrong_answer_1 || "",
        wrong_answer_2: q.wrong_answer_2 || "",
        wrong_answer_3: q.wrong_answer_3 || "",
        youtube_title: q.youtube_title || "",
        youtube_url: q.youtube_url || "",
        video_url: videoUrl,
        patreon_url: q["Patreon Link"] || "",
        flags: isVerified ? "" : "WRONG_VIDEO",
      };
    });

    setSaveStatus("saving");
    try {
      const resp = await fetch("/api/admin/verify-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ rows }),
      });
      if (!resp.ok) throw new Error("Save failed");
      setSaveStatus("done");
    } catch {
      setSaveStatus("error");
    }
  }, [setQuestions, statuses, overrides]);

  return (
    <>
      <style>{`
        .r-root { position: fixed; inset: 0; z-index: 9999; background: #0a0a0f; color: #e2e2e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; flex-direction: column; overflow: hidden; }
        .r-header { padding: 14px 24px; border-bottom: 1px solid #1e1e2e; display: flex; align-items: center; gap: 14px; flex-shrink: 0; flex-wrap: wrap; }
        .r-header h1 { font-size: 18px; font-weight: 600; }
        .r-select { background: #16161e; border: 1px solid #2a2a3a; color: #e2e2e8; padding: 7px 12px; border-radius: 6px; font-size: 14px; min-width: 200px; outline: none; }
        .r-select:focus { border-color: #7c3aed; }
        .r-btn { padding: 7px 14px; border-radius: 6px; border: none; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .r-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .r-btn-green { background: #16a34a; color: white; }
        .r-btn-green:hover:not(:disabled) { background: #15803d; }
        .r-btn-amber { background: #d97706; color: white; }
        .r-btn-amber:hover:not(:disabled) { background: #b45309; }
        .r-body { flex: 1; display: flex; overflow: hidden; }
        .r-list { flex: 1; overflow-y: auto; padding: 20px; }
        .r-preview { width: 400px; border-left: 1px solid #1e1e2e; display: flex; flex-direction: column; flex-shrink: 0; }
        .r-preview-label { padding: 10px 14px; font-size: 12px; color: #666; border-bottom: 1px solid #1e1e2e; background: #0a0a0f; }
        .r-preview-video { flex: 1; display: flex; align-items: center; justify-content: center; background: #000; }
        .r-preview-video video { max-width: 100%; max-height: 100%; }
        .r-preview-empty { display: flex; align-items: center; justify-content: center; flex: 1; color: #444; font-size: 13px; text-align: center; padding: 20px; line-height: 1.6; }
        .r-preview-btns { padding: 10px 14px; border-top: 1px solid #1e1e2e; background: #0a0a0f; display: flex; gap: 6px; flex-wrap: wrap; }
        .r-preview-chip { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; cursor: pointer; border: 1px solid #2a2a3a; background: #16161e; color: #aaa; transition: all 0.1s; }
        .r-preview-chip:hover { border-color: #7c3aed; color: #e2e2e8; }
        .r-preview-chip.active { border-color: #7c3aed; background: #7c3aed22; color: #c4b5fd; }

        .r-row { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; border: 1px solid #1e1e2e; border-radius: 10px; margin-bottom: 10px; background: #0f0f18; transition: all 0.15s; }
        .r-row.status-correct { border-color: #22c55e33; background: #0a1a10; }
        .r-row.status-reassigned { border-color: #7c3aed33; background: #12101f; }
        .r-row.has-dup { border-color: #ef444466; }

        .r-qnum { font-weight: 700; font-size: 14px; min-width: 32px; padding-top: 2px; }
        .r-qnum-unverified { color: #555; }
        .r-qnum-correct { color: #22c55e; }
        .r-qnum-reassigned { color: #7c3aed; }

        .r-qinfo { flex: 1; min-width: 0; }
        .r-qtext { font-size: 14px; line-height: 1.5; margin-bottom: 4px; }
        .r-qanswer { font-size: 12px; color: #22c55e; margin-bottom: 10px; }

        .r-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .r-btn-correct { background: #16a34a; color: white; padding: 6px 14px; font-size: 12px; }
        .r-btn-correct:hover { background: #15803d; }
        .r-btn-correct.active { background: #22c55e; box-shadow: 0 0 10px #22c55e44; }
        .r-btn-undo { background: #2a2a3a; color: #aaa; padding: 6px 10px; font-size: 12px; }
        .r-btn-undo:hover { background: #3a3a4a; }
        .r-btn-play { background: #2a2a3a; border: none; color: #ccc; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; white-space: nowrap; }
        .r-btn-play:hover { background: #3a3a4a; }
        .r-btn-play.active { background: #7c3aed33; color: #c4b5fd; }

        .r-or { color: #444; font-size: 12px; }

        .r-reassign-select { background: #16161e; border: 1px solid #2a2a3a; color: #e2e2e8; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-family: monospace; outline: none; min-width: 180px; }
        .r-reassign-select:focus { border-color: #7c3aed; }

        .r-status-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-left: 8px; }
        .r-tag-correct { background: #22c55e22; color: #22c55e; }
        .r-tag-reassigned { background: #7c3aed22; color: #c4b5fd; }
        .r-tag-unverified { background: #33333344; color: #666; }
        .r-tag-dup { background: #ef444422; color: #fca5a5; }

        .r-original { font-size: 11px; color: #444; font-family: monospace; margin-top: 6px; }

        .r-footer { padding: 12px 24px; border-top: 1px solid #1e1e2e; background: #0f0f18; display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
        .r-footer-info { font-size: 13px; color: #888; }
        .r-spacer { flex: 1; }
        .r-status-msg { font-size: 13px; }
        .r-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; color: #555; font-size: 15px; text-align: center; padding: 40px; line-height: 1.7; gap: 20px; }
        .r-link { color: #7c3aed; text-decoration: none; font-size: 13px; }
        .r-link:hover { text-decoration: underline; }
      `}</style>

      <div className="r-root">
        <div className="r-header">
          <h1>Reassign Videos</h1>
          <select
            className="r-select"
            value={selectedSet}
            onChange={(e) => selectSet(e.target.value)}
          >
            <option value="">Select a set...</option>
            {setIds.map((id) => (
              <option key={id} value={id}>
                {id} ({setMap.get(id)!.length} questions)
              </option>
            ))}
          </select>
          <a className="r-link" href="/admin/audit">Audit Tool</a>
          <div className="r-spacer" />
          <button
            className="r-btn r-btn-amber"
            disabled={seeding}
            onClick={seedDatabase}
          >
            {seeding ? "Seeding..." : "Seed Verified Database"}
          </button>
          {loading && <span style={{ fontSize: 13, color: "#888" }}>Loading...</span>}
        </div>

        <div className="r-body">
          {!selectedSet ? (
            <div className="r-empty">
              <div>
                Select a set to start verifying and reassigning videos.
                <br />
                All questions start as <strong>unverified</strong>.
                <br />
                Click <strong>Correct</strong> to keep the original video, or pick a different one from the dropdown.
              </div>
              <div style={{ fontSize: 13, color: "#666", borderTop: "1px solid #1e1e2e", paddingTop: 16 }}>
                First time? Click <strong>Seed Verified Database</strong> in the top right to populate
                <br />
                the Verified Database tab with all questions (flagged as WRONG_VIDEO).
              </div>
            </div>
          ) : (
            <>
              <div className="r-list">
                {setQuestions.map((q, i) => {
                  const status: QuestionStatus = statuses[i] || "unverified";
                  const effectiveUrl = getEffectiveUrl(i);
                  const isDuplicate =
                    effectiveUrl !== "" &&
                    setQuestions.some(
                      (_, j) => j !== i && getEffectiveUrl(j) === effectiveUrl
                    );

                  return (
                    <div
                      key={i}
                      className={`r-row status-${status} ${isDuplicate ? "has-dup" : ""}`}
                    >
                      <span className={`r-qnum r-qnum-${status}`}>
                        Q{q.question_number || i + 1}
                      </span>
                      <div className="r-qinfo">
                        <div className="r-qtext">
                          {q.question_text}
                          <span className={`r-status-tag r-tag-${status}`}>{status}</span>
                          {isDuplicate && <span className="r-status-tag r-tag-dup">duplicate</span>}
                        </div>
                        <div className="r-qanswer">Answer: {q.correct_answer}</div>

                        <div className="r-actions">
                          {status === "correct" ? (
                            <>
                              <button className="r-btn r-btn-correct active" disabled>Correct</button>
                              <button className="r-btn r-btn-undo" onClick={() => markUnverified(i)}>Undo</button>
                              <button
                                className={`r-btn-play ${previewUrl === q.video_url ? "active" : ""}`}
                                onClick={() => setPreviewUrl(q.video_url)}
                              >
                                Preview
                              </button>
                            </>
                          ) : status === "reassigned" ? (
                            <>
                              <select
                                className="r-reassign-select"
                                value={overrides[i] || ""}
                                onChange={(e) => reassign(i, e.target.value)}
                              >
                                {availableVideos.map((url) => {
                                  const fname = url.split("/").pop() || "";
                                  const usedBy = setQuestions.findIndex(
                                    (_, j) => j !== i && getEffectiveUrl(j) === url
                                  );
                                  return (
                                    <option key={url} value={url}>
                                      {fname}{usedBy >= 0 ? ` (Q${setQuestions[usedBy]?.question_number || usedBy + 1})` : ""}
                                    </option>
                                  );
                                })}
                              </select>
                              <button
                                className={`r-btn-play ${previewUrl === overrides[i] ? "active" : ""}`}
                                onClick={() => setPreviewUrl(overrides[i] || "")}
                              >
                                Preview
                              </button>
                              <button className="r-btn r-btn-undo" onClick={() => markUnverified(i)}>Undo</button>
                            </>
                          ) : (
                            <>
                              <button className="r-btn r-btn-correct" onClick={() => markCorrect(i)}>Correct</button>
                              <span className="r-or">or reassign:</span>
                              <select
                                className="r-reassign-select"
                                value=""
                                onChange={(e) => { if (e.target.value) reassign(i, e.target.value); }}
                              >
                                <option value="">Pick a video...</option>
                                {availableVideos.map((url) => {
                                  const fname = url.split("/").pop() || "";
                                  const usedBy = setQuestions.findIndex(
                                    (_, j) => j !== i && getEffectiveUrl(j) === url
                                  );
                                  return (
                                    <option key={url} value={url}>
                                      {fname}{usedBy >= 0 ? ` (Q${setQuestions[usedBy]?.question_number || usedBy + 1})` : ""}
                                    </option>
                                  );
                                })}
                              </select>
                              <button
                                className={`r-btn-play ${previewUrl === q.video_url ? "active" : ""}`}
                                onClick={() => setPreviewUrl(q.video_url)}
                              >
                                Preview
                              </button>
                            </>
                          )}
                        </div>

                        <div className="r-original">
                          Original: {q.video_url ? q.video_url.split("/").pop() : "(no video)"}
                          {status === "reassigned" && overrides[i] && (
                            <> &rarr; {overrides[i].split("/").pop()}</>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="r-preview">
                <div className="r-preview-label">
                  {previewUrl ? `Preview: ${previewUrl.split("/").pop()}` : "Video Preview"}
                </div>
                {previewUrl ? (
                  <div className="r-preview-video">
                    <video ref={videoRef} controls autoPlay loop />
                  </div>
                ) : (
                  <div className="r-preview-empty">
                    Click Preview on any question to play its video
                  </div>
                )}
                {selectedSet && availableVideos.length > 0 && (
                  <div className="r-preview-btns">
                    {availableVideos.map((url) => (
                      <button
                        key={url}
                        className={`r-preview-chip ${previewUrl === url ? "active" : ""}`}
                        onClick={() => setPreviewUrl(url)}
                      >
                        {url.split("/").pop()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {selectedSet && (
          <div className="r-footer">
            <span className="r-footer-info">
              {verifiedCount} / {setQuestions.length} verified
              {hasDuplicates && (
                <span style={{ color: "#ef4444", marginLeft: 8 }}>
                  — fix duplicates before saving
                </span>
              )}
            </span>
            <div className="r-spacer" />
            {saveStatus === "done" && (
              <span className="r-status-msg" style={{ color: "#22c55e" }}>Saved to Verified Database</span>
            )}
            {saveStatus === "error" && (
              <span className="r-status-msg" style={{ color: "#ef4444" }}>Save failed</span>
            )}
            {saveStatus === "saving" && (
              <span className="r-status-msg" style={{ color: "#f59e0b" }}>Saving...</span>
            )}
            <button
              className="r-btn r-btn-green"
              disabled={saveStatus === "saving" || hasDuplicates}
              onClick={saveAssignments}
            >
              Save to Verified Database
            </button>
          </div>
        )}
      </div>
    </>
  );
}
