import { useState } from "react";
import { chat } from "../lib/api";

type Hit = { source: string; page: number; score: number; text: string };

export default function Chat({ workspace }: { workspace: string }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [cites, setCites] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);

  async function ask() {
    if (!q.trim()) return;
    setBusy(true);
    setAnswer("");
    setCites([]);
    try {
      const r = await chat(workspace, q.trim());
      setAnswer(r.answer ?? "");
      setCites(r.citations ?? []);
    } catch (e: any) {
      setAnswer(e.message ?? "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Ask your docs…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <button className="border rounded px-3 py-2" onClick={ask} disabled={busy}>
          {busy ? "Asking…" : "Ask"}
        </button>
      </div>

      {answer && (
        <div className="border rounded p-3 whitespace-pre-wrap">
          <div className="font-semibold mb-2">Answer</div>
          {answer}
          {!!cites.length && (
            <div className="mt-3 text-sm opacity-80">
              {cites.map((c, i) => (
                <div key={i}>
                  • {c.source}: p.{c.page} (score {c.score?.toFixed?.(3) ?? "—"})
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
