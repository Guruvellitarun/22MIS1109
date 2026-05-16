/**
 * API utility — all HTTP calls to the Affordmed notification service.
 * The Bearer token is read from the .env file (VITE_API_TOKEN).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://4.224.186.213";
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "";

const ENDPOINT = `${BASE_URL}/evaluation-service/notifications`;

/**
 * Builds auth headers required by the protected API route.
 */
function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
  };
}

/**
 * Fetches all notifications with optional filters.
 *
 * @param {object} params
 * @param {number} [params.limit]            - Number of results per page
 * @param {number} [params.page]             - Page number
 * @param {string} [params.notification_type] - "Event" | "Result" | "Placement"
 * @returns {Promise<{ notifications: Array, total: number }>}
 */
export async function fetchNotifications({ limit, page, notification_type } = {}) {
  // Build query string from provided params only
  const params = new URLSearchParams();
  if (limit !== undefined) params.append("limit", limit);
  if (page !== undefined) params.append("page", page);
  if (notification_type) params.append("notification_type", notification_type);

  const url = params.toString() ? `${ENDPOINT}?${params}` : ENDPOINT;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const message = `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  return {
    notifications: data.notifications || [],
    total: data.total || (data.notifications || []).length,
  };
}
