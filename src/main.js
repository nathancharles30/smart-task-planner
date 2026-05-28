import "./style.css";
import { buildDaySchedule } from "./js/engine/scheduler.js";
const SCHEDULER_SETTINGS = {
  workStartISO: "2026-01-01T09:00:00",
  workEndISO: "2026-01-01T17:00:00"
};
const STORAGE_KEY = "smart-task-planner-v1";

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistState() {
  const data = {
    tasks: state.tasks,
    schedule: state.schedule
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


/* ================= STATE ================= */

const persisted = loadPersistedState();

const state = {
  tasks: persisted?.tasks ?? [],
  schedule: persisted?.schedule ?? null
};


const app = document.getElementById("app");

/* ================= UTIL ================= */

function uid() {
  return crypto.randomUUID();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function renderTimeline(schedule, tasks) {
  if (!schedule || schedule.length === 0) {
    return "<p>(nothing scheduled)</p>";
  }

  // Build lookup for task titles
  const byId = new Map(tasks.map(t => [t.id, t.title]));

  // Workday bounds (must match scheduler)
  const dayStart = new Date(schedule[0].startISO);
  dayStart.setHours(9, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setHours(17, 0, 0, 0);

  const totalMs = dayEnd - dayStart;

  return `
    <div class="timeline">
      ${schedule.map(block => {
        const start = new Date(block.startISO);
        const end = new Date(block.endISO);

        const offsetPct = ((start - dayStart) / totalMs) * 100;
        const widthPct = ((end - start) / totalMs) * 100;

        return `
          <div class="timeline-row">
            <span class="time">${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>

            <div class="timeline-bar">
              <div
                class="timeline-task"
                style="left:${offsetPct}%; width:${widthPct}%"
              >
                ${escapeHtml(byId.get(block.taskId) ?? "Task")}
              </div>
            </div>

            <span class="time">${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}


function renderUnscheduled(unscheduled, tasks) {
  if (!unscheduled || unscheduled.length === 0) {
    return "<p>(all tasks scheduled)</p>";
  }

  const byId = new Map(tasks.map(t => [t.id, t]));

  return `
    <ul class="unscheduledList">
      ${unscheduled.map(u => {
        const task = byId.get(u.taskId);
        const title = task ? task.title : u.taskId;

        return `
          <li class="unscheduledItem">
            <strong>${title}</strong>
            <div class="unscheduledReason">
              ${u.reasonCode}: ${u.message}
            </div>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}


/* ================= RENDER ================= */

function render() {
 persistState(); 
  app.innerHTML = `
    <div class="container">
      <h1>Smart Task Planner</h1>

      <section class="card">
        <h2>Add Task</h2>
        <form id="taskForm">
  <input name="title" placeholder="Task title" required />

  <input
    name="duration"
    type="number"
    min="1"
    placeholder="Minutes"
    required
  />

  <label>Deadline (today)</label>
  <input
    name="deadline"
    type="time"
    required
  />

  <button type="submit">Add Task</button>
</form>

      </section>

      <section class="card">
  <h2>Tasks</h2>

  ${state.tasks.length === 0 ? "<p>(no tasks)</p>" : `
    <ul id="taskList">
      ${state.tasks.map(t => `
        <li>
          <strong>${escapeHtml(t.title)}</strong>
          (${t.durationMins} mins)
          <button data-del="${t.id}">Delete</button>
        </li>
      `).join("")}
    </ul>
  `}

  <div class="actions">
    <button id="generateBtn">Generate Schedule</button>
    <button id="clearBtn">Clear Tasks</button>
  </div>
</section>


      <section class="card">
  <h2>Schedule</h2>
 <div id="scheduleView">
  ${
    state.schedule
      ? renderTimeline(
          state.schedule.schedule ?? state.schedule,
          state.tasks
        )
      : "(generate schedule)"
  }
</div>

</section>

<section class="card">
  <h2>Unscheduled Tasks</h2>
  <div id="unscheduledView">
    ${
      state.schedule
        ? renderUnscheduled(
            state.schedule.unscheduled ?? [],
            state.tasks
          )
        : "(generate schedule)"
    }
  </div>
</section>


  `;

  wireEvents();
}

/* ================= EVENTS ================= */

function wireEvents() {
  const root = document.querySelector(".container");
  if (!root) return;

  /* ---------- ADD TASK ---------- */
  root.addEventListener("submit", e => {
    if (e.target.id !== "taskForm") return;

    e.preventDefault();
    const data = new FormData(e.target);

    const time = data.get("deadline");
    const today = new Date();
    const [h, m] = time.split(":").map(Number);
    today.setHours(h, m, 0, 0);

    state.tasks.push({
      id: crypto.randomUUID(),
      title: data.get("title"),
      durationMins: Number(data.get("duration")),
      deadlineISO: today.toISOString(),
      priority: 3,
      timePreference: "any",
      dependsOn: []
    });

    e.target.reset();
    render();
  });

  /* ---------- DELETE TASK ---------- */
  root.addEventListener("click", e => {
    const delId = e.target.dataset.del;
    if (!delId) return;

    state.tasks = state.tasks.filter(t => t.id !== delId);
    render();
  });

  /* ---------- GENERATE SCHEDULE ---------- */
  root.addEventListener("click", e => {
    if (e.target.id !== "generateBtn") return;

    const today = new Date();

const workStart = new Date(today);
workStart.setHours(9, 0, 0, 0);

const workEnd = new Date(today);
workEnd.setHours(17, 0, 0, 0);

const dayWindow = {
  workStartISO: workStart.toISOString(),
  workEndISO: workEnd.toISOString(),
};

const result = buildDaySchedule(state.tasks, dayWindow);

    state.schedule = result;
    render();
  });

  /* ---------- CLEAR TASKS ---------- */
  root.addEventListener("click", e => {
    if (e.target.id !== "clearBtn") return;

    state.tasks = [];
    state.schedule = null;
    render();
  });
}


/* ================= START ================= */

render();
