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

type Verdict = "ok" | "bad";

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);
  if (lines.length < 2) return [];

  function parseFields(line: string): string[] {
    const fields: string[] = [];
    let val = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          q = !q;
        }
      } else if (ch === "," && !q) {
        fields.push(val);
        val = "";
      } else {
        val += ch;
      }
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

export default function AuditPage() {
  const [allRows, setAllRows] = useState<SheetRow[]>([]);
  const [setQuestions, setSetQuestions] = useState<SheetRow[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [verdicts, setVerdicts] = useState<Record<number, Verdict>>({});
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"empty" | "overview" | "audit" | "summary">("empty");
  const videoRef = useRef<HTMLVideoElement>(null);
  const cachedRows = useRef<SheetRow[]>([]);

  const getToken = () => sessionStorage.getItem("admin_token") || "";

  const fetchSheetData = useCallback(async (): Promise<SheetRow[]> => {
    if (cachedRows.current.length > 0) return cachedRows.current;
    const resp = await fetch("/api/admin/sheet-data", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (resp.status === 401) { window.location.href = "/admin"; return []; }
    if (!resp.ok) throw new Error("Failed to fetch sheet data: " + resp.status);
    const text = await resp.text();
    const rows = parseCSV(text).filter(
      (r) => r.set_id && r.question_text && r.correct_answer && r.video_url
    ) as unknown as SheetRow[];
    cachedRows.current = rows;
    setAllRows(rows);
    return rows;
  }, []);

  // Group rows by set_id
  const setMap = new Map<string, SheetRow[]>();
  for (const r of allRows) {
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, []);
    setMap.get(r.set_id)!.push(r);
  }

  const loadAllSets = useCallback(async () => {
    setLoading(true);
    try {
      await fetchSheetData();
      setView("overview");
    } catch (e) {
      alert("Error: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchSheetData]);

  const loadSet = useCallback(
    async (setId?: string) => {
      const id = setId || inputValue.trim();
      if (!id) return;
      setLoading(true);
      try {
        const rows = await fetchSheetData();
        const questions = rows
          .filter((r) => r.set_id === id)
          .sort(
            (a, b) => (parseInt(a.question_number) || 0) - (parseInt(b.question_number) || 0)
          );
        if (questions.length === 0) {
          alert(`No questions found for set "${id}".`);
          return;
        }
        setSetQuestions(questions);
        setVerdicts({});
        setPushStatus("idle");
        setCurrentIdx(0);
        setView("audit");
        setInputValue(id);
      } catch (e) {
        alert("Error: " + (e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [inputValue, fetchSheetData]
  );

  // Update video when question changes
  useEffect(() => {
    if (view === "audit" && videoRef.current && setQuestions[currentIdx]) {
      videoRef.current.src = setQuestions[currentIdx].video_url;
      videoRef.current.load();
    }
  }, [currentIdx, view, setQuestions]);

  const [pushStatus, setPushStatus] = useState<"idle" | "pushing" | "done" | "error">("idle");

  // Push ALL rows in original order — correct ones as-is, wrong ones flagged
  const pushVerifiedRows = useCallback(
    async (finalVerdicts: Record<number, Verdict>) => {
      const allRows = setQuestions.map((row, i) => {
        const isCorrect = finalVerdicts[i] === "ok";
        return {
          set_id: row.set_id,
          question_number: row.question_number,
          quiz_mode: row.quiz_mode,
          question_text: isCorrect ? row.question_text : "",
          correct_answer: isCorrect ? row.correct_answer : "",
          wrong_answer_1: isCorrect ? (row.wrong_answer_1 || "") : "",
          wrong_answer_2: isCorrect ? (row.wrong_answer_2 || "") : "",
          wrong_answer_3: isCorrect ? (row.wrong_answer_3 || "") : "",
          youtube_title: isCorrect ? (row.youtube_title || "") : "",
          youtube_url: isCorrect ? (row.youtube_url || "") : "",
          video_url: isCorrect ? row.video_url : "",
          patreon_url: isCorrect ? (row["Patreon Link"] || "") : "",
          flags: isCorrect ? "" : "WRONG_VIDEO",
        };
      });

      setPushStatus("pushing");
      try {
        const resp = await fetch("/api/admin/verify-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ rows: allRows }),
        });
        if (!resp.ok) throw new Error("Push failed");
        setPushStatus("done");
      } catch {
        setPushStatus("error");
      }
    },
    [setQuestions]
  );

  const markQuestion = useCallback(
    (verdict: Verdict) => {
      const newVerdicts = { ...verdicts, [currentIdx]: verdict };
      setVerdicts(newVerdicts);

      if (currentIdx < setQuestions.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        // All reviewed — push correct rows in order, then show summary
        if (Object.keys(newVerdicts).length >= setQuestions.length) {
          pushVerifiedRows(newVerdicts);
          setView("summary");
        }
      }
    },
    [currentIdx, setQuestions.length, verdicts, pushVerifiedRows]
  );

  const navigate = useCallback(
    (dir: number) => {
      const next = currentIdx + dir;
      if (next >= 0 && next < setQuestions.length) {
        setCurrentIdx(next);
      }
    },
    [currentIdx, setQuestions.length]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (view !== "audit" || setQuestions.length === 0) return;
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      switch (e.key) {
        case "ArrowLeft":
          navigate(-1);
          break;
        case "ArrowRight":
          navigate(1);
          break;
        case "c":
        case "C":
          markQuestion("ok");
          break;
        case "x":
        case "X":
          markQuestion("bad");
          break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [view, setQuestions.length, navigate, markQuestion]);

  const exportResults = useCallback(() => {
    const setId = setQuestions[0]?.set_id || "unknown";
    const lines = ["set_id,question_number,question_text,video_url,verdict"];
    for (let i = 0; i < setQuestions.length; i++) {
      const q = setQuestions[i];
      const v = verdicts[i] || "skipped";
      lines.push(
        `"${q.set_id}","${q.question_number}","${q.question_text.replace(/"/g, '""')}","${q.video_url}","${v}"`
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `audit-${setId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [setQuestions, verdicts]);

  // Stats
  const reviewed = Object.keys(verdicts).length;
  const okCount = Object.values(verdicts).filter((v) => v === "ok").length;
  const badCount = Object.values(verdicts).filter((v) => v === "bad").length;
  const q = setQuestions[currentIdx];

  const wrongAnswers = q
    ? [q.wrong_answer_1, q.wrong_answer_2, q.wrong_answer_3].filter((a) => a?.trim())
    : [];

  // Summary data
  const mismatches = setQuestions
    .map((question, index) => ({ question, index }))
    .filter((m) => verdicts[m.index] === "bad");

  return (
    <>
      <style>{`
        .audit-root { position: fixed; inset: 0; z-index: 9999; background: #0a0a0f; color: #e2e2e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; flex-direction: column; overflow: hidden; }
        .a-header { padding: 16px 24px; border-bottom: 1px solid #1e1e2e; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; flex-shrink: 0; }
        .a-header h1 { font-size: 18px; font-weight: 600; white-space: nowrap; }
        .a-controls { display: flex; gap: 8px; align-items: center; }
        .a-input { background: #16161e; border: 1px solid #2a2a3a; color: #e2e2e8; padding: 7px 12px; border-radius: 6px; font-size: 14px; width: 180px; outline: none; }
        .a-input:focus { border-color: #7c3aed; }
        .a-btn { padding: 7px 14px; border-radius: 6px; border: none; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .a-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .a-btn-purple { background: #7c3aed; color: white; }
        .a-btn-purple:hover:not(:disabled) { background: #6d28d9; }
        .a-btn-green { background: #16a34a; color: white; padding: 9px 20px; font-size: 14px; }
        .a-btn-green:hover { background: #15803d; }
        .a-btn-red { background: #dc2626; color: white; padding: 9px 20px; font-size: 14px; }
        .a-btn-red:hover { background: #b91c1c; }
        .a-btn-nav { background: #2a2a3a; color: #ccc; }
        .a-btn-nav:hover:not(:disabled) { background: #3a3a4a; }
        .a-btn-blue { background: #0ea5e9; color: white; }
        .a-btn-blue:hover { background: #0284c7; }
        .a-status { padding: 10px 24px; background: #12121a; border-bottom: 1px solid #1e1e2e; display: flex; align-items: center; gap: 14px; font-size: 13px; color: #888; flex-shrink: 0; }
        .a-progress { flex: 1; height: 5px; background: #1e1e2e; border-radius: 3px; overflow: hidden; max-width: 360px; }
        .a-progress-fill { height: 100%; background: #7c3aed; border-radius: 3px; transition: width 0.3s; }
        .a-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
        .a-body { flex: 1; display: flex; overflow: hidden; }
        .a-sidebar { width: 250px; border-right: 1px solid #1e1e2e; overflow-y: auto; flex-shrink: 0; }
        .a-side-item { padding: 9px 14px; border-bottom: 1px solid #1a1a28; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px; transition: background 0.1s; }
        .a-side-item:hover { background: #1a1a28; }
        .a-side-item.active { background: #1e1a30; border-left: 3px solid #7c3aed; }
        .a-qnum { font-weight: 600; color: #7c3aed; min-width: 34px; }
        .a-qtxt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; color: #aaa; }
        .a-qdot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .a-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .a-split { flex: 1; display: flex; overflow: hidden; }
        .a-video { flex: 1; display: flex; flex-direction: column; background: #000; }
        .a-video-label { padding: 8px 14px; font-size: 12px; color: #666; background: #0a0a0f; border-bottom: 1px solid #1e1e2e; }
        .a-video-box { flex: 1; display: flex; align-items: center; justify-content: center; }
        .a-video-box video { max-width: 100%; max-height: 100%; }
        .a-question { flex: 1; display: flex; flex-direction: column; border-left: 1px solid #1e1e2e; }
        .a-q-label { padding: 8px 14px; font-size: 12px; color: #666; background: #0a0a0f; border-bottom: 1px solid #1e1e2e; }
        .a-q-body { flex: 1; padding: 20px; overflow-y: auto; }
        .a-q-text { font-size: 17px; font-weight: 500; line-height: 1.5; margin-bottom: 20px; }
        .a-answer-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #22c55e; margin-bottom: 5px; }
        .a-answer { font-size: 15px; font-weight: 500; color: #22c55e; padding: 10px 14px; background: #0f2a1a; border: 1px solid #1a4a2a; border-radius: 8px; margin-bottom: 16px; }
        .a-wrong-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-bottom: 5px; }
        .a-wrong-items { display: flex; flex-wrap: wrap; gap: 6px; }
        .a-wrong-item { font-size: 13px; color: #888; padding: 5px 10px; background: #16161e; border: 1px solid #2a2a3a; border-radius: 6px; }
        .a-url { margin-top: 16px; padding: 8px 10px; background: #16161e; border: 1px solid #2a2a3a; border-radius: 6px; font-size: 11px; color: #555; word-break: break-all; font-family: monospace; }
        .a-actions { padding: 12px 20px; border-top: 1px solid #1e1e2e; background: #0f0f18; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .a-spacer { flex: 1; }
        .a-keys { font-size: 11px; color: #555; }
        .a-key { display: inline-block; padding: 1px 5px; background: #1e1e2e; border: 1px solid #333; border-radius: 3px; font-family: monospace; font-size: 11px; margin: 0 2px; }
        .a-empty { display: flex; align-items: center; justify-content: center; flex: 1; color: #555; font-size: 15px; text-align: center; padding: 40px; line-height: 1.7; }
        .a-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .a-card { padding: 14px; background: #16161e; border: 1px solid #2a2a3a; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .a-card:hover { border-color: #7c3aed; background: #1a1a2e; }
        .a-card-name { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
        .a-card-meta { font-size: 12px; color: #888; }
        .a-overview { padding: 28px; overflow-y: auto; flex: 1; }
        .a-overview h2 { font-size: 18px; margin-bottom: 14px; }
        .a-summary { padding: 28px; max-width: 680px; margin: 0 auto; overflow-y: auto; flex: 1; }
        .a-summary h2 { font-size: 20px; margin-bottom: 14px; }
        .a-sum-stats { display: flex; gap: 16px; margin-bottom: 20px; }
        .a-sum-box { padding: 14px; background: #16161e; border: 1px solid #2a2a3a; border-radius: 8px; flex: 1; text-align: center; }
        .a-sum-num { font-size: 26px; font-weight: 700; }
        .a-sum-label { font-size: 12px; color: #888; margin-top: 3px; }
        .a-pattern { padding: 14px; background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 8px; margin-bottom: 16px; }
        .a-pattern h3 { font-size: 14px; color: #7c3aed; margin-bottom: 6px; }
        .a-pattern p { font-size: 13px; color: #aaa; }
        .a-mis-list { list-style: none; padding: 0; }
        .a-mis-list li { padding: 7px 0; border-bottom: 1px solid #1a1a28; font-size: 13px; display: flex; gap: 8px; }
        .a-mis-id { color: #ef4444; font-weight: 600; min-width: 38px; }
        .a-pushed { font-size: 12px; color: #22c55e; margin-left: auto; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      <div className="audit-root">
        <div className="a-header">
          <h1>Video Quiz Audit</h1>
          <div className="a-controls">
            <input
              className="a-input"
              type="text"
              placeholder="Set ID (e.g. piano-006)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadSet()}
            />
            <button
              className="a-btn a-btn-purple"
              disabled={loading}
              onClick={() => loadSet()}
            >
              {loading ? "Loading..." : "Load Set"}
            </button>
            <button
              className="a-btn a-btn-purple"
              disabled={loading}
              onClick={loadAllSets}
            >
              {loading ? "Loading..." : "Load All Sets"}
            </button>
          </div>
          {view === "audit" && (
            <button className="a-btn a-btn-blue" onClick={exportResults}>
              Export CSV
            </button>
          )}
        </div>

        {/* Status bar */}
        {(view === "audit" || view === "summary") && (
          <div className="a-status">
            <span>
              Q {currentIdx + 1} / {setQuestions.length}
            </span>
            <div className="a-progress">
              <div
                className="a-progress-fill"
                style={{
                  width: `${setQuestions.length > 0 ? (reviewed / setQuestions.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span>
              <span className="a-dot" style={{ background: "#22c55e" }} />
              {okCount}
            </span>
            <span>
              <span className="a-dot" style={{ background: "#ef4444" }} />
              {badCount}
            </span>
            <span>
              <span className="a-dot" style={{ background: "#666" }} />
              {setQuestions.length - reviewed}
            </span>
            {pushStatus === "pushing" && (
              <span style={{ color: "#f59e0b", fontSize: 12 }}>Pushing to sheet...</span>
            )}
            {pushStatus === "done" && (
              <span className="a-pushed">{okCount} rows pushed to Verified Database</span>
            )}
            {pushStatus === "error" && (
              <span style={{ color: "#ef4444", fontSize: 12 }}>Push failed — try exporting CSV instead</span>
            )}
          </div>
        )}

        <div className="a-body">
          {/* Sidebar */}
          {view === "audit" && (
            <div className="a-sidebar">
              {setQuestions.map((sq, i) => {
                const v = verdicts[i];
                const dotColor =
                  v === "ok" ? "#22c55e" : v === "bad" ? "#ef4444" : "#333";
                return (
                  <div
                    key={i}
                    className={`a-side-item ${i === currentIdx ? "active" : ""}`}
                    onClick={() => setCurrentIdx(i)}
                  >
                    <span className="a-qnum">Q{sq.question_number || i + 1}</span>
                    <span className="a-qtxt">{sq.question_text}</span>
                    <span className="a-qdot" style={{ background: dotColor }} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="a-content">
            {/* Empty state */}
            {view === "empty" && (
              <div className="a-empty">
                Enter a set ID and click Load to begin auditing.
                <br />
                Or click &quot;Load All Sets&quot; to see every video set.
              </div>
            )}

            {/* Set overview */}
            {view === "overview" && (
              <div className="a-overview">
                <h2>
                  All Video Sets ({setMap.size} sets, {allRows.length} questions)
                </h2>
                <div className="a-grid">
                  {Array.from(setMap.entries()).map(([id, qs]) => (
                    <div key={id} className="a-card" onClick={() => loadSet(id)}>
                      <div className="a-card-name">{id}</div>
                      <div className="a-card-meta">
                        {qs.length} questions &middot; {qs[0].quiz_mode || ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit view */}
            {view === "audit" && q && (
              <>
                <div className="a-split">
                  <div className="a-video">
                    <div className="a-video-label">
                      Video: {q.video_url.split("/").pop()} ({currentIdx + 1} /{" "}
                      {setQuestions.length})
                    </div>
                    <div className="a-video-box">
                      <video ref={videoRef} controls autoPlay loop />
                    </div>
                  </div>
                  <div className="a-question">
                    <div className="a-q-label">
                      Question {q.question_number || currentIdx + 1} &mdash; Set:{" "}
                      {q.set_id}
                    </div>
                    <div className="a-q-body">
                      <div className="a-q-text">{q.question_text}</div>
                      <div className="a-answer-label">Correct Answer</div>
                      <div className="a-answer">{q.correct_answer}</div>
                      {wrongAnswers.length > 0 && (
                        <>
                          <div className="a-wrong-label">Wrong Answers</div>
                          <div className="a-wrong-items">
                            {wrongAnswers.map((a, i) => (
                              <span key={i} className="a-wrong-item">
                                {a}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                      <div className="a-url">{q.video_url}</div>
                    </div>
                  </div>
                </div>
                <div className="a-actions">
                  <button
                    className="a-btn a-btn-nav"
                    disabled={currentIdx === 0}
                    onClick={() => navigate(-1)}
                  >
                    Prev
                  </button>
                  <button className="a-btn a-btn-green" onClick={() => markQuestion("ok")}>
                    Correct
                  </button>
                  <button className="a-btn a-btn-red" onClick={() => markQuestion("bad")}>
                    Wrong
                  </button>
                  <div className="a-spacer" />
                  <div className="a-keys">
                    <span className="a-key">&larr;</span> prev{" "}
                    <span className="a-key">&rarr;</span> next{" "}
                    <span className="a-key">C</span> correct{" "}
                    <span className="a-key">X</span> wrong
                  </div>
                  <button
                    className="a-btn a-btn-nav"
                    disabled={currentIdx === setQuestions.length - 1}
                    onClick={() => navigate(1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Summary view */}
            {view === "summary" && (
              <div className="a-summary">
                <h2>Audit Complete: {setQuestions[0]?.set_id}</h2>
                <div className="a-sum-stats">
                  <div className="a-sum-box">
                    <div className="a-sum-num" style={{ color: "#22c55e" }}>
                      {okCount}
                    </div>
                    <div className="a-sum-label">Correct</div>
                  </div>
                  <div className="a-sum-box">
                    <div className="a-sum-num" style={{ color: "#ef4444" }}>
                      {badCount}
                    </div>
                    <div className="a-sum-label">Mismatched</div>
                  </div>
                  <div className="a-sum-box">
                    <div className="a-sum-num">{setQuestions.length}</div>
                    <div className="a-sum-label">Total</div>
                  </div>
                </div>
                {mismatches.length > 0 && (
                  <div className="a-pattern">
                    {mismatches.length === setQuestions.length ? (
                      <>
                        <h3>Pattern: All Wrong</h3>
                        <p>
                          Every video is mismatched. The entire set may have been
                          uploaded in the wrong order.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3>Partial Mismatch</h3>
                        <p>
                          {mismatches.length} of {setQuestions.length} videos are
                          mismatched. Check if there is a shift pattern or if specific
                          clips were swapped.
                        </p>
                      </>
                    )}
                  </div>
                )}
                {mismatches.length > 0 ? (
                  <>
                    <h3 style={{ fontSize: 14, marginBottom: 10 }}>
                      Mismatched Questions
                    </h3>
                    <ul className="a-mis-list">
                      {mismatches.map((m) => (
                        <li key={m.index}>
                          <span className="a-mis-id">
                            Q{m.question.question_number || m.index + 1}
                          </span>
                          <span>
                            {m.question.question_text.length > 80
                              ? m.question.question_text.substring(0, 80) + "..."
                              : m.question.question_text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p style={{ color: "#22c55e", marginTop: 16 }}>
                    All videos match their questions.
                  </p>
                )}
                {pushStatus === "pushing" && (
                  <div className="a-pattern" style={{ borderColor: "#f59e0b44" }}>
                    <h3 style={{ color: "#f59e0b" }}>Pushing to Verified Database...</h3>
                    <p>{okCount} correct rows being saved in original sheet order.</p>
                  </div>
                )}
                {pushStatus === "done" && (
                  <div className="a-pattern" style={{ borderColor: "#22c55e44", background: "#0f2a1a" }}>
                    <h3 style={{ color: "#22c55e" }}>Pushed to Verified Database</h3>
                    <p>{okCount} rows saved in original sheet order.</p>
                  </div>
                )}
                {pushStatus === "error" && (
                  <div className="a-pattern" style={{ borderColor: "#ef444444" }}>
                    <h3 style={{ color: "#ef4444" }}>Push Failed</h3>
                    <p>Export CSV as backup and try again later.</p>
                  </div>
                )}
                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                  <button
                    className="a-btn a-btn-purple"
                    onClick={() => {
                      setCurrentIdx(0);
                      setPushStatus("idle");
                      setView("audit");
                    }}
                  >
                    Review Again
                  </button>
                  <button className="a-btn a-btn-blue" onClick={exportResults}>
                    Export Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
