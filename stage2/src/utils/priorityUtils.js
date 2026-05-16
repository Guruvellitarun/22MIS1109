/**
 * Priority scoring utilities — same Min-Heap logic as Stage 1.
 * Used by the PriorityInbox component in Stage 2.
 */

const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Compute a numeric priority score for a notification.
 * Higher score = more important.
 *
 * Formula: typeWeight * 1e13 + timestampMs
 * - Type is the dominant factor
 * - Recency breaks ties within the same type
 */
export function getPriorityScore(notification) {
  const typeWeight = TYPE_WEIGHTS[notification.Type] || 0;
  const timestampMs = new Date(notification.Timestamp).getTime();
  return typeWeight * 1e13 + timestampMs;
}

/**
 * Min-Heap for maintaining top-N efficiently.
 * Root = weakest item in the current top-N.
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
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

/**
 * Returns the top-N notifications sorted by priority score (descending).
 * Uses a Min-Heap for O(M log N) efficiency.
 *
 * @param {Array}  notifications  - Full list of notification objects
 * @param {number} n              - How many top notifications to return
 * @returns {Array} Top-N notifications with `score` and `rank` added
 */
export function getTopNNotifications(notifications, n = 10) {
  const heap = new MinHeap();

  for (const notif of notifications) {
    const scored = { ...notif, score: getPriorityScore(notif) };
    if (heap.size < n) {
      heap.push(scored);
    } else if (scored.score > heap.peek().score) {
      heap.pop();
      heap.push(scored);
    }
  }

  // Drain heap and sort descending
  const result = [];
  while (heap.size > 0) result.push(heap.pop());

  return result
    .sort((a, b) => b.score - a.score)
    .map((notif, index) => ({ ...notif, rank: index + 1 }));
}
