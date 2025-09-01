import { Box, Card, CardContent, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useRef, useState } from "react";
import { uploadPDF } from "../lib/api";

export default function UploadCard({ workspace }: { workspace: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) { setStatus("Please choose a PDF file."); return; }
    setStatus("Indexing…");
    try {
      const res = await uploadPDF(workspace, file);
      setStatus(`Indexed ${res.chunks_added} chunks from ${file.name}`);
    } catch (e: any) {
      setStatus(e?.message || "Upload failed");
    }
  }

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          sx={{
            p: 3, textAlign: "center", cursor: "pointer", borderRadius: 2,
            border: "1px dashed", borderColor: dragOver ? "primary.main" : "divider",
            bgcolor: dragOver ? "action.hover" : "background.paper",
          }}
        >
          <CloudUploadIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Drag & drop a PDF, or click to browse</Typography>
          <Typography variant="caption" color="text.secondary">Files stay on your machine</Typography>
          <input ref={inputRef} type="file" accept="application/pdf" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.currentTarget.value = ""; }} />
        </Box>

        {status && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <InsertDriveFileIcon fontSize="small" />
            <Typography variant="body2">{status}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
