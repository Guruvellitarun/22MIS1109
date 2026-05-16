/**
 * Stage 1 - Priority Inbox
 * Author: Guruvelli Tarun | 22MIS1109
 * 
 * Approach:
 *  - Fetch notifications from the API
 *  - Assign a numeric priority score to each notification based on:
 *      1. Type weight  : Placement (3) > Result (2) > Event (1)
 *      2. Recency      : More recent = higher score
 *  - Score formula: score = typeWeight * 1e13 + timestampMs
 *    (This ensures type is the primary sort key; recency breaks ties)
 *  - Use a Min-Heap of fixed size N to maintain top-N efficiently
 *    as new notifications stream in — O(log N) per insertion.
 */

// ─── Priority Weights ──────────────────────────────────────────────────────
const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ─── Min-Heap (fixed size N) ───────────────────────────────────────────────
// We keep a min-heap so that the weakest notification sits at the root.
// When a new notification arrives, if its score > root score, we replace root.
// This maintains top-N in O(log N) per notification.

class MinHeap {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0]; // smallest score (weakest of the top-N)
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.heap[l].score < this.heap[smallest].score) smallest = l;
      if (r < n && this.heap[r].score < this.heap[smallest].score) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

// ─── Priority Score Calculation ────────────────────────────────────────────

function getPriorityScore(notification) {
  const typeWeight = TYPE_WEIGHTS[notification.Type] || 0;
  const timestampMs = new Date(notification.Timestamp).getTime();
  // typeWeight is the dominant factor; recency (timestampMs) breaks ties
  return typeWeight * 1e13 + timestampMs;
}

// ─── Get Top-N using Min-Heap ──────────────────────────────────────────────
// Efficient for streaming: O(M log N) where M = total notifications, N = topN

function getTopNNotifications(notifications, n = 10) {
  const heap = new MinHeap();

  for (const notif of notifications) {
    const scored = { ...notif, score: getPriorityScore(notif) };

    if (heap.size < n) {
      heap.push(scored);
    } else if (scored.score > heap.peek().score) {
      // New notification beats the weakest in our top-N → replace
      heap.pop();
      heap.push(scored);
    }
  }

  // Extract all items and sort descending (highest priority first)
  const result = [];
  while (heap.size > 0) {
    result.push(heap.pop());
  }

  return result.sort((a, b) => b.score - a.score);
}

// ─── API Fetch ─────────────────────────────────────────────────────────────

async function fetchNotifications() {
  // Replace with your actual API token from the Pre-Test Setup document
  const API_TOKEN = process.env.API_TOKEN || "YOUR_API_TOKEN_HERE";
  const API_URL = "http://4.224.186.213/evaluation-service/notifications";

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch notifications. Status: ${response.status}`
    );
  }

  const data = await response.json();
  return data.notifications || [];
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  try {
    console.log("📡 Fetching notifications from API...\n");
    const notifications = await fetchNotifications();
    console.log(`✅ Total notifications received: ${notifications.length}\n`);

    const TOP_N = 10;
    const topNotifications = getTopNNotifications(notifications, TOP_N);

    console.log(`🏆 TOP ${TOP_N} PRIORITY NOTIFICATIONS`);
    console.log("=".repeat(60));

    topNotifications.forEach((notif, index) => {
      const typeLabel = `[${notif.Type.toUpperCase()}]`.padEnd(12);
      console.log(`\n${index + 1}. ${typeLabel} ${notif.Message}`);
      console.log(`   🕐 Timestamp : ${notif.Timestamp}`);
      console.log(`   📊 Score     : ${notif.score.toExponential(4)}`);
      console.log(`   🆔 ID        : ${notif.ID}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("Done.\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
