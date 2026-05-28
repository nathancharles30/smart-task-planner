// js/engine/explanations.js

export function buildExplanation(task, factors, placement) {
  const chosenBecause = [];

  if (task.priority >= 4) chosenBecause.push("High priority");
  if ((factors?.urgencyHours ?? 999) < 24) chosenBecause.push("Deadline within 24 hours");
  if ((factors?.slackMins ?? 9999) < 30) chosenBecause.push("Tight time window");

  return {
    taskId: task.id,
    factors: {
      priority: task.priority,
      urgencyHours: factors?.urgencyHours,
      slackMins: factors?.slackMins,
    },
    placement: {
      startISO: new Date(placement.startMs).toISOString(),
      endISO: new Date(placement.endMs).toISOString(),
    },
    chosenBecause,
  };
}
