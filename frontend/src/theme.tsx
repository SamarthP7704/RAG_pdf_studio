import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

type Ctx = { toggleColorMode: () => void };
const ColorModeContext = createContext<Ctx>({ toggleColorMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">(
    () => (localStorage.getItem("mode") as "light" | "dark") || "light"
  );

  useEffect(() => { localStorage.setItem("mode", mode); }, [mode]);

  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode(m => (m === "light" ? "dark" : "light")) }),
    []
  );

  const theme = useMemo(
    () => createTheme({
      palette: { mode },
      shape: { borderRadius: 14 },
      typography: {
        fontFamily: `"InterVariable", Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
      },
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
