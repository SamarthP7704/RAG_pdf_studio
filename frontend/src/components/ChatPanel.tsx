import { Card, CardContent, Stack, TextField, Button, Typography, Grid, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CitationCard from "./CitationCard";
import { useState } from "react";
import { chat } from "../lib/api";

type Hit = { source: string; page: number; score: number; text: string };

export default function ChatPanel({ workspace }: { workspace: string }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [cites, setCites] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);

  async function onAsk() {
    if (!q.trim()) return;
    setBusy(true); setAnswer(""); setCites([]);
    try {
      const r = await chat(workspace, q.trim());
      setAnswer(r.answer || "");
      setCites(r.citations || []);
    } catch (e: any) {
      setAnswer(e?.message || "Request failed");
    } finally { setBusy(false); }
  }

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={1}>
          <TextField fullWidth placeholder="Ask your docs…" value={q}
            onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAsk()} />
          <Button variant="contained" onClick={onAsk} disabled={busy} endIcon={<SendIcon />}>Ask</Button>
        </Stack>

        {answer && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>Answer</Typography>
            <Paper variant="outlined" sx={{ p: 2, whiteSpace: "pre-wrap" }}>{answer}</Paper>
          </>
        )}

        {!!cites.length && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }} color="text.secondary">Citations</Typography>
            <Grid container spacing={1.5}>
              {cites.map((h, i) => (
                <Grid item xs={12} sm={6} key={i}><CitationCard hit={h} /></Grid>
              ))}
            </Grid>
          </>
        )}

        {busy && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Searching…</Typography>}
      </CardContent>
    </Card>
  );
}
