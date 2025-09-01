import { AppBar, Toolbar, Typography, IconButton, Stack, Tooltip } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DescriptionIcon from "@mui/icons-material/Description";
import { useTheme } from "@mui/material/styles";
import { useColorMode } from "../theme";

export default function Header() {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const isDark = theme.palette.mode === "dark";

  return (
    <AppBar elevation={0} position="sticky" color="transparent"
      sx={{ backdropFilter: "blur(8px)", borderBottom: "1px solid", borderColor: "divider" }}>
      <Toolbar sx={{ maxWidth: 1100, mx: "auto", width: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>PDF Chat Studio</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleColorMode} size="small">
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="GitHub">
            <IconButton href="https://github.com/your/repo" target="_blank" size="small">
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
