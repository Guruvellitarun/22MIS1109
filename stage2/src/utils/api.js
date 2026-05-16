// Use /api proxy in browser to avoid CORS — Vite rewrites to http://4.224.186.213
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "";
const ENDPOINT = "/api/evaluation-service/notifications";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
  };
}

export async function fetchNotifications({ limit, page, notification_type } = {}) {
  const params = new URLSearchParams();
  if (limit !== undefined) params.append("limit", limit);
  if (page !== undefined) params.append("page", page);
  if (notification_type) params.append("notification_type", notification_type);
  const url = params.toString() ? `${ENDPOINT}?${params}` : ENDPOINT;

  const response = await fetch(url, { method: "GET", headers: getHeaders() });
  if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
  const data = await response.json();
  return {
    notifications: data.notifications || [],
    total: data.total || (data.notifications || []).length,
  };
}
