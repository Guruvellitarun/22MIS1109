import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Slider,
  Paper,
  Alert,
  Skeleton,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { fetchNotifications } from "../utils/api";
import { getTopNNotifications } from "../utils/priorityUtils";
import NotificationCard from "./NotificationCard";

// ─── Type color mapping for the legend ───────────────────────────────────
const TYPE_COLORS = {
  Placement: { color: "success", label: "Placement (Weight: 3)" },
  Result: { color: "warning", label: "Result (Weight: 2)" },
  Event: { color: "info", label: "Event (Weight: 1)" },
};

function CardSkeleton() {
  return (
    <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width="40%" />
          <Skeleton width="80%" />
        </Box>
      </Box>
    </Paper>
  );
}

export default function PriorityInbox() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Viewed state — persisted to localStorage
  const [viewedIds, setViewedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("viewedIds") || "[]"));
    } catch {
      return new Set();
    }
  });

  // ─── Fetch ALL notifications (no limit/page) once ────────────────────
  // The priority scoring requires access to the full dataset
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { notifications } = await fetchNotifications();
      setAllNotifications(notifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ─── Compute priority list whenever allNotifications or topN changes ──
  const priorityList = getTopNNotifications(allNotifications, topN);

  // ─── Mark as viewed ───────────────────────────────────────────────────
  const markAsViewed = useCallback((id) => {
    setViewedIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      localStorage.setItem("viewedIds", JSON.stringify([...updated]));
      return updated;
    });
  }, []);

  const unreadCount = priorityList.filter((n) => !viewedIds.has(n.ID)).length;

  // Breakdown by type
  const typeBreakdown = priorityList.reduce((acc, n) => {
    acc[n.Type] = (acc[n.Type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            Priority Inbox
          </Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} unread`} color="primary" size="small" />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Top notifications ranked by type weight and recency.
          Placement &gt; Result &gt; Event.
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Show top notifications
          </Typography>
          <Chip
            icon={<StarIcon sx={{ fontSize: "16px !important" }} />}
            label={`Top ${topN}`}
            color="primary"
            size="small"
          />
        </Box>
        <Slider
          value={topN}
          min={5}
          max={Math.max(20, allNotifications.length)}
          step={5}
          marks={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 15, label: "15" },
            { value: 20, label: "20" },
          ]}
          onChange={(_, val) => setTopN(val)}
          valueLabelDisplay="auto"
          color="primary"
          sx={{ mt: 1 }}
        />

        {/* Type legend */}
        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
          {Object.entries(TYPE_COLORS).map(([type, { color, label }]) => (
            <Tooltip key={type} title={label} arrow>
              <Chip
                label={`${type}: ${typeBreakdown[type] || 0}`}
                color={color}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          ))}
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Priority algorithm note */}
      {!loading && !error && (
        <Paper
          variant="outlined"
          sx={{ p: 1.5, mb: 2, backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", gap: 1 }}
        >
          <StarIcon sx={{ color: "#ffd700", fontSize: 18 }} />
          <Typography variant="caption" color="text.secondary">
            Score = TypeWeight × 10¹³ + Timestamp (ms). Gold badges = top 3.
          </Typography>
        </Paper>
      )}

      {/* Notification Cards */}
      <Box>
        {loading ? (
          Array.from({ length: topN }).map((_, i) => <CardSkeleton key={i} />)
        ) : priorityList.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No notifications available.
            </Typography>
          </Paper>
        ) : (
          priorityList.map((notif) => (
            <NotificationCard
              key={notif.ID}
              notification={notif}
              isViewed={viewedIds.has(notif.ID)}
              onView={markAsViewed}
              rank={notif.rank}
            />
          ))
        )}
      </Box>
    </Container>
  );
}
