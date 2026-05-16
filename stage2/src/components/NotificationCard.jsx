import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";
import StarIcon from "@mui/icons-material/Star";
import FiberNewIcon from "@mui/icons-material/FiberNew";

// ─── Config: visual styles per notification type ─────────────────────────
const TYPE_CONFIG = {
  Placement: {
    color: "success",
    bgColor: "#e8f5e9",
    borderColor: "#4caf50",
    icon: <WorkIcon fontSize="small" />,
    label: "Placement",
  },
  Result: {
    color: "warning",
    bgColor: "#fff3e0",
    borderColor: "#ff9800",
    icon: <AssignmentIcon fontSize="small" />,
    label: "Result",
  },
  Event: {
    color: "info",
    bgColor: "#e3f2fd",
    borderColor: "#2196f3",
    icon: <EventIcon fontSize="small" />,
    label: "Event",
  },
};

/**
 * Formats a timestamp string to a human-readable relative time.
 * e.g. "2026-04-22 17:51:30" → "2 hours ago"
 */
function formatRelativeTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * NotificationCard
 *
 * Props:
 *  - notification : { ID, Type, Message, Timestamp }
 *  - isViewed     : boolean — whether user has already opened this notification
 *  - onView       : function — called when the card is clicked (marks as viewed)
 *  - rank         : number | null — priority rank badge (shown in Priority Inbox)
 */
export default function NotificationCard({
  notification,
  isViewed,
  onView,
  rank = null,
}) {
  const { ID, Type, Message, Timestamp } = notification;
  const config = TYPE_CONFIG[Type] || TYPE_CONFIG.Event;

  return (
    <Card
      onClick={() => onView(ID)}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        borderLeft: `4px solid ${config.borderColor}`,
        backgroundColor: isViewed ? "#fafafa" : config.bgColor,
        opacity: isViewed ? 0.75 : 1,
        position: "relative",
        transition: "all 0.2s ease",
      }}
    >
      <CardContent sx={{ py: "12px !important", px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Priority rank badge */}
          {rank && (
            <Tooltip title={`Priority Rank #${rank}`} arrow>
              <Box
                sx={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: rank <= 3 ? "#ffd700" : "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: rank <= 3 ? "#7b5e00" : "#555",
                  flexShrink: 0,
                  mt: 0.3,
                }}
              >
                #{rank}
              </Box>
            </Tooltip>
          )}

          {/* Main content */}
          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                mb: 0.5,
              }}
            >
              <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              {!isViewed && (
                <Chip
                  icon={<FiberNewIcon fontSize="small" />}
                  label="New"
                  size="small"
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    fontSize: "0.7rem",
                    height: 20,
                    "& .MuiChip-icon": { color: "#fff" },
                  }}
                />
              )}
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", ml: "auto" }}
              >
                {formatRelativeTime(Timestamp)}
              </Typography>
            </Box>

            {/* Message */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: isViewed ? 400 : 600,
                color: isViewed ? "text.secondary" : "text.primary",
                textTransform: "capitalize",
              }}
            >
              {Message}
            </Typography>

            {/* Full timestamp */}
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              {Timestamp}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
