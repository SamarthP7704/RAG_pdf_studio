import { useEffect, useState } from "react";
import Uploader from "../components/Uploader";
import Chat from "../components/Chat";
import { createWorkspace } from "../lib/api";

export default function Workspace() {
  const [ws, setWs] = useState<string>("demo");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await createWorkspace(ws);
      setReady(true);
    })();
  }, [ws]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">PDF Chat Studio</h1>
      <label className="text-sm">Workspace name</label>
      <input className="border p-2" value={ws} onChange={e=>setWs(e.target.value)} />
      {ready && <>
        <Uploader workspace={ws}/>
        <Chat workspace={ws}/>
      </>}
    </div>
  );
}
