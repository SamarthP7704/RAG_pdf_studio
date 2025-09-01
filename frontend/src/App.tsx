import { useEffect, useState } from "react";
import { createWorkspace } from "./lib/api";
import Uploader from "./components/Uploader";
import Chat from "./components/Chat";
import "./App.css";

export default function App() {
  const [ws, setWs] = useState("demo");
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMsg("Creating workspace…");
        await createWorkspace(ws);
        setReady(true);
        setMsg(null);
      } catch (e: any) {
        setMsg(e.message ?? "Failed to create workspace");
      }
    })();
  }, [ws]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">PDF Chat Studio</h1>

      <label className="text-sm">Workspace</label>
      <input
        className="border p-2 rounded w-full"
        value={ws}
        onChange={(e) => setWs(e.target.value)}
      />
      {msg && <div className="text-sm">{msg}</div>}

      {ready && (
        <>
          <Uploader workspace={ws} />
          <Chat workspace={ws} />
        </>
      )}
    </div>
  );
}
