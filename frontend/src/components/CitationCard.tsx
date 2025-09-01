import { Paper, Typography } from "@mui/material";
type Hit = { source: string; page: number; score: number; text: string };

export default function CitationCard({ hit }: { hit: Hit }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {hit.source} — p.{hit.page}
      </Typography>
      <Typography variant="body2" sx={{ mt: .5 }}>{hit.text}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: .5, display: "block" }}>
        score {hit.score?.toFixed?.(3) ?? "—"}
      </Typography>
    </Paper>
  );
}
