// src/selectors.js

export function selectFilteredTasks(state) {
  let tasks = [...state.tasks];

  // text search
  if (state.filters.q) {
    const q = state.filters.q.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q));
  }

  // minimum priority
  if (state.filters.minPriority) {
    tasks = tasks.filter(t => t.priority >= state.filters.minPriority);
  }

  // show blocked only (after scheduling)
  if (state.filters.showBlocked && state.lastResult?.unscheduled) {
    const blockedIds = new Set(state.lastResult.unscheduled.map(u => u.taskId));
    tasks = tasks.filter(t => blockedIds.has(t.id));
  }

  return tasks;
}

export function selectAnalytics(state) {
  const totalTasks = state.tasks.length;

  const scheduledMins = state.lastResult?.schedule
    ? state.lastResult.schedule.reduce((sum, s) => sum + s.durationMins, 0)
    : 0;

  const blocked = state.lastResult?.unscheduled?.length ?? 0;

  const queuedOps = state.syncQueue.length;

  return {
    totalTasks,
    scheduledMins,
    blocked,
    queuedOps
  };
}
