// js/engine/intervals.js

/**
 * Build free intervals for the day = [workStart,workEnd] minus breaks.
 * @returns {{startMs:number,endMs:number}[]}
 */
export function buildFreeIntervals(workStartMs, workEndMs, breaksIntervals) {
  let free = [{ startMs: workStartMs, endMs: workEndMs }];
  for (const br of (breaksIntervals ?? [])) {
    free = subtractIntervalList(free, br);
  }
  return normalizeIntervals(free);
}

/**
 * Recompute free intervals from scratch: day bounds minus all scheduled items and breaks.
 * Simplest and safest (and fine for this scale).
 */
export function recomputeFreeFromSchedule(dayBounds, schedule) {
  let free = buildFreeIntervals(dayBounds.workStartMs, dayBounds.workEndMs, dayBounds.breaksIntervals);
  for (const si of schedule) {
    const used = { startMs: Date.parse(si.startISO), endMs: Date.parse(si.endISO) };
    free = subtractIntervalList(free, used);
  }
  return normalizeIntervals(free);
}

function subtractIntervalList(list, cut) {
  const out = [];
  for (const iv of list) {
    // no overlap
    if (cut.endMs <= iv.startMs || cut.startMs >= iv.endMs) {
      out.push(iv);
      continue;
    }
    // left remainder
    if (cut.startMs > iv.startMs) {
      out.push({ startMs: iv.startMs, endMs: cut.startMs });
    }
    // right remainder
    if (cut.endMs < iv.endMs) {
      out.push({ startMs: cut.endMs, endMs: iv.endMs });
    }
  }
  return out;
}

function normalizeIntervals(list) {
  return list
    .filter(iv => iv.endMs > iv.startMs)
    .sort((a, b) => a.startMs - b.startMs);
}
