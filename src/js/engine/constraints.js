// constraints.js

export function buildDayBounds() {
  const now = new Date();

  const start = new Date(now);
  start.setHours(9, 0, 0, 0);

  const end = new Date(now);
  end.setHours(17, 0, 0, 0);

  const workStartMs = start.getTime();
  const workEndMs = end.getTime();

  if (!Number.isFinite(workStartMs) || !Number.isFinite(workEndMs)) {
    console.error("buildDayBounds failed", { workStartMs, workEndMs });
  }

  return {
    workStartMs,
    workEndMs,
    breaks: []
  };
}
