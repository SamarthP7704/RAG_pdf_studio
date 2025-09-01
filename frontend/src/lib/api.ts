export const API = import.meta.env.VITE_API || "http://localhost:8000";

export async function createWorkspace(name: string) {
  const fd = new FormData();
  fd.append("name", name);
  const r = await fetch(`${API}/workspaces`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function uploadPDF(workspace: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${API}/workspaces/${workspace}/upload`, {
    method: "POST",
    body: fd,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function chat(workspace: string, message: string) {
  const r = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspace_id: workspace, message }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
