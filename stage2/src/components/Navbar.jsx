import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { label: "All Notifications", path: "/", icon: <NotificationsIcon sx={{ fontSize: 18 }} /> },
    { label: "Priority Inbox", path: "/priority", icon: <StarIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
          <NotificationsIcon sx={{ color: "#fff", fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}
          >
            CampusNotify
          </Typography>
        </Box>

        {/* Nav Links */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                variant={isActive ? "contained" : "text"}
                sx={{
                  color: "#fff",
                  fontWeight: isActive ? 700 : 400,
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "0.9rem",
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
