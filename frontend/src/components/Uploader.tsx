import { useState } from "react";
import { uploadPDF } from "../lib/api";

export default function Uploader({ workspace }: { workspace: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await uploadPDF(workspace, f);
      setMsg(`Indexed ${res.chunks_added} chunks from ${f.name}`);
    } catch (err: any) {
      setMsg(err.message ?? "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="border rounded p-3">
      <input type="file" accept="application/pdf" onChange={onChange} />
      <div className="text-sm mt-2">{busy ? "Indexing…" : msg}</div>
    </div>
  );
}
