import { useEffect, useState } from "react";
import { Container, Typography, Grid, Paper, TextField } from "@mui/material";
import Header from "./components/Header";
import UploadCard from "./components/UploadCard";
import ChatPanel from "./components/ChatPanel";
import { createWorkspace } from "./lib/api";

export default function App() {
  const [ws, setWs] = useState("demo");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setStatus("Creating workspace…"); await createWorkspace(ws); setStatus(null); }
      catch (e: any) { setStatus(e?.message || "Failed to create workspace"); }
    })();
  }, [ws]);

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ mb: 4 }}>
          PDF <span style={{ color: "#1976d2" }}>Chat</span> Studio
        </Typography>

        <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
          <Typography variant="caption" color="text.secondary">Workspace</Typography>
          <TextField fullWidth value={ws} onChange={(e) => setWs(e.target.value)} size="small" sx={{ mt: 0.5 }} />
          {status && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>{status}</Typography>}
        </Paper>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={5}><UploadCard workspace={ws} /></Grid>
          <Grid item xs={12} md={7}><ChatPanel workspace={ws} /></Grid>
        </Grid>
      </Container>
    </>
  );
}
