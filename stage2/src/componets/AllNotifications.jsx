import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  Skeleton,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { fetchNotifications } from "../utils/api";
import NotificationCard from "./NotificationCard";

const ITEMS_PER_PAGE = 5;
const NOTIFICATION_TYPES = ["All", "Placement", "Result", "Event"];

// ─── Skeleton loader for cards ───────────────────────────────────────────
function CardSkeleton() {
  return (
    <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width="40%" />
          <Skeleton width="80%" />
        </Box>
      </Box>
    </Paper>
  );
}

export default function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("All");
  const [totalPages, setTotalPages] = useState(1);

  // Viewed notifications stored in localStorage for persistence
  const [viewedIds, setViewedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("viewedIds") || "[]"));
    } catch {
      return new Set();
    }
  });

  // ─── Fetch notifications whenever page or filter changes ───────────────
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: ITEMS_PER_PAGE,
        page,
        ...(typeFilter !== "All" && { notification_type: typeFilter }),
      };
      const { notifications: data, total } = await fetchNotifications(params);
      setNotifications(data);
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE) || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [typeFilter]);

  // ─── Mark notification as viewed ───────────────────────────────────────
  const markAsViewed = useCallback((id) => {
    setViewedIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      localStorage.setItem("viewedIds", JSON.stringify([...updated]));
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter((n) => !viewedIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <NotificationsIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            All Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Click a notification to mark it as read.
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={typeFilter}
            label="Filter by Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {NOTIFICATION_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          Page {page} of {totalPages}
        </Typography>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Notification List */}
      <Box>
        {loading ? (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : notifications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No notifications found.</Typography>
          </Paper>
        ) : (
          notifications.map((notif) => (
            <NotificationCard
              key={notif.ID}
              notification={notif}
              isViewed={viewedIds.has(notif.ID)}
              onView={markAsViewed}
            />
          ))
        )}
      </Box>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Container>
  );
}
