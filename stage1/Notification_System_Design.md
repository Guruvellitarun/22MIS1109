# Stage 1 — Notification Priority Inbox: System Design

**Author:** Guruvelli Tarun | 22MIS1109  
**Email:** guruvelli.tarun2022@vitstudent.ac.in

---

## Problem Statement

Users lose track of important notifications due to high volume. We need a
**Priority Inbox** that always surfaces the top-N most important **unread**
notifications first. Priority is determined by:

1. **Type Weight** — Placement > Result > Event
2. **Recency** — More recent notifications rank higher within the same type

---

## Approach

### Priority Score Formula

```
score = typeWeight × 10¹³ + timestampMs
```

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

- `typeWeight × 10¹³` ensures type is the **dominant** factor
- `timestampMs` (Unix milliseconds) breaks ties within the same type — more recent = higher score

---

## Data Structure: Min-Heap of Fixed Size N

### Why a Min-Heap?

- A **Min-Heap of size N** lets us maintain the top-N notifications efficiently
- The **root** always holds the *weakest* notification in our top-N
- For each new notification:
  - If `heap.size < N` → push directly
  - Else if `newScore > heap.root.score` → pop weakest, push new one
- **Time Complexity:** O(M log N) where M = total notifications, N = top count
- **Space Complexity:** O(N) — only stores top-N at any time

### Comparison with Alternatives

| Approach              | Time         | Space | Streaming? |
|-----------------------|--------------|-------|------------|
| Sort all (naïve)      | O(M log M)   | O(M)  | ❌ No       |
| Min-Heap (chosen)     | O(M log N)   | O(N)  | ✅ Yes      |
| Partial QuickSelect   | O(M) avg     | O(M)  | ❌ No       |

---

## Handling Continuous/Streaming Notifications

When **new notifications keep coming in**, we do NOT re-sort the entire dataset.

```
For each incoming notification:
  score = computeScore(notification)
  if heap.size < N:
    heap.push(notification)
  else if score > heap.peek().score:
    heap.pop()            // evict weakest from top-N
    heap.push(notification)  // add new high-priority one
```

This runs in **O(log N)** per new notification — constant regardless of
how many total notifications exist.

---

## API Integration

- **Endpoint:** `GET http://4.224.186.213/evaluation-service/notifications`
- **Auth:** Bearer token (from Pre-Test Setup)
- **No DB storage required** — scores computed in-memory on each fetch

---

## Output

Top-10 notifications printed to console, ordered by priority score descending.
For same type, more recent notification appears first.
