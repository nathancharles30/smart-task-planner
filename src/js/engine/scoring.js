// js/engine/scoring.js

/**
 * Compute factors used in scoring: urgency, slack, etc.
 * @returns {Record<string,{urgencyHours:number, slackMins:number, priority:number}>}
 */
export function computeFactors(tasks, dayBounds, settings) {
  const nowMs = Date.now();
  const out = {};
  for (const t of tasks) {
    const deadlineMs = Date.parse(t.deadlineISO);
    const urgencyHours = Math.max(0.1, (deadlineMs - nowMs) / 3_600_000);

    const earliestMs = t.earliestStartISO ? Date.parse(t.earliestStartISO) : dayBounds.workStartMs;
    const latestMs = t.latestEndISO ? Date.parse(t.latestEndISO) : dayBounds.workEndMs;
    const hardEnd = Math.min(deadlineMs, latestMs, dayBounds.workEndMs);
    const hardStart = Math.max(earliestMs, dayBounds.workStartMs);
    const slackMins = Math.max(0, (hardEnd - hardStart) / 60_000 - t.durationMins);

    out[t.id] = { urgencyHours, slackMins, priority: t.priority };
  }
  return out;
}

/**
 * Score: higher is better.
 */
export function scoreTask(task, factors, weights) {
  const w = weights ?? { priority: 1, urgency: 1, slack: 1 };

  const priorityTerm = (factors.priority ?? task.priority ?? 1) * w.priority;

  // urgency: inverse (closer deadline => higher)
  const urgencyTerm = (1 / (factors.urgencyHours ?? 1)) * w.urgency;

  // slack: tighter windows => higher (inverse)
  const slack = Math.max(1, factors.slackMins ?? 1);
  const slackTerm = (1 / slack) * w.slack;

  return priorityTerm + urgencyTerm + slackTerm;
}

export function sortByScoreDesc(arr, scoreFn) {
  return [...arr].sort((a, b) => scoreFn(b) - scoreFn(a));
}
