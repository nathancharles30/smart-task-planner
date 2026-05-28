import { buildDayBounds } from "./constraints.js";

const DEFAULT_SCHEDULER_OPTIONS = {
  backtrackDepth: 3,
  maxAttempts: 500,
  allowOverDeadline: false
};

/* -------------------- EXPLANATIONS -------------------- */

function explain(taskId, reasonCode, message) {
  return { taskId, reasonCode, message };
}

/* -------------------- MAIN SCHEDULER -------------------- */

export function buildDaySchedule(tasks, dayWindow, settings = {}) {
  if (!dayWindow) {
    throw new Error("Invalid work-day bounds");
  }

  const bounds = buildDayBounds(dayWindow);
  const options = { ...DEFAULT_SCHEDULER_OPTIONS, ...settings };

  const schedule = [];
  const unscheduled = [];
  const explanations = [];

  let cursor = bounds.workStartMs;

  /* -------------------- VALIDATION -------------------- */

  const validTasks = [];

  for (const task of tasks) {
    if (!task.deadlineISO || isNaN(Date.parse(task.deadlineISO))) {
      unscheduled.push({
        taskId: task.id,
        reasonCode: "INVALID_DEADLINE",
        message: "Deadline must be a valid ISO date/time."
      });
      continue;
    }

    if (!task.durationMins || task.durationMins <= 0) {
      unscheduled.push({
        taskId: task.id,
        reasonCode: "INVALID_DURATION",
        message: "Duration must be greater than zero."
      });
      continue;
    }

    validTasks.push(task);
  }

  /* -------------------- SORT BY DEADLINE -------------------- */

  validTasks.sort(
    (a, b) => Date.parse(a.deadlineISO) - Date.parse(b.deadlineISO)
  );

  /* -------------------- SCHEDULING LOOP -------------------- */

  for (const task of validTasks) {
    const durationMs = task.durationMins * 60 * 1000;
    const deadlineMs = Date.parse(task.deadlineISO);

    const startMs = cursor;
    const endMs = startMs + durationMs;

    /* ---- FAILURE: exceeds workday ---- */
    if (endMs > bounds.workEndMs) {
      unscheduled.push({
        taskId: task.id,
        reasonCode: "OUT_OF_WORK_HOURS",
        message: "Task does not fit within working hours."
      });

      explanations.push(
        explain(
          task.id,
          "INSUFFICIENT_TIME",
          "Not enough continuous free time before the end of the workday."
        )
      );
      continue;
    }

    /* ---- FAILURE: exceeds deadline ---- */
    if (!options.allowOverDeadline && endMs > deadlineMs) {
      unscheduled.push({
        taskId: task.id,
        reasonCode: "INSUFFICIENT_TIME",
        message: "Not enough continuous free time before the deadline."
      });

      explanations.push(
        explain(
          task.id,
          "INSUFFICIENT_TIME",
          "Not enough continuous free time before the deadline."
        )
      );
      continue;
    }

    /* ---- SUCCESS ---- */
    schedule.push({
      taskId: task.id,
      title: task.title,
      startISO: new Date(startMs).toISOString(),
      endISO: new Date(endMs).toISOString()
    });

    cursor = endMs;
  }

  /* -------------------- RESULT -------------------- */

  return {
    schedule,
    unscheduled,
    explanations
  };
}
