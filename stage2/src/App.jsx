import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import Navbar from "./components/Navbar";
import AllNotifications from "./components/AllNotifications";
import PriorityInbox from "./components/PriorityInbox";

// ─── MUI Theme ──────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    background: { default: "#f0f4f8", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Box sx={{ pt: "72px", minHeight: "100vh" }}>
        <Routes>
          <Route path="/" element={<AllNotifications />} />
          <Route path="/priority" element={<PriorityInbox />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}
